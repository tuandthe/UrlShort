package com.onluyen.url_shortener_backend.url.controller;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import com.onluyen.url_shortener_backend.url.dto.VerifyPasswordRequest;
import com.onluyen.url_shortener_backend.url.service.RedirectService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class RedirectController {

    private final RedirectService redirectService;

    @GetMapping(AppConstant.SHORT_CODE_REDIRECT_PATH)
    public ResponseEntity<Void> redirect(
            @PathVariable String shortCode,
            HttpServletRequest request) {

        String originalUrl = redirectService.resolveUrl(shortCode, request);

        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(originalUrl));
        // Use 302 Found or 301 Moved Permanently based on requirements
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @PostMapping(AppConstant.SHORT_CODE_VERIFY_PATH)
    public ResponseEntity<ApiResponse<String>> verifyPassword(
            @PathVariable String shortCode,
            @Valid @RequestBody VerifyPasswordRequest request,
            HttpServletRequest httpServletRequest) {

        String originalUrl = redirectService.verifyAndResolve(shortCode, request.getPassword(), httpServletRequest);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_AUTH_SUCCESS, originalUrl));
    }
}
