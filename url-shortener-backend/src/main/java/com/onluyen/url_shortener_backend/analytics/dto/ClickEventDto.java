package com.onluyen.url_shortener_backend.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickEventDto {
    private String shortCode;
    private String ipAddress;
    private String userAgent;
    private String referer;
    private LocalDateTime timestamp;
}
