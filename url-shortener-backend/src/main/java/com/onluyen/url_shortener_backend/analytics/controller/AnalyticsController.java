package com.onluyen.url_shortener_backend.analytics.controller;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.analytics.dto.AnalyticsResponse;
import com.onluyen.url_shortener_backend.analytics.service.AnalyticsService;
import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/urls/{id}")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getUrlAnalytics(
            @PathVariable Long id,
            Authentication authentication) {

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        AnalyticsResponse response = analyticsService.getUrlAnalytics(id, email);

        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_STATS_SUCCESS, response));
    }
}
