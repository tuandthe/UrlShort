package com.onluyen.url_shortener_backend.url.strategy;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.util.Base62Encoder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisCounterGenerator implements ShortCodeGenerator {

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    public String generate() {
        Long counter = stringRedisTemplate.opsForValue().increment(AppConstant.REDIS_COUNTER_KEY);
        if (counter == null) {
            throw new IllegalStateException("Redis counter increment failed");
        }
        return Base62Encoder.encode(counter);
    }

    @Override
    public String getType() {
        return "COUNTER";
    }
}
