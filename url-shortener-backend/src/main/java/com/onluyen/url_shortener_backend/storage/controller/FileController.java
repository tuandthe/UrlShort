package com.onluyen.url_shortener_backend.storage.controller;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.dto.ApiResponse;
import com.onluyen.url_shortener_backend.storage.dto.FileDownloadResponse;
import com.onluyen.url_shortener_backend.storage.dto.FileUploadResponse;
import com.onluyen.url_shortener_backend.storage.dto.PresignedUrlResponse;
import com.onluyen.url_shortener_backend.storage.service.StorageAuthorizationService;
import com.onluyen.url_shortener_backend.storage.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Tag(name = "File Storage", description = "MinIO file upload and management")
public class FileController {

        private final StorageService storageService;
        private final StorageAuthorizationService storageAuthorizationService;

        /**
         * Upload a file (public endpoint for general use).
         * For avatar upload, use PUT /api/users/me/avatar instead.
         */
        @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        @Operation(summary = "Upload a file to MinIO")
        public ResponseEntity<ApiResponse<FileUploadResponse>> upload(
                        @RequestParam("file") MultipartFile file,
                        @RequestParam(value = "folder", defaultValue = "uploads") String folder,
                        Authentication authentication) {

                storageAuthorizationService.assertAdmin(extractEmail(authentication));

                FileUploadResponse response = storageService.upload(file, folder);
                return ResponseEntity.ok(ApiResponse.success(
                                AppConstant.HTTP_STATUS_OK, AppConstant.MSG_FILE_UPLOAD_SUCCESS, response));
        }

        /**
         * Delete a file by its MinIO key.
         */
        @DeleteMapping
        @Operation(summary = "Delete a file from MinIO")
        public ResponseEntity<ApiResponse<Void>> delete(
                        @RequestParam("fileKey") String fileKey,
                        Authentication authentication) {

                storageAuthorizationService.assertCanAccessFileKey(fileKey, extractEmail(authentication));
                storageService.delete(fileKey);
                return ResponseEntity.ok(ApiResponse.success(
                                AppConstant.HTTP_STATUS_OK, AppConstant.MSG_FILE_DELETE_SUCCESS, null));
        }

        /**
         * Get a presigned download URL for viewing/downloading a file.
         */
        @GetMapping("/presigned/download")
        @Operation(summary = "Get presigned download URL")
        public ResponseEntity<ApiResponse<String>> getDownloadUrl(
                        @RequestParam("fileKey") String fileKey,
                        @RequestParam(value = "expiry", defaultValue = "60") int expiryMinutes,
                        Authentication authentication) {

                storageAuthorizationService.assertCanAccessFileKey(fileKey, extractEmail(authentication));

                String url = storageService.getPresignedDownloadUrl(fileKey, expiryMinutes);
                return ResponseEntity.ok(ApiResponse.success(
                                AppConstant.HTTP_STATUS_OK, AppConstant.MSG_PRESIGNED_URL_GENERATED, url));
        }

        /**
         * Download file content through backend (works even when MinIO host is
         * internal).
         */
        @GetMapping("/download")
        @Operation(summary = "Download file content via backend")
        public ResponseEntity<byte[]> downloadFile(
                        @RequestParam("fileKey") String fileKey,
                        Authentication authentication) {

                storageAuthorizationService.assertCanAccessFileKey(fileKey, extractEmail(authentication));
                FileDownloadResponse response = storageService.download(fileKey);

                MediaType mediaType;
                try {
                        mediaType = MediaType.parseMediaType(response.getContentType());
                } catch (Exception ignored) {
                        mediaType = MediaType.APPLICATION_OCTET_STREAM;
                }

                return ResponseEntity.status(HttpStatus.OK)
                                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                                .contentType(mediaType)
                                .body(response.getContent());
        }

        /**
         * Generate a presigned PUT URL so the browser can upload directly to MinIO.
         */
        @GetMapping("/presigned/upload")
        @Operation(summary = "Generate presigned upload URL for direct browser upload")
        public ResponseEntity<ApiResponse<PresignedUrlResponse>> getUploadUrl(
                        @RequestParam("fileName") String fileName,
                        @RequestParam(value = "folder", defaultValue = "uploads") String folder,
                        Authentication authentication) {

                storageAuthorizationService.assertAdmin(extractEmail(authentication));

                PresignedUrlResponse response = storageService.generatePresignedUploadUrl(fileName, folder);
                return ResponseEntity
                                .ok(ApiResponse.success(AppConstant.HTTP_STATUS_OK,
                                                AppConstant.MSG_PRESIGNED_URL_GENERATED, response));
        }

        private String extractEmail(Authentication authentication) {
                if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                        return userDetails.getUsername();
                }
                return authentication.getName();
        }
}
