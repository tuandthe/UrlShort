package com.onluyen.url_shortener_backend.notification.scheduler;

import com.onluyen.url_shortener_backend.analytics.repository.ClickEventRepository;
import com.onluyen.url_shortener_backend.notification.service.EmailService;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class WeeklyReportScheduler {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickEventRepository clickEventRepository;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 9 ? * MON")
    public void sendWeeklyReports() {
        LocalDateTime since = LocalDateTime.now().minusDays(7);
        List<User> activeUsers = userRepository.findByIsActiveTrue();

        if (activeUsers.isEmpty()) {
            return;
        }

        log.info("Preparing weekly reports for {} active users", activeUsers.size());

        for (User user : activeUsers) {
            try {
                List<Url> userUrls = urlRepository.findByUserIdAndIsActiveTrue(user.getId());
                if (userUrls.isEmpty()) {
                    continue;
                }

                List<Map<String, Object>> urlStats = userUrls.stream()
                        .map(url -> {
                            long weeklyClicks = clickEventRepository.countByUrlIdAndClickedAtAfter(url.getId(), since);
                            long totalClicks = url.getClickCount() == null ? 0L : url.getClickCount();
                            return Map.<String, Object>of(
                                    "shortCode", url.getShortCode(),
                                    "weeklyClicks", weeklyClicks,
                                    "totalClicks", totalClicks);
                        })
                        .filter(item -> {
                            long weekly = (Long) item.get("weeklyClicks");
                            long total = (Long) item.get("totalClicks");
                            return weekly > 0 || total > 0;
                        })
                        .toList();

                if (!urlStats.isEmpty()) {
                    emailService.sendWeeklyReport(user, urlStats);
                }
            } catch (Exception exception) {
                log.error("Failed to queue weekly report for user id={}", user.getId(), exception);
            }
        }
    }
}