package com.onluyen.url_shortener_backend.url.dto;

import com.onluyen.url_shortener_backend.common.constant.ValidationConstant;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUrlRequest {

    @URL(message = "Invalid URL format")
    private String originalUrl;

    @Size(max = ValidationConstant.MAX_CUSTOM_ALIAS_LENGTH, message = "Custom alias không được quá 10 ký tự")
    private String customAlias;

    private String password;

    @Future(message = "Thời gian hết hạn phải ở tương lai")
    private LocalDateTime expiresAt;

    private Boolean isActive;
}
