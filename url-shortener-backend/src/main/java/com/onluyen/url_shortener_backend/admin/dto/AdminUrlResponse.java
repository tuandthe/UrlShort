package com.onluyen.url_shortener_backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUrlResponse {
    private Long id;
    private String shortCode;
    private String originalUrl;
    private boolean isActive;
    private Long clickCount;
    private LocalDateTime createdAt;
    private String ownerEmail;
}