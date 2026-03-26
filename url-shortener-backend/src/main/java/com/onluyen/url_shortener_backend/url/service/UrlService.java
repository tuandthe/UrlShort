package com.onluyen.url_shortener_backend.url.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.storage.dto.FileUploadResponse;
import com.onluyen.url_shortener_backend.storage.service.StorageService;
import com.onluyen.url_shortener_backend.url.dto.CreateUrlRequest;
import com.onluyen.url_shortener_backend.url.dto.UpdateUrlRequest;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import com.onluyen.url_shortener_backend.url.strategy.ShortCodeGenerator;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlRepository;
    private final UserRepository userRepository;
    private final ShortCodeGenerator shortCodeGenerator;
    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, Object> redisTemplate;
    private final StorageService storageService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_INACTIVE = "INACTIVE";
    private static final String QR_FILE_NAME = "qr-code.png";
    private static final String QR_CONTENT_TYPE = "image/png";
    private static final int QR_WIDTH = 300;
    private static final int QR_HEIGHT = 300;
    private static final Set<String> ALLOWED_STATUS = Set.of(STATUS_ACTIVE, STATUS_EXPIRED, STATUS_INACTIVE);
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "clickCount", "expiresAt");

    @Transactional
    public Url createUrl(CreateUrlRequest request, String userEmail) {
        User user = null;
        if (userEmail != null) {
            user = userRepository.findByEmail(userEmail).orElse(null);
        }

        String shortCode;
        if (StringUtils.hasText(request.getCustomAlias())) {
            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new BusinessException(ErrorCode.SHORT_CODE_ALREADY_EXISTS);
            }
            shortCode = request.getCustomAlias();
        } else {
            shortCode = shortCodeGenerator.generate();
            // Retry mechanisms omitted for simplicity since Redis Counter guarantees
            // uniqueness.
        }

        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .user(user)
                .password(StringUtils.hasText(request.getPassword()) ? passwordEncoder.encode(request.getPassword())
                        : null)
                .expiresAt(request.getExpiresAt())
                .isActive(true)
                .build();

        Url savedUrl = urlRepository.save(url);
        attachQrCode(savedUrl);
        return savedUrl;
    }

    @Transactional(readOnly = true)
    public Page<Url> getUserUrls(
            String email,
            int page,
            int size,
            String search,
            String status,
            String sortBy,
            String sortDir) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String normalizedStatus = normalizeStatus(status);
        String normalizedSortBy = normalizeSortBy(sortBy);
        Sort.Direction direction = normalizeSortDirection(sortDir);

        Sort.Order order = Sort.Order.by(normalizedSortBy)
                .with(direction)
                .with(Sort.NullHandling.NULLS_LAST);
        Pageable pageable = PageRequest.of(page, size, Sort.by(order));

        Specification<Url> specification = buildUserUrlSpecification(user.getId(), search, normalizedStatus);

        return urlRepository.findAll(specification, pageable);
    }

    private Specification<Url> buildUserUrlSpecification(Long userId, String search, String normalizedStatus) {
        Specification<Url> specification = (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);

        if (StringUtils.hasText(search)) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("shortCode")), keyword),
                    cb.like(cb.lower(root.get("originalUrl")), keyword)));
        }

        if (normalizedStatus == null) {
            return specification;
        }

        LocalDateTime now = LocalDateTime.now();
        return specification.and((root, query, cb) -> switch (normalizedStatus) {
            case STATUS_ACTIVE -> cb.and(
                    cb.isTrue(root.get("isActive")),
                    cb.or(
                            cb.isNull(root.get("expiresAt")),
                            cb.greaterThanOrEqualTo(root.get("expiresAt"), now)));
            case STATUS_EXPIRED -> cb.and(
                    cb.isTrue(root.get("isActive")),
                    cb.isNotNull(root.get("expiresAt")),
                    cb.lessThan(root.get("expiresAt"), now));
            case STATUS_INACTIVE -> cb.isFalse(root.get("isActive"));
            default -> cb.conjunction();
        });
    }

    private String normalizeStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }

        String normalizedStatus = status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUS.contains(normalizedStatus)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Invalid status filter. Allowed values: ACTIVE, EXPIRED, INACTIVE.");
        }

        return normalizedStatus;
    }

    private String normalizeSortBy(String sortBy) {
        if (!StringUtils.hasText(sortBy)) {
            return "createdAt";
        }

        String normalizedSortBy = sortBy.trim();
        if (!ALLOWED_SORT_FIELDS.contains(normalizedSortBy)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Invalid sortBy field. Allowed values: createdAt, clickCount, expiresAt.");
        }

        return normalizedSortBy;
    }

    private Sort.Direction normalizeSortDirection(String sortDir) {
        String value = StringUtils.hasText(sortDir) ? sortDir.trim() : "desc";
        try {
            return Sort.Direction.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Invalid sortDir value. Allowed values: asc, desc.");
        }
    }

    @Transactional(readOnly = true)
    public Url getUrlDetail(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Url url = urlRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.URL_NOT_FOUND));

        if (url.getUser() == null || !url.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return url;
    }

    @Transactional
    public Url updateUrl(Long id, UpdateUrlRequest request, String email) {
        Url url = getUrlDetail(id, email); // Reuse validation logic

        if (StringUtils.hasText(request.getOriginalUrl())) {
            url.setOriginalUrl(request.getOriginalUrl());
        }

        if (request.getCustomAlias() != null && !request.getCustomAlias().isEmpty()) {
            if (!url.getShortCode().equals(request.getCustomAlias()) &&
                    urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new BusinessException(ErrorCode.SHORT_CODE_ALREADY_EXISTS);
            }
            url.setShortCode(request.getCustomAlias());
        }

        if (request.getPassword() != null) {
            if (request.getPassword().isEmpty()) {
                url.setPassword(null);
            } else {
                url.setPassword(passwordEncoder.encode(request.getPassword()));
            }
        }

        if (request.getExpiresAt() != null) {
            url.setExpiresAt(request.getExpiresAt());
        }

        if (request.getIsActive() != null) {
            url.setActive(request.getIsActive());
        }

        url = urlRepository.save(url);

        // Evict cache
        redisTemplate.delete(AppConstant.REDIS_URL_KEY_PREFIX + url.getShortCode());

        return url;
    }

    @Transactional
    public Url updateUrlPassword(Long id, String password, String email) {
        Url url = getUrlDetail(id, email);

        if (!StringUtils.hasText(password)) {
            url.setPassword(null);
        } else {
            url.setPassword(passwordEncoder.encode(password));
        }

        url = urlRepository.save(url);
        redisTemplate.delete(AppConstant.REDIS_URL_KEY_PREFIX + url.getShortCode());
        return url;
    }

    @Transactional
    public Url updateUrlExpiration(Long id, LocalDateTime expiresAt, String email) {
        Url url = getUrlDetail(id, email);
        url.setExpiresAt(expiresAt);

        url = urlRepository.save(url);
        redisTemplate.delete(AppConstant.REDIS_URL_KEY_PREFIX + url.getShortCode());
        return url;
    }

    @Transactional
    public void deleteUrl(Long id, String email) {
        Url url = getUrlDetail(id, email);

        url.setActive(false);
        urlRepository.save(url);

        // Evict cache
        redisTemplate.delete(AppConstant.REDIS_URL_KEY_PREFIX + url.getShortCode());
    }

    @Transactional
    public Url uploadOgImage(Long id, MultipartFile file, String email) {
        Url url = getUrlDetail(id, email);

        String folder = AppConstant.STORAGE_FOLDER_OG_IMAGES + "/" + url.getId();
        FileUploadResponse uploaded = storageService.upload(file, folder);
        String newFileKey = uploaded.getFileKey();
        String oldFileKey = url.getOgImageUrl();

        try {
            url.setOgImageUrl(newFileKey);
            Url updatedUrl = urlRepository.save(url);

            if (oldFileKey != null && !oldFileKey.isBlank() && !oldFileKey.equals(newFileKey)) {
                storageService.delete(oldFileKey);
            }

            return updatedUrl;
        } catch (RuntimeException exception) {
            storageService.delete(newFileKey);
            throw exception;
        }
    }

    private void attachQrCode(Url url) {
        String uploadedQrKey = null;

        try {
            byte[] qrCode = generateQrCode(buildShortUrl(url.getShortCode()));
            String folder = AppConstant.STORAGE_FOLDER_QRCODES + "/" + url.getId();
            FileUploadResponse uploaded = storageService.uploadBytes(qrCode, QR_FILE_NAME, QR_CONTENT_TYPE, folder);

            uploadedQrKey = uploaded.getFileKey();
            url.setQrCodeUrl(uploadedQrKey);
            urlRepository.save(url);
        } catch (RuntimeException exception) {
            if (uploadedQrKey != null && !uploadedQrKey.isBlank()) {
                storageService.delete(uploadedQrKey);
            }
            throw exception;
        }
    }

    private byte[] generateQrCode(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT);

            try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
                return outputStream.toByteArray();
            }
        } catch (WriterException | IOException exception) {
            throw new BusinessException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể tạo QR code cho URL");
        }
    }

    private String buildShortUrl(String shortCode) {
        return baseUrl.replaceAll("/$", "") + "/" + shortCode;
    }
}
