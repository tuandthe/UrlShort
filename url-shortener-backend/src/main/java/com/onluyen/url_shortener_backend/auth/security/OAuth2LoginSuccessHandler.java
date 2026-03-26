package com.onluyen.url_shortener_backend.auth.security;

import com.onluyen.url_shortener_backend.common.constant.AppConstant;
import com.onluyen.url_shortener_backend.common.security.JwtProvider;
import com.onluyen.url_shortener_backend.common.util.PiiMasker;
import com.onluyen.url_shortener_backend.notification.service.EmailService;
import com.onluyen.url_shortener_backend.user.entity.AuthProvider;
import com.onluyen.url_shortener_backend.user.entity.Role;
import com.onluyen.url_shortener_backend.user.entity.User;
import com.onluyen.url_shortener_backend.user.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import org.springframework.data.redis.core.StringRedisTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    @Value("${app.jwtRefreshExpirationMs}")
    private long refreshExpirationInMs;

    @Value("${app.oauth2.authorizedRedirectUri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String providerId = oAuth2User.getAttribute("sub"); // Google returns 'sub' as id

        log.info("OAuth2 success for user: {}", PiiMasker.maskEmail(email));

        // upsert user if not exist
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isEmpty()) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(providerId);
            user.setRole(Role.USER);
            user.setActive(true);
            userRepository.save(user);
            emailService.sendWelcomeEmail(user);
        } else {
            user = userOpt.get();
            if (!user.isActive()) {
                String separator = redirectUri.contains("?") ? "&" : "?";
                String targetUrl = redirectUri + separator + "error=account_inactive";
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
                return;
            }
        }

        // generate tokens
        String accessToken = jwtTokenProvider.generateToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        redisTemplate.opsForValue().set(
                AppConstant.REDIS_REFRESH_TOKEN_PREFIX + user.getEmail(),
                refreshToken,
                Duration.ofMillis(refreshExpirationInMs));

        if (!redirectUri.contains(AppConstant.OAUTH_CALLBACK_PATH)) {
            log.warn("OAuth2 redirect URI does not target callback route: {}", redirectUri);
        }

        String encodedAccessToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        String encodedRefreshToken = URLEncoder.encode(refreshToken, StandardCharsets.UTF_8);
        String separator = redirectUri.contains("?") ? "&" : "?";

        // redirect with tokens
        String targetUrl = redirectUri + separator + AppConstant.OAUTH_ACCESS_TOKEN_PARAM + "=" + encodedAccessToken
                + "&" + AppConstant.OAUTH_REFRESH_TOKEN_PARAM + "=" + encodedRefreshToken;
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
