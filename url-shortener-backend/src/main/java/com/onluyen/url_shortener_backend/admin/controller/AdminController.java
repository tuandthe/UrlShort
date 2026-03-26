package com.onluyen.url_shortener_backend.admin.controller;

import com.onluyen.url_shortener_backend.admin.dto.AdminUrlResponse;
import com.onluyen.url_shortener_backend.admin.dto.AdminUserResponse;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.admin.service.AdminService;
import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = adminService.getSystemStats();
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_SYS_STATS_SUCCESS, stats));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = adminService.getSystemStats();
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_SYS_STATS_SUCCESS, stats));
    }

    @GetMapping("/analytics/clicks")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSystemClicksTrend(
            @RequestParam(defaultValue = "week") String groupBy) {
        List<Map<String, Object>> trend = adminService.getSystemClicksTrend(groupBy);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_ADMIN_CLICKS_TREND_SUCCESS, trend));
    }

    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AdminUserResponse> usersPage = adminService.getUsers(pageable, search, status);

        return ResponseEntity.ok(ApiResponse.success(
                AppConstant.HTTP_STATUS_OK,
                AppConstant.MSG_ADMIN_USERS_LIST_SUCCESS,
                usersPage.getContent(),
                usersPage.getNumber(),
                usersPage.getTotalPages(),
                usersPage.getTotalElements()));
    }

    @GetMapping("/urls")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminUrlResponse>>> getUrls(
            @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE) int page,
            @RequestParam(defaultValue = AppConstant.DEFAULT_PAGE_SIZE) int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AdminUrlResponse> urlsPage = adminService.getUrls(pageable);

        return ResponseEntity.ok(ApiResponse.success(
                AppConstant.HTTP_STATUS_OK,
                AppConstant.MSG_ADMIN_URLS_LIST_SUCCESS,
                urlsPage.getContent(),
                urlsPage.getNumber(),
                urlsPage.getTotalPages(),
                urlsPage.getTotalElements()));
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(
            @PathVariable Long userId,
            Authentication authentication) {
        adminService.deactivateUser(userId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(
                AppConstant.HTTP_STATUS_OK,
                AppConstant.MSG_ADMIN_USER_DEACTIVATE_SUCCESS,
                null));
    }

    @PatchMapping("/users/{userId}/activate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long userId) {
        adminService.activateUser(userId);
        return ResponseEntity.ok(ApiResponse.success(
                AppConstant.HTTP_STATUS_OK,
                AppConstant.MSG_ADMIN_USER_ACTIVATE_SUCCESS,
                null));
    }
}
