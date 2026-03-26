package com.onluyen.url_shortener_backend.analytics.kafka;

import com.onluyen.url_shortener_backend.analytics.dto.ClickEventDto;
import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.CompletableFuture;
import org.springframework.kafka.support.SendResult;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClickEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishClickEvent(ClickEventDto eventDto) {
        log.info("Publishing click event for short code: {}", eventDto.getShortCode());
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(AppConstant.KAFKA_TOPIC_CLICK_EVENTS,
                eventDto.getShortCode(), eventDto);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("Sent click event=[{}] with offset=[{}]", eventDto, result.getRecordMetadata().offset());
            } else {
                log.error("Unable to send click event=[{}] due to: {}", eventDto, ex.getMessage(), ex);
            }
        });
    }
}
