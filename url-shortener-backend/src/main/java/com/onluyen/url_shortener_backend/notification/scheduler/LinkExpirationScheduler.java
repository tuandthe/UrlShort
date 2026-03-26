package com.onluyen.url_shortener_backend.notification.scheduler;

import com.onluyen.url_shortener_backend.notification.service.EmailService;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LinkExpirationScheduler {

    private final UrlRepository urlRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void sendExpiredLinkNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<Url> expiredUrls = urlRepository
                .findByExpiresAtBeforeAndExpirationNotifiedAtIsNullAndIsActiveTrue(now);

        if (expiredUrls.isEmpty()) {
            return;
        }

        log.info("Found {} expired URLs pending notification", expiredUrls.size());

        for (Url url : expiredUrls) {
            try {
                if (url.getUser() == null) {
                    continue;
                }

                emailService.sendLinkExpiredNotification(url.getUser(), url);
                url.setExpirationNotifiedAt(now);
                urlRepository.save(url);
            } catch (Exception exception) {
                log.error("Failed to queue link-expired email for url id={}", url.getId(), exception);
            }
        }
    }
}