package com.onluyen.url_shortener_backend.notification.kafka;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.util.PiiMasker;
import com.onluyen.url_shortener_backend.notification.dto.EmailEventDto;
import com.onluyen.url_shortener_backend.notification.service.EmailTemplateRenderer;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.util.List;

/**
 * Kafka consumer that processes email events and sends them via SMTP.
 *
 * <p>
 * Batch processing: consumes a list of events at once for efficiency.
 * On failure: Spring Kafka's DefaultErrorHandler applies exponential backoff,
 * then routes failed messages to "email-events.DLT" for manual inspection.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailEventConsumer {

    private final JavaMailSender mailSender;
    private final EmailTemplateRenderer templateRenderer;

    @Value("${app.mail.from:noreply@urlshort.io}")
    private String fromEmail;

    @Value("${app.mail.from-name:UrlShort}")
    private String fromName;

    @KafkaListener(topics = AppConstant.KAFKA_TOPIC_EMAIL_EVENTS, groupId = AppConstant.KAFKA_GROUP_EMAIL)
    public void consume(List<EmailEventDto> events) {
        log.info("Consumed {} email events", events.size());

        for (EmailEventDto event : events) {
            String maskedEmail = PiiMasker.maskEmail(event.getTo());
            try {
                sendEmail(event);
                log.debug("Email sent: type=[{}] to=[{}]", event.getType(), maskedEmail);
            } catch (Exception e) {
                log.error("Failed to send email: type=[{}] to=[{}] error={}",
                        event.getType(), maskedEmail, e.getMessage(), e);
                throw new RuntimeException("Email send failure — triggering retry/DLT", e);
            }
        }
    }

    private void sendEmail(EmailEventDto event) throws MessagingException, UnsupportedEncodingException {
        String htmlBody = templateRenderer.render(event.getTemplateName(), event.getVariables());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(new InternetAddress(fromEmail, fromName));
        helper.setTo(event.getTo());
        helper.setSubject(event.getSubject());
        helper.setText(htmlBody, true); // true = isHtml
        mailSender.send(message);
    }
}
