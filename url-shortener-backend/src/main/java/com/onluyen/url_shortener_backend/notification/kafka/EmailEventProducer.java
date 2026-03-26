package com.onluyen.url_shortener_backend.notification.kafka;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.util.PiiMasker;
import com.onluyen.url_shortener_backend.notification.dto.EmailEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

/**
 * Kafka producer that publishes email events asynchronously.
 * Follows the exact same pattern as ClickEventProducer for consistency.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishEmailEvent(EmailEventDto eventDto) {
        String maskedEmail = PiiMasker.maskEmail(eventDto.getTo());
        log.info("Publishing email event type=[{}] to=[{}]", eventDto.getType(), maskedEmail);
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                AppConstant.KAFKA_TOPIC_EMAIL_EVENTS,
                eventDto.getTo(), // partition key = recipient
                eventDto);

        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.debug("Sent email event=[{}] with offset=[{}]",
                        eventDto.getType(), result.getRecordMetadata().offset());
            } else {
                log.error("Unable to send email event=[{}] to=[{}] due to: {}",
                        eventDto.getType(), maskedEmail, ex.getMessage(), ex);
            }
        });
    }
}
