package com.onluyen.url_shortener_backend.auth.controller;

import com.onluyen.url_shortener_backend.auth.dto.AuthResponse;
import com.onluyen.url_shortener_backend.auth.dto.AuthResult;
import com.onluyen.url_shortener_backend.auth.mapper.AuthMapper;
import com.onluyen.url_shortener_backend.auth.dto.LoginRequest;
import com.onluyen.url_shortener_backend.auth.dto.RegisterRequest;
import com.onluyen.url_shortener_backend.auth.service.AuthService;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthMapper authMapper;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResult result = authService.register(request);
        AuthResponse response = authMapper.toAuthResponse(result);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_REGISTER_SUCCESS, response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResult result = authService.login(request);
        AuthResponse response = authMapper.toAuthResponse(result);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_LOGIN_SUCCESS, response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestHeader(AppConstant.AUTH_HEADER) String token) {
        String refreshToken = token.replace(AppConstant.BEARER_PREFIX, "");
        AuthResult result = authService.refreshToken(refreshToken);
        AuthResponse response = authMapper.toAuthResponse(result);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_REFRESH_TOKEN_SUCCESS, response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(AppConstant.AUTH_HEADER) String token) {
        String jwt = token.replace(AppConstant.BEARER_PREFIX, "");
        authService.logout(jwt);
        return ResponseEntity.ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_LOGOUT_SUCCESS, null));
    }

    @GetMapping("/oauth2/google")
    public ResponseEntity<Void> oauth2Google() {
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(AppConstant.OAUTH2_GOOGLE_AUTH_PATH));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
