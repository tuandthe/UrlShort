package com.onluyen.url_shortener_backend.storage.service;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.storage.config.MinioConfig;
import com.onluyen.url_shortener_backend.storage.dto.FileDownloadResponse;
import com.onluyen.url_shortener_backend.storage.dto.FileUploadResponse;
import com.onluyen.url_shortener_backend.storage.dto.PresignedUrlResponse;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioStorageService implements StorageService {

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    @Override
    public FileUploadResponse upload(MultipartFile file, String folder) {
        validateFile(file);

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String fileKey = buildFileKey(folder, originalFilename);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build());

            log.info("Uploaded file '{}' to MinIO key '{}'", originalFilename, fileKey);
            return FileUploadResponse.builder()
                    .fileKey(fileKey)
                    .fileName(originalFilename)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .build();
        } catch (Exception e) {
            log.error("Failed to upload file '{}' to MinIO: {}", originalFilename, e.getMessage(), e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    @Override
    public void delete(String fileKey) {
        if (fileKey == null || fileKey.isBlank())
            return;
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .build());
            log.info("Deleted MinIO object '{}'", fileKey);
        } catch (Exception e) {
            log.error("Failed to delete MinIO object '{}': {}", fileKey, e.getMessage(), e);
            // Non-fatal: log and continue
        }
    }

    @Override
    public String getPresignedDownloadUrl(String fileKey, int expiryMinutes) {
        try {
            return createPresignClient().getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .expiry(expiryMinutes, TimeUnit.MINUTES)
                            .build());
        } catch (Exception e) {
            log.error("Failed to generate presigned download URL for '{}': {}", fileKey, e.getMessage(), e);
            throw new RuntimeException("Could not generate download URL", e);
        }
    }

    @Override
    public FileDownloadResponse download(String fileKey) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .build());

            try (InputStream inputStream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .build())) {

                String contentType = StringUtils.hasText(stat.contentType())
                        ? stat.contentType()
                        : "application/octet-stream";

                return FileDownloadResponse.builder()
                        .content(inputStream.readAllBytes())
                        .contentType(contentType)
                        .build();
            }
        } catch (Exception e) {
            log.error("Failed to download MinIO object '{}': {}", fileKey, e.getMessage(), e);
            throw new RuntimeException("Could not download file", e);
        }
    }

    @Override
    public PresignedUrlResponse generatePresignedUploadUrl(String fileName, String folder) {
        String sanitized = sanitizeFilename(fileName);
        String fileKey = buildFileKey(folder, sanitized);

        try {
            String uploadUrl = createPresignClient().getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .expiry(15, TimeUnit.MINUTES)
                            .build());
            return PresignedUrlResponse.builder()
                    .fileKey(fileKey)
                    .uploadUrl(uploadUrl)
                    .build();
        } catch (Exception e) {
            log.error("Failed to generate presigned upload URL: {}", e.getMessage(), e);
            throw new RuntimeException("Could not generate upload URL", e);
        }
    }

    @Override
    public FileUploadResponse uploadBytes(byte[] content, String fileName, String contentType, String folder) {
        validateContent(content, contentType);

        String originalFilename = sanitizeFilename(fileName);
        String fileKey = buildFileKey(folder, originalFilename);

        try (InputStream inputStream = new ByteArrayInputStream(content)) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(fileKey)
                            .stream(inputStream, content.length, -1)
                            .contentType(contentType)
                            .build());

            log.info("Uploaded in-memory file '{}' to MinIO key '{}'", originalFilename, fileKey);
            return FileUploadResponse.builder()
                    .fileKey(fileKey)
                    .fileName(originalFilename)
                    .size(content.length)
                    .contentType(contentType)
                    .build();
        } catch (Exception e) {
            log.error("Failed to upload in-memory file '{}' to MinIO: {}", originalFilename, e.getMessage(), e);
            throw new RuntimeException("File upload failed: " + e.getMessage(), e);
        }
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.MSG_FILE_MUST_NOT_BE_EMPTY);
        }

        validateSize(file.getSize());
        validateContentType(file.getContentType());
    }

    private void validateContent(byte[] content, String contentType) {
        if (content == null || content.length == 0) {
            throw new BusinessException(ErrorCode.MSG_FILE_MUST_NOT_BE_EMPTY);
        }

        validateSize(content.length);
        validateContentType(contentType);
    }

    private void validateSize(long size) {
        if (size > AppConstant.MAX_FILE_SIZE_BYTES) {
            throw new BusinessException(ErrorCode.MSG_FILE_SIZE_EXCEEDS_LIMIT);
        }
    }

    private void validateContentType(String contentType) {
        if (contentType == null || !AppConstant.ALLOWED_IMAGE_CONTENT_TYPES.contains(contentType)) {
            throw new BusinessException(ErrorCode.MSG_UNSUPPORTED_FILE_TYPE);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "file_" + UUID.randomUUID();
        }
        // Keep only alphanumeric, dots, hyphens, underscores
        String name = filename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
        int dotIdx = name.lastIndexOf('.');
        String base = dotIdx > 0 ? name.substring(0, dotIdx) : name;
        String ext = dotIdx > 0 ? name.substring(dotIdx) : "";
        return UUID.randomUUID() + "_" + base + ext;
    }

    private String buildFileKey(String folder, String filename) {
        return folder + "/" + filename;
    }

    private MinioClient createPresignClient() {
        return MinioClient.builder()
                .endpoint(minioConfig.getPresignEndpoint())
                .region(minioConfig.getResolvedRegion())
                .credentials(minioConfig.getAccessKey(), minioConfig.getSecretKey())
                .build();
    }
}
