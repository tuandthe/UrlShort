package com.onluyen.url_shortener_backend.storage.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import com.onluyen.url_shortener_backend.user.entity.Role;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StorageAuthorizationService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;

    public void assertAdmin(String userEmail) {
        User user = getUserByEmail(userEmail);
        if (user.getRole() != Role.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    public void assertCanAccessFileKey(String fileKey, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (user.getRole() == Role.ADMIN) {
            return;
        }

        String[] parts = parseFileKey(fileKey);
        String folder = parts[0];
        long ownerId = parseOwnerId(parts[1]);

        switch (folder) {
            case AppConstant.STORAGE_FOLDER_AVATARS -> {
                if (!user.getId().equals(ownerId)) {
                    throw new BusinessException(ErrorCode.FORBIDDEN);
                }
            }
            case AppConstant.STORAGE_FOLDER_OG_IMAGES, AppConstant.STORAGE_FOLDER_QRCODES -> {
                Url url = urlRepository.findById(ownerId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.FORBIDDEN));

                if (url.getUser() == null || !url.getUser().getId().equals(user.getId())) {
                    throw new BusinessException(ErrorCode.FORBIDDEN);
                }
            }
            default -> throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private String[] parseFileKey(String rawFileKey) {
        if (rawFileKey == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "fileKey không hợp lệ");
        }

        String fileKey = rawFileKey.trim().replaceFirst("^/+", "");
        if (fileKey.isBlank() || fileKey.contains("..")) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "fileKey không hợp lệ");
        }

        String[] parts = fileKey.split("/");
        if (parts.length < 3) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "fileKey không hợp lệ");
        }

        return parts;
    }

    private long parseOwnerId(String rawOwnerId) {
        try {
            return Long.parseLong(rawOwnerId);
        } catch (NumberFormatException exception) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "fileKey không hợp lệ");
        }
    }
}