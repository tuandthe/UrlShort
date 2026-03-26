package com.onluyen.url_shortener_backend.url.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlDetailResponse {
    private Long id;
    private String shortCode;
    private String originalUrl;
    private String status;
    private boolean hasPassword;
    private LocalDateTime expiresAt;
    private boolean isActive;
    private Long clickCount;
    private String qrCodeUrl;
    private String ogImageUrl;
    private LocalDateTime createdAt;
    private String shortUrl;
}
