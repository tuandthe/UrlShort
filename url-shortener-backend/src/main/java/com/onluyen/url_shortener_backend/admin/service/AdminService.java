package com.onluyen.url_shortener_backend.admin.service;

import com.onluyen.url_shortener_backend.admin.dto.AdminUrlResponse;
import com.onluyen.url_shortener_backend.admin.dto.AdminUserResponse;
import com.onluyen.url_shortener_backend.analytics.repository.ClickEventRepository;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final StringRedisTemplate redisTemplate;
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_INACTIVE = "INACTIVE";
    private static final String GROUP_BY_WEEK = "WEEK";
    private static final String GROUP_BY_MONTH = "MONTH";
    private static final Set<String> ALLOWED_STATUS = Set.of(STATUS_ACTIVE, STATUS_INACTIVE);
    private static final Set<String> ALLOWED_GROUP_BY = Set.of(GROUP_BY_WEEK, GROUP_BY_MONTH);

    @Transactional(readOnly = true)
    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalUrls", urlRepository.count());
        stats.put("totalClicks", urlRepository.sumClickCount());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSystemClicksTrend(String groupBy) {
        String normalizedGroupBy = normalizeGroupBy(groupBy);

        List<ClickEventRepository.SystemClicksTrendProjection> projections = GROUP_BY_MONTH.equals(normalizedGroupBy)
                ? clickEventRepository.findSystemClicksByMonth()
                : clickEventRepository.findSystemClicksByWeek();

        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        DateTimeFormatter dayMonthFormatter = DateTimeFormatter.ofPattern("dd/MM");

        List<Map<String, Object>> response = new ArrayList<>();
        for (ClickEventRepository.SystemClicksTrendProjection projection : projections) {
            LocalDateTime periodStart = projection.getPeriodStart();
            String periodLabel = null;

            if (periodStart != null) {
                if (GROUP_BY_MONTH.equals(normalizedGroupBy)) {
                    periodLabel = periodStart.format(monthFormatter);
                } else {
                    LocalDate weekStart = periodStart.toLocalDate();
                    LocalDate weekEnd = weekStart.plusDays(6);
                    periodLabel = weekStart.format(dayMonthFormatter)
                            + "-" + weekEnd.format(dayMonthFormatter);
                }
            }

            Map<String, Object> item = new HashMap<>();
            item.put("periodStart", periodStart);
            item.put("period", periodLabel);
            item.put("clicks", projection.getClicks());
            response.add(item);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(Pageable pageable, String search, String status) {
        String normalizedStatus = normalizeStatus(status);
        Specification<User> specification = buildUserSpecification(search, normalizedStatus);

        return userRepository.findAll(specification, pageable)
                .map(user -> AdminUserResponse.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .role(user.getRole() != null ? user.getRole().name() : null)
                        .isActive(user.isActive())
                        .provider(user.getProvider() != null ? user.getProvider().name() : null)
                        .avatarUrl(user.getAvatarUrl())
                        .createdAt(user.getCreatedAt())
                        .build());
    }

    private Specification<User> buildUserSpecification(String search, String normalizedStatus) {
        Specification<User> specification = (root, query, cb) -> cb.conjunction();

        if (StringUtils.hasText(search)) {
            String keyword = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("email")), keyword),
                    cb.like(cb.lower(root.get("fullName")), keyword)));
        }

        if (!StringUtils.hasText(normalizedStatus)) {
            return specification;
        }

        return specification.and((root, query, cb) -> switch (normalizedStatus) {
            case STATUS_ACTIVE -> cb.isTrue(root.get("isActive"));
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
                    "Invalid status filter. Allowed values: ACTIVE, INACTIVE.");
        }

        return normalizedStatus;
    }

    private String normalizeGroupBy(String groupBy) {
        if (!StringUtils.hasText(groupBy)) {
            return GROUP_BY_WEEK;
        }

        String normalized = groupBy.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_GROUP_BY.contains(normalized)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    "Invalid groupBy value. Allowed values: week, month.");
        }

        return normalized;
    }

    @Transactional(readOnly = true)
    public Page<AdminUrlResponse> getUrls(Pageable pageable) {
        return urlRepository.findAll(pageable)
                .map(url -> AdminUrlResponse.builder()
                        .id(url.getId())
                        .shortCode(url.getShortCode())
                        .originalUrl(url.getOriginalUrl())
                        .isActive(url.isActive())
                        .clickCount(url.getClickCount())
                        .createdAt(url.getCreatedAt())
                        .ownerEmail(url.getUser() != null ? url.getUser().getEmail() : null)
                        .build());
    }

    @Transactional
    public void deactivateUser(Long userId, String actorEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.getEmail() != null && user.getEmail().equalsIgnoreCase(actorEmail)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, AppConstant.ERROR_MSG_CANNOT_DEACTIVATE_SELF);
        }

        if (!user.isActive()) {
            return;
        }

        user.setActive(false);
        userRepository.save(user);
        redisTemplate.delete(AppConstant.REDIS_REFRESH_TOKEN_PREFIX + user.getEmail());
    }

    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (user.isActive()) {
            return;
        }

        user.setActive(true);
        userRepository.save(user);
    }
}
