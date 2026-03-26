package com.onluyen.url_shortener_backend.user.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.notification.service.EmailService;
import com.onluyen.url_shortener_backend.storage.dto.FileUploadResponse;
import com.onluyen.url_shortener_backend.storage.service.StorageService;
import com.onluyen.url_shortener_backend.user.dto.UpdateProfileRequest;
import com.onluyen.url_shortener_backend.user.entity.AuthProvider;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public User getMyProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    @Transactional
    public User updateMyProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        boolean passwordUpdated = false;

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (AuthProvider.GOOGLE.equals(user.getProvider())) {
                throw new BusinessException(ErrorCode.OAUTH_PASSWORD_CHANGE_NOT_ALLOWED);
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            passwordUpdated = true;
        }

        User updatedUser = userRepository.save(user);
        if (passwordUpdated) {
            emailService.sendPasswordResetConfirmation(updatedUser);
        }

        return updatedUser;
    }

    @Transactional
    public User updateMyAvatar(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String folder = AppConstant.STORAGE_FOLDER_AVATARS + "/" + user.getId();
        FileUploadResponse uploaded = storageService.upload(file, folder);
        String newFileKey = uploaded.getFileKey();
        String oldFileKey = user.getAvatarUrl();

        try {
            user.setAvatarUrl(newFileKey);
            User updatedUser = userRepository.save(user);

            if (oldFileKey != null && !oldFileKey.isBlank() && !oldFileKey.equals(newFileKey)) {
                storageService.delete(oldFileKey);
            }

            return updatedUser;
        } catch (RuntimeException exception) {
            storageService.delete(newFileKey);
            throw exception;
        }
    }
}
