package com.onluyen.url_shortener_backend.url.dto;

import jakarta.validation.constraints.Future;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUrlExpirationRequest {

    @Future(message = "Thời gian hết hạn phải ở tương lai")
    private LocalDateTime expiresAt;
}