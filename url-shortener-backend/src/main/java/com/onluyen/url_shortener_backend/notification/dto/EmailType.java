package com.onluyen.url_shortener_backend.notification.dto;

/**
 * Enum representing the type of email event.
 * Used for logging, monitoring and routing in EmailEventConsumer.
 */
public enum EmailType {
    WELCOME,
    PASSWORD_RESET_CONFIRMATION,
    LINK_EXPIRED,
    WEEKLY_REPORT
}
