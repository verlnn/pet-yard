package io.pet.petyard.auth.adapter.out.oauth;

import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.oauth.KakaoOAuthProperties;
import io.pet.petyard.auth.oauth.OAuthClient;
import io.pet.petyard.auth.oauth.OAuthUserInfo;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Component
@ConditionalOnProperty(prefix = "kakao.oauth", name = "client-id")
public class KakaoOAuthClient implements OAuthClient {

    private final KakaoOAuthProperties properties;
    private final RestClient restClient;

    public KakaoOAuthClient(KakaoOAuthProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    @Override
    public AuthProvider provider() {
        return AuthProvider.KAKAO;
    }

    @Override
    public String buildAuthorizeUrl(String state) {
        return String.format(
            "%s?response_type=code&client_id=%s&redirect_uri=%s&state=%s",
            properties.authorizeUrl(),
            properties.clientId(),
            properties.redirectUri(),
            state
        );
    }

    @Override
    public OAuthUserInfo fetchUser(String code, String redirectUri) {
        String token = fetchAccessToken(code, redirectUri);

        Map<String, Object> payload = restClient.get()
            .uri(properties.userInfoUrl())
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .body(Map.class);

        if (payload == null || payload.get("id") == null) {
            throw new ApiException(ErrorCode.OAUTH_PROVIDER_FAILED);
        }

        String providerUserId = String.valueOf(payload.get("id"));
        Map<String, Object> kakaoAccount = (Map<String, Object>) payload.get("kakao_account");
        String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;

        Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;
        String nickname = profile != null ? (String) profile.get("nickname") : null;
        String profileImage = profile != null ? (String) profile.get("profile_image_url") : null;

        return new OAuthUserInfo(providerUserId, email, nickname, profileImage);
    }

    private String fetchAccessToken(String code, String redirectUri) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", properties.clientId());
        if (properties.clientSecret() != null && !properties.clientSecret().isBlank()) {
            form.add("client_secret", properties.clientSecret());
        }
        form.add("redirect_uri", redirectUri);
        form.add("code", code);

        Map<String, Object> response = restClient.post()
            .uri(properties.tokenUrl())
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(form)
            .retrieve()
            .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new ApiException(ErrorCode.OAUTH_PROVIDER_FAILED);
        }
        return (String) response.get("access_token");
    }
}
