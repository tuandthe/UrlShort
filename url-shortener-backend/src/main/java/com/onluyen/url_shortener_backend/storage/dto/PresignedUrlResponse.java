package com.onluyen.url_shortener_backend.storage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresignedUrlResponse {
    private String fileKey;    // MinIO object key
    private String uploadUrl;  // Presigned PUT URL (expires in 15 min)
}
