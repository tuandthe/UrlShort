package com.onluyen.url_shortener_backend.user.controller;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;

import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import com.onluyen.url_shortener_backend.user.dto.UpdateProfileRequest;
import com.onluyen.url_shortener_backend.user.dto.UserProfileResponse;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.mapper.UserMapper;
import com.onluyen.url_shortener_backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(Authentication authentication) {
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        User user = userService.getMyProfile(email);
        UserProfileResponse response = userMapper.toProfileResponse(user);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_PROFILE_GET_SUCCESS, response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        User updatedUser = userService.updateMyProfile(email, request);
        UserProfileResponse response = userMapper.toProfileResponse(updatedUser);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_PROFILE_UPDATE_SUCCESS, response));
    }

    @PutMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        User updatedUser = userService.updateMyAvatar(email, file);
        UserProfileResponse response = userMapper.toProfileResponse(updatedUser);
        return ResponseEntity
                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK, AppConstant.MSG_AVATAR_UPLOAD_SUCCESS, response));
    }
}
