package com.onluyen.url_shortener_backend.common.config;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.DeserializationException;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.util.backoff.ExponentialBackOff;

import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.SerializationException;

@Configuration
public class KafkaConfig {

    @Bean
    public NewTopic clickEventsTopic() {
        return TopicBuilder.name(AppConstant.KAFKA_TOPIC_CLICK_EVENTS)
                .partitions(AppConstant.KAFKA_PARTITIONS)
                .replicas(AppConstant.KAFKA_REPLICAS)
                .build();
    }

    @Bean
    public NewTopic clickEventsDltTopic() {
        return TopicBuilder.name(AppConstant.KAFKA_TOPIC_CLICK_EVENTS_DLT)
                .partitions(AppConstant.KAFKA_DLT_PARTITIONS)
                .replicas(AppConstant.KAFKA_REPLICAS)
                .build();
    }

    @Bean
    public NewTopic emailEventsTopic() {
        return TopicBuilder.name(AppConstant.KAFKA_TOPIC_EMAIL_EVENTS)
                .partitions(AppConstant.KAFKA_PARTITIONS)
                .replicas(AppConstant.KAFKA_REPLICAS)
                .build();
    }

    @Bean
    public NewTopic emailEventsDltTopic() {
        return TopicBuilder.name(AppConstant.KAFKA_TOPIC_EMAIL_EVENTS_DLT)
                .partitions(AppConstant.KAFKA_DLT_PARTITIONS)
                .replicas(AppConstant.KAFKA_REPLICAS)
                .build();
    }

    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        ExponentialBackOff backOff = new ExponentialBackOff(AppConstant.KAFKA_BACKOFF_INITIAL_INTERVAL_MS,
                AppConstant.KAFKA_BACKOFF_MULTIPLIER);
        backOff.setMaxElapsedTime(AppConstant.KAFKA_BACKOFF_MAX_ELAPSED_TIME_MS);

        // Generalized DLT router: each topic routes to its own <topic>.DLT
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template,
                (record, ex) -> new TopicPartition(record.topic() + ".DLT", -1));

        var handler = new DefaultErrorHandler(recoverer, backOff);

        handler.addNotRetryableExceptions(
                SerializationException.class,
                DeserializationException.class,
                IllegalArgumentException.class);
        return handler;
    }
}
