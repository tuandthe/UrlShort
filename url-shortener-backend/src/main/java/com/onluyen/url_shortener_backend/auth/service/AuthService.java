package com.onluyen.url_shortener_backend.auth.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.auth.dto.AuthResult;
import com.onluyen.url_shortener_backend.auth.dto.LoginRequest;
import com.onluyen.url_shortener_backend.auth.dto.RegisterRequest;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.common.security.JwtProvider;
import com.onluyen.url_shortener_backend.notification.service.EmailService;
import com.onluyen.url_shortener_backend.user.entity.AuthProvider;
import com.onluyen.url_shortener_backend.user.entity.Role;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Value("${app.jwtRefreshExpirationMs}")
    private long refreshExpirationInMs;

    private static final String REFRESH_TOKEN_PREFIX = "refresh_token:";

    @Transactional
    public AuthResult register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.USER)
                .provider(AuthProvider.LOCAL)
                .isActive(true)
                .build();

        userRepository.save(user);
        emailService.sendWelcomeEmail(user);

        String accessToken = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        storeRefreshToken(user.getEmail(), refreshToken);

        return AuthResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResult login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (!user.isActive()) {
            throw new BusinessException(ErrorCode.USER_INACTIVE, AppConstant.ERROR_MSG_USER_INACTIVE);
        }

        if (!user.getProvider().equals(AuthProvider.LOCAL) ||
                !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        String accessToken = jwtProvider.generateToken(user);
        String refreshToken = jwtProvider.generateRefreshToken(user);

        storeRefreshToken(user.getEmail(), refreshToken);

        return AuthResult.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private void storeRefreshToken(String email, String refreshToken) {
        redisTemplate.opsForValue().set(
                REFRESH_TOKEN_PREFIX + email,
                refreshToken,
                Duration.ofMillis(refreshExpirationInMs));
    }

    public AuthResult refreshToken(String refreshToken) {
        if (jwtProvider.validateToken(refreshToken)) {
            String email = jwtProvider.getEmailFromJWT(refreshToken);

            String stored = redisTemplate.opsForValue().get(REFRESH_TOKEN_PREFIX + email);
            if (!refreshToken.equals(stored)) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, AppConstant.ERROR_MSG_INVALID_REFRESH_TOKEN);
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

            if (!user.isActive()) {
                throw new BusinessException(ErrorCode.USER_INACTIVE, AppConstant.ERROR_MSG_USER_INACTIVE);
            }

            String accessToken = jwtProvider.generateToken(user);
            String newRefreshToken = jwtProvider.generateRefreshToken(user);

            storeRefreshToken(user.getEmail(), newRefreshToken);

            return AuthResult.builder()
                    .accessToken(accessToken)
                    .refreshToken(newRefreshToken)
                    .build();
        }
        throw new BusinessException(ErrorCode.UNAUTHORIZED, AppConstant.ERROR_MSG_INVALID_REFRESH_TOKEN);
    }

    public void logout(String accessToken) {
        if (jwtProvider.validateToken(accessToken)) {
            String email = jwtProvider.getEmailFromJWT(accessToken);
            redisTemplate.delete(REFRESH_TOKEN_PREFIX + email);
        }
    }
}
