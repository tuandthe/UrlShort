package com.onluyen.url_shortener_backend.storage.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Data
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioConfig {

    private String endpoint;
    private String publicEndpoint;
    private String region;
    private String accessKey;
    private String secretKey;
    private String bucket;

    public String getPresignEndpoint() {
        return StringUtils.hasText(publicEndpoint) ? publicEndpoint : endpoint;
    }

    public String getResolvedRegion() {
        return StringUtils.hasText(region) ? region : "us-east-1";
    }

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .region(getResolvedRegion())
                .credentials(accessKey, secretKey)
                .build();
    }
}
