package com.onluyen.url_shortener_backend.common.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProdEnvironmentValidator {

    private final Environment environment;

    private static final List<String> REQUIRED_ENV_VARS = List.of(
            "DB_USER",
            "DB_PASSWORD",
            "KAFKA_BOOTSTRAP_SERVERS",
            "JWT_SECRET",
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET",
            "APP_BASE_URL",
            "APP_FRONTEND_URL",
            "APP_OAUTH2_REDIRECT_URI",
            "MINIO_ACCESS_KEY",
            "MINIO_SECRET_KEY",
            "MAIL_HOST",
            "MAIL_FROM",
            "APP_CORS_ALLOWED_ORIGINS");

    @PostConstruct
    public void validate() {
        List<String> missing = new ArrayList<>(REQUIRED_ENV_VARS.stream()
                .filter(this::isMissing)
                .toList());

        if (isSmtpAuthEnabled()) {
            if (isMissing("MAIL_USERNAME")) {
                missing.add("MAIL_USERNAME");
            }
            if (isMissing("MAIL_PASSWORD")) {
                missing.add("MAIL_PASSWORD");
            }
        }

        if (isMissing("MAIL_PORT")) {
            missing.add("MAIL_PORT");
        }

        validateRedisConfig(missing);

        if (!missing.isEmpty()) {
            throw new IllegalStateException("Missing required environment variables for prod profile: "
                    + String.join(", ", missing));
        }

        List<String> suspicious = new ArrayList<>(REQUIRED_ENV_VARS.stream()
                .filter(this::isSuspicious)
                .toList());

        if (isSmtpAuthEnabled()) {
            if (isSuspicious("MAIL_USERNAME")) {
                suspicious.add("MAIL_USERNAME");
            }
            if (isSuspicious("MAIL_PASSWORD")) {
                suspicious.add("MAIL_PASSWORD");
            }
        }

        if (isSuspicious("REDIS_URL")) {
            suspicious.add("REDIS_URL");
        }

        if (isSuspicious("REDIS_PUBLIC_URL")) {
            suspicious.add("REDIS_PUBLIC_URL");
        }

        if (!suspicious.isEmpty()) {
            throw new IllegalStateException("Suspicious placeholder values detected in prod environment variables: "
                    + String.join(", ", suspicious)
                    + ". Replace placeholder values before startup.");
        }

        validateSmtpSecurityMode();

        log.info("Production environment validation passed. Checked {} required env vars.",
                REQUIRED_ENV_VARS.size());
    }

    private boolean isMissing(String key) {
        return !StringUtils.hasText(environment.getProperty(key));
    }

    private boolean isSuspicious(String key) {
        String value = environment.getProperty(key);
        if (!StringUtils.hasText(value)) {
            return false;
        }

        String normalized = value.toLowerCase();
        return normalized.contains("change_me")
                || normalized.contains("replace-me")
                || normalized.contains("your_")
                || normalized.contains("example");
    }

    private boolean isSmtpAuthEnabled() {
        return Boolean.parseBoolean(environment.getProperty("MAIL_SMTP_AUTH", "true"));
    }

    private void validateRedisConfig(List<String> missing) {
        boolean hasRedisUrl = StringUtils.hasText(environment.getProperty("REDIS_URL"))
                || StringUtils.hasText(environment.getProperty("REDIS_PUBLIC_URL"));

        if (hasRedisUrl) {
            return;
        }

        if (isMissing("REDIS_HOST")) {
            missing.add("REDIS_HOST");
        }

        if (isMissing("REDIS_PASSWORD")) {
            missing.add("REDIS_PASSWORD");
        }
    }

    private void validateSmtpSecurityMode() {
        boolean startTlsEnabled = Boolean.parseBoolean(environment.getProperty("MAIL_SMTP_STARTTLS_ENABLE", "true"));
        boolean sslEnabled = Boolean.parseBoolean(environment.getProperty("MAIL_SMTP_SSL_ENABLE", "false"));
        int smtpPort = Integer.parseInt(environment.getProperty("MAIL_PORT", "587"));

        if (startTlsEnabled && sslEnabled) {
            throw new IllegalStateException(
                    "Invalid SMTP configuration: MAIL_SMTP_STARTTLS_ENABLE and MAIL_SMTP_SSL_ENABLE cannot both be true.");
        }

        if (smtpPort == 465 && !sslEnabled) {
            throw new IllegalStateException(
                    "Invalid SMTP configuration: MAIL_PORT=465 requires MAIL_SMTP_SSL_ENABLE=true.");
        }

        if (smtpPort == 587 && sslEnabled) {
            throw new IllegalStateException(
                    "Invalid SMTP configuration: MAIL_PORT=587 should use STARTTLS (set MAIL_SMTP_SSL_ENABLE=false).");
        }
    }
}