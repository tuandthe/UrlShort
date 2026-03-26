package com.onluyen.url_shortener_backend.url.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.analytics.dto.ClickEventDto;
import com.onluyen.url_shortener_backend.analytics.kafka.ClickEventProducer;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedirectService {

    private final UrlRepository urlRepository;
    private final StringRedisTemplate redisTemplate;
    private final ClickEventProducer clickEventProducer;
    private final PasswordEncoder passwordEncoder;

    public String resolveUrl(String shortCode, HttpServletRequest request) {
        // 1. Check Redis Cache
        String cacheKey = AppConstant.REDIS_URL_KEY_PREFIX + shortCode;
        String cachedUrl = redisTemplate.opsForValue().get(cacheKey);

        if (cachedUrl != null) {
            if (AppConstant.REDIS_NULL_VALUE.equals(cachedUrl)) {
                throw new BusinessException(ErrorCode.URL_NOT_FOUND);
            }
            Url url = urlRepository.findByShortCode(shortCode).orElse(null);
            if (url != null && url.getPassword() != null && !url.getPassword().isEmpty()) {
                throw new BusinessException(ErrorCode.UNAUTHORIZED, AppConstant.ERROR_MSG_URL_PASSWORD_PROTECTED);
            }
            publishClickEvent(shortCode, request);
            return cachedUrl;
        }

        // 2. Lookup DB
        Url url = urlRepository.findByShortCode(shortCode)
                .orElse(null);

        // 3. Cache Penetration Guard
        if (url == null || !url.isActive()) {
            redisTemplate.opsForValue().set(cacheKey, AppConstant.REDIS_NULL_VALUE,
                    AppConstant.REDIS_CACHE_PENETRATION_TTL);
            throw new BusinessException(ErrorCode.URL_NOT_FOUND);
        }

        // 4. Check Expiration
        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.URL_EXPIRED);
        }

        // 5. Check Password
        if (url.getPassword() != null && !url.getPassword().isEmpty()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, AppConstant.ERROR_MSG_URL_PASSWORD_PROTECTED);
        }

        // 6. Populate Cache (with random jitter chống Stampede)
        long jitter = ThreadLocalRandom.current().nextLong(0, AppConstant.REDIS_CACHE_JITTER_MAX_SECONDS);
        redisTemplate.opsForValue().set(cacheKey, url.getOriginalUrl(),
                AppConstant.REDIS_CACHE_TTL.plusSeconds(jitter));

        // 7. Async Tracking
        publishClickEvent(shortCode, request);

        return url.getOriginalUrl();
    }

    public String verifyAndResolve(String shortCode, String password, HttpServletRequest request) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new BusinessException(ErrorCode.URL_NOT_FOUND));

        if (!url.isActive()) {
            throw new BusinessException(ErrorCode.URL_NOT_FOUND);
        }

        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.URL_EXPIRED);
        }

        if (url.getPassword() == null || url.getPassword().isEmpty()) {
            return url.getOriginalUrl(); // Không cần pass
        }

        if (!passwordEncoder.matches(password, url.getPassword())) {
            throw new BusinessException(ErrorCode.INVALID_PASSWORD);
        }

        publishClickEvent(shortCode, request);
        return url.getOriginalUrl();
    }

    private void publishClickEvent(String shortCode, HttpServletRequest request) {
        ClickEventDto eventDto = ClickEventDto.builder()
                .shortCode(shortCode)
                .ipAddress(request.getRemoteAddr())
                .userAgent(request.getHeader(org.springframework.http.HttpHeaders.USER_AGENT))
                .referer(request.getHeader(org.springframework.http.HttpHeaders.REFERER))
                .timestamp(LocalDateTime.now())
                .build();

        clickEventProducer.publishClickEvent(eventDto);
    }
}
