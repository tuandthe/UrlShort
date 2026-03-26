package com.onluyen.url_shortener_backend.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResult {
    private String accessToken;
    private String refreshToken;
}
