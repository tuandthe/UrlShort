package com.onluyen.url_shortener_backend.url.dto;

import com.onluyen.url_shortener_backend.common.constant.ValidationConstant;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Data
public class CreateUrlRequest {

    @NotBlank(message = "Original URL is required")
    @URL(message = "Invalid URL format")
    private String originalUrl;

    // Optional fields
    @Size(max = ValidationConstant.MAX_CUSTOM_ALIAS_LENGTH, message = "Custom alias must be at most 10 characters")
    private String customAlias;
    private String password;
    private LocalDateTime expiresAt;
}
