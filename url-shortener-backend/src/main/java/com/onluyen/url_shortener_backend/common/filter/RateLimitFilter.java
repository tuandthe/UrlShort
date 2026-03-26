package com.onluyen.url_shortener_backend.common.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String ipAddress = request.getRemoteAddr();
        String key = AppConstant.RATE_LIMIT_PREFIX + ipAddress;
        long currentTimeMillis = Instant.now().toEpochMilli();
        long oneMinuteAgo = currentTimeMillis - AppConstant.RATE_LIMIT_WINDOW_MILLISECONDS;

        try {
            redisTemplate.opsForZSet().removeRangeByScore(key, 0, oneMinuteAgo);
            redisTemplate.opsForZSet().add(key, String.valueOf(currentTimeMillis), currentTimeMillis);
            Long requestCount = redisTemplate.opsForZSet().zCard(key);
            redisTemplate.expire(key, java.time.Duration.ofMinutes(1));

            if (requestCount != null && requestCount > AppConstant.MAX_REQUESTS_PER_MINUTE) {
                log.warn("Rate limit exceeded for IP: {}", ipAddress);
                sendErrorResponse(response);
                return;
            }

        } catch (Exception e) {
            log.error("Redis error during rate limiting", e);
            // Fallback: nếu redis chết thì vẫn cho đi tiếp
        }

        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                ErrorCode.RATE_LIMIT_EXCEEDED.getMessage(),
                null);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
