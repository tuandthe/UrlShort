package com.onluyen.url_shortener_backend.url.strategy;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import org.springframework.stereotype.Service;
import java.security.SecureRandom;

@Service
public class RandomStringGenerator implements ShortCodeGenerator {

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public String generate() {
        StringBuilder sb = new StringBuilder(AppConstant.SHORT_CODE_DEFAULT_LENGTH);
        for (int i = 0; i < AppConstant.SHORT_CODE_DEFAULT_LENGTH; i++) {
            sb.append(AppConstant.ALLOWED_STRING.charAt(secureRandom.nextInt(AppConstant.ALLOWED_STRING.length())));
        }
        return sb.toString();
    }

    @Override
    public String getType() {
        return "RANDOM";
    }
}
