package io.pet.petyard.auth.oauth;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "kakao.oauth")
public record KakaoOAuthProperties(
    String clientId,
    String clientSecret,
    String redirectUri,
    String authorizeUrl,
    String tokenUrl,
    String userInfoUrl
) {
}
