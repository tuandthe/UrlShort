package com.onluyen.url_shortener_backend.analytics.service;

import com.onluyen.url_shortener_backend.analytics.dto.AnalyticsResponse;
import com.onluyen.url_shortener_backend.analytics.repository.ClickEventRepository;
import com.onluyen.url_shortener_backend.common.exception.BusinessException;
import com.onluyen.url_shortener_backend.common.exception.ErrorCode;
import com.onluyen.url_shortener_backend.url.entity.Url;
import com.onluyen.url_shortener_backend.url.repository.UrlRepository;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ClickEventRepository clickEventRepository;
    private final UrlRepository urlRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsResponse getUrlAnalytics(Long urlId, String userEmail) {
        validateUrlOwnership(urlId, userEmail);

        return AnalyticsResponse.builder()
                .totalClicks(clickEventRepository.countByUrlId(urlId))
                .clicksByDate(clickEventRepository.findClicksByDate(urlId))
                .topReferers(clickEventRepository.findTopReferers(urlId))
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUrlClicksByDate(Long urlId, String userEmail) {
        validateUrlOwnership(urlId, userEmail);
        return clickEventRepository.findClicksByDate(urlId);
    }

    private Url validateUrlOwnership(Long urlId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new BusinessException(ErrorCode.URL_NOT_FOUND));

        if (!url.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return url;
    }
}
