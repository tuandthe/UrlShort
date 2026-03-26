package com.onluyen.url_shortener_backend.url.controller;

import com.onluyen.url_shortener_backend.analytics.dto.AnalyticsResponse;
import com.onluyen.url_shortener_backend.analytics.service.AnalyticsService;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import com.onluyen.url_shortener_backend.url.dto.CreateUrlRequest;
import com.onluyen.url_shortener_backend.url.dto.UpdateUrlExpirationRequest;
import com.onluyen.url_shortener_backend.url.dto.UpdateUrlPasswordRequest;
import com.onluyen.url_shortener_backend.url.dto.UpdateUrlRequest;
import com.onluyen.url_shortener_backend.url.dto.UrlDetailResponse;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.mapper.UrlMapper;
import com.onluyen.url_shortener_backend.url.service.UrlService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/urls")
@RequiredArgsConstructor
public class UrlController {

        private final UrlService urlService;
        private final UrlMapper urlMapper;
        private final AnalyticsService analyticsService;

        @Value("${app.base-url:http://localhost:8080}")
        private String baseUrl;

        @PostMapping
        public ResponseEntity<ApiResponse<UrlDetailResponse>> createUrl(
                        @Valid @RequestBody CreateUrlRequest request,
                        Authentication authentication) {

                String email = authentication != null ? authentication.getName() : null;
                if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                        email = ((UserDetails) authentication.getPrincipal()).getUsername();
                }

                Url url = urlService.createUrl(request, email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);
                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_CREATE_SUCCESS,
                                                response));
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<UrlDetailResponse>>> getMyUrls(
                        @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE) int page,
                        @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE_SIZE) int size,
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String status,
                        @RequestParam(defaultValue = "createdAt") String sortBy,
                        @RequestParam(defaultValue = "desc") String sortDir,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Page<Url> urlPage = urlService.getUserUrls(email, page, size, search, status, sortBy, sortDir);
                List<UrlDetailResponse> responseContent = urlPage.map(url -> urlMapper.toDetailResponse(url, baseUrl))
                                .getContent();

                return ResponseEntity.ok(ApiResponse.success(
                                AppConstant.HTTP_STATUS_OK,
                                AppConstant.MSG_URL_LIST_SUCCESS,
                                responseContent,
                                urlPage.getNumber(),
                                urlPage.getTotalPages(),
                                urlPage.getTotalElements()));
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<UrlDetailResponse>> getUrlDetail(
                        @PathVariable Long id,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Url url = urlService.getUrlDetail(id, email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);
                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_DETAIL_SUCCESS,
                                                response));
        }

        @GetMapping("/{id}/analytics")
        public ResponseEntity<ApiResponse<AnalyticsResponse>> getUrlAnalytics(
                        @PathVariable Long id,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                AnalyticsResponse response = analyticsService.getUrlAnalytics(id, email);

                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_STATS_SUCCESS,
                                                response));
        }

        @GetMapping("/{id}/analytics/clicks")
        public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUrlClicksTimeline(
                        @PathVariable Long id,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                List<Map<String, Object>> response = analyticsService.getUrlClicksByDate(id, email);

                return ResponseEntity.ok(
                                ApiResponse.success(AppConstant.HTTP_STATUS_OK,
                                                AppConstant.MSG_URL_CLICKS_TIMELINE_SUCCESS, response));
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<UrlDetailResponse>> updateUrl(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateUrlRequest request,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Url url = urlService.updateUrl(id, request, email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);
                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_UPDATE_SUCCESS,
                                                response));
        }

        @PutMapping("/{id}/password")
        public ResponseEntity<ApiResponse<UrlDetailResponse>> updateUrlPassword(
                        @PathVariable Long id,
                        @RequestBody UpdateUrlPasswordRequest request,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Url url = urlService.updateUrlPassword(id, request.getPassword(), email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);

                return ResponseEntity.ok(
                                ApiResponse.success(AppConstant.HTTP_STATUS_OK,
                                                AppConstant.MSG_URL_PASSWORD_UPDATE_SUCCESS, response));
        }

        @PutMapping("/{id}/expiration")
        public ResponseEntity<ApiResponse<UrlDetailResponse>> updateUrlExpiration(
                        @PathVariable Long id,
                        @Valid @RequestBody UpdateUrlExpirationRequest request,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Url url = urlService.updateUrlExpiration(id, request.getExpiresAt(), email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);

                return ResponseEntity.ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK,
                                AppConstant.MSG_URL_EXPIRATION_UPDATE_SUCCESS, response));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteUrl(
                        @PathVariable Long id,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                urlService.deleteUrl(id, email);
                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_URL_DELETE_SUCCESS,
                                                null));
        }

        @PostMapping(value = "/{id}/og-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<ApiResponse<UrlDetailResponse>> uploadOgImage(
                        @PathVariable Long id,
                        @RequestParam("file") MultipartFile file,
                        Authentication authentication) {

                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                Url url = urlService.uploadOgImage(id, file, email);
                UrlDetailResponse response = urlMapper.toDetailResponse(url, baseUrl);

                return ResponseEntity.ok(ApiResponse.success(
                                AppConstant.HTTP_STATUS_OK,
                                AppConstant.MSG_URL_OG_IMAGE_UPLOAD_SUCCESS,
                                response));
        }
}
