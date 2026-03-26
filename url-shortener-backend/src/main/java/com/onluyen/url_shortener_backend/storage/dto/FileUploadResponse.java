package com.onluyen.url_shortener_backend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {
    private String fileKey;       // MinIO object key: "avatars/{userId}/avatar.jpg"
    private String fileName;      // Original file name
    private long size;            // Size in bytes
    private String contentType;   // MIME type
}
