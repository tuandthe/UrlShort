package com.onluyen.url_shortener_backend.storage.service;

import com.onluyen.url_shortener_backend.storage.dto.FileDownloadResponse;
import com.onluyen.url_shortener_backend.storage.dto.FileUploadResponse;
import com.onluyen.url_shortener_backend.storage.dto.PresignedUrlResponse;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    /**
     * Upload file to a given folder.
     *
     * @param file   the multipart file to upload
     * @param folder target folder prefix (e.g., "avatars", "og-images")
     * @return upload metadata including fileKey and size
     */
    FileUploadResponse upload(MultipartFile file, String folder);

    /**
     * Permanently delete an object by its file key.
     *
     * @param fileKey MinIO object key
     */
    void delete(String fileKey);

    /**
     * Generate a presigned GET URL to download/view an object.
     *
     * @param fileKey       MinIO object key
     * @param expiryMinutes URL expiry in minutes
     * @return presigned URL
     */
    String getPresignedDownloadUrl(String fileKey, int expiryMinutes);

    /**
     * Download object bytes by file key.
     *
     * @param fileKey MinIO object key
     * @return file content + content type metadata
     */
    FileDownloadResponse download(String fileKey);

    /**
     * Generate a presigned PUT URL for direct browser upload.
     *
     * @param fileName original file name
     * @param folder   target folder prefix
     * @return presigned URL + generated file key
     */
    PresignedUrlResponse generatePresignedUploadUrl(String fileName, String folder);

    /**
     * Upload in-memory bytes as a file object.
     *
     * @param content     binary content
     * @param fileName    original-like file name
     * @param contentType MIME type
     * @param folder      target folder prefix
     * @return upload metadata including fileKey and size
     */
    FileUploadResponse uploadBytes(byte[] content, String fileName, String contentType, String folder);
}
