package com.onluyen.url_shortener_backend.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Kafka event DTO for sending emails asynchronously.
 * Published by EmailEventProducer, consumed by EmailEventConsumer.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailEventDto {

    /** Recipient email address */
    private String to;

    /** Email subject line */
    private String subject;

    /** Thymeleaf template name (without path or extension), e.g. "welcome", "link-expired" */
    private String templateName;

    /** Template variables injected into the Thymeleaf context */
    private Map<String, Object> variables;

    /** Email category for logging and DLQ monitoring */
    private EmailType type;

    /** When this event was created (for monitoring lag) */
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
