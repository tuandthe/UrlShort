package com.onluyen.url_shortener_backend.analytics.kafka;

import com.onluyen.url_shortener_backend.analytics.dto.ClickEventDto;
import com.onluyen.url_shortener_backend.analytics.entity.ClickEvent;
import com.onluyen.url_shortener_backend.analytics.repository.ClickEventRepository;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClickEventConsumer {

    private final ClickEventRepository clickEventRepository;
    private final UrlRepository urlRepository;

    @KafkaListener(topics = AppConstant.KAFKA_TOPIC_CLICK_EVENTS, groupId = AppConstant.KAFKA_GROUP_ANALYTICS)
    @Transactional
    public void consume(List<ClickEventDto> eventDtos) {
        try {
            log.info("Consumed {} click events", eventDtos.size());

            List<String> shortCodes = eventDtos.stream().map(ClickEventDto::getShortCode).distinct().toList();
            Map<String, Url> urlMap = urlRepository.findByShortCodeIn(shortCodes).stream()
                    .collect(Collectors.toMap(Url::getShortCode, u -> u));

            List<ClickEvent> clickEvents = new ArrayList<>();
            Map<String, Long> urlClickCounts = new HashMap<>();

            for (ClickEventDto eventDto : eventDtos) {
                Url url = urlMap.get(eventDto.getShortCode());
                if (url == null) {
                    log.warn("URL not found for short code: {}", eventDto.getShortCode());
                    continue;
                }

                urlClickCounts.merge(url.getShortCode(), 1L, Long::sum);

                ClickEvent event = ClickEvent.builder()
                        .url(url)
                        .ipAddress(eventDto.getIpAddress())
                        .userAgent(eventDto.getUserAgent())
                        .referer(eventDto.getReferer())
                        .clickedAt(eventDto.getTimestamp())
                        .build();

                clickEvents.add(event);
            }

            urlClickCounts.forEach((shortCode, count) -> urlRepository.incrementClickCount(shortCode, count));

            clickEventRepository.saveAll(clickEvents);
        } catch (Exception e) {
            log.error("Error processing batch of {} click events. Exception: {}", eventDtos.size(), e.getMessage(), e);
            throw e; // Rethrow to trigger Spring Kafka retry/error handling
        }
    }
}
