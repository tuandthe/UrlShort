package com.onluyen.url_shortener_backend.notification.service;

import com.onluyen.url_shortener_backend.notification.dto.EmailEventDto;
import com.onluyen.url_shortener_backend.notification.dto.EmailType;
import com.onluyen.url_shortener_backend.notification.kafka.EmailEventProducer;
import com.onluyen.url_shortener_backend.common.util.PiiMasker;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * High-level email service providing named methods for each business email
 * type.
 * All methods are non-blocking: they publish a Kafka event and return
 * immediately.
 *
 * <p>
 * Usage example in AuthService:
 * 
 * <pre>
 * emailService.sendWelcomeEmail(savedUser);
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailEventProducer emailEventProducer;

    @Value("${app.frontend-url:http://localhost:3002}")
    private String frontendUrl;

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    /** Send a welcome email after successful registration */
    public void sendWelcomeEmail(User user) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", displayName(user));
        vars.put("email", user.getEmail());
        vars.put("dashboardUrl", buildFrontendUrl("/dashboard"));
        vars.put("appName", "UrlShort");

        publish(user.getEmail(), "Welcome to UrlShort! 🎉", "welcome", vars, EmailType.WELCOME);
    }

    /** Notify user that their password was changed successfully */
    public void sendPasswordResetConfirmation(User user) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", displayName(user));
        vars.put("dashboardUrl", buildFrontendUrl("/dashboard"));
        vars.put("appName", "UrlShort");

        publish(user.getEmail(), "Your password has been changed", "password-reset", vars,
                EmailType.PASSWORD_RESET_CONFIRMATION);
    }

    /** Notify the URL owner that their short link has expired */
    public void sendLinkExpiredNotification(User user, Url url) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", displayName(user));
        vars.put("shortCode", url.getShortCode());
        vars.put("originalUrl", url.getOriginalUrl());
        vars.put("newUrlUrl", buildFrontendUrl("/urls"));
        vars.put("appName", "UrlShort");

        publish(user.getEmail(),
                "Your short link /" + url.getShortCode() + " has expired",
                "link-expired", vars, EmailType.LINK_EXPIRED);
    }

    /** Send weekly click analytics summary */
    public void sendWeeklyReport(User user, List<Map<String, Object>> urlStats) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("fullName", displayName(user));
        vars.put("urlStats", urlStats);
        vars.put("analyticsUrl", buildFrontendUrl("/analytics"));
        vars.put("appName", "UrlShort");

        publish(user.getEmail(), "Your UrlShort weekly report 📊", "weekly-report", vars,
                EmailType.WEEKLY_REPORT);
    }

    // -------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------

    private void publish(String to, String subject, String templateName,
            Map<String, Object> vars, EmailType type) {
        EmailEventDto dto = EmailEventDto.builder()
                .to(to)
                .subject(subject)
                .templateName(templateName)
                .variables(vars)
                .type(type)
                .build();
        emailEventProducer.publishEmailEvent(dto);
        log.info("Queued {} email for: {}", type, PiiMasker.maskEmail(to));
    }

    private String displayName(User user) {
        return user.getFullName() != null && !user.getFullName().isBlank()
                ? user.getFullName()
                : user.getEmail();
    }

    private String buildFrontendUrl(String path) {
        String normalizedBase = frontendUrl.replaceAll("/$", "");
        return normalizedBase + path;
    }
}
