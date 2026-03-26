package com.onluyen.url_shortener_backend.url.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPasswordRequest {
    
    @NotBlank(message = "Password không được để trống")
    private String password;
}
