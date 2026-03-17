package io.pet.petyard.onboarding;

import io.pet.petyard.auth.domain.AuthProvider;
import io.pet.petyard.auth.oauth.OAuthClient;
import io.pet.petyard.auth.oauth.OAuthUserInfo;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

@TestConfiguration
public class TestOAuthConfig {

    @Bean
    public OAuthClient fakeKakaoOAuthClient() {
        return new OAuthClient() {
            @Override
            public AuthProvider provider() {
                return AuthProvider.KAKAO;
            }

            @Override
            public String buildAuthorizeUrl(String state, String prompt) {
                return "https://fake.kakao/authorize?state=" + state + "&prompt=" + prompt;
            }

            @Override
            public OAuthUserInfo fetchUser(String code, String redirectUri) {
                return new OAuthUserInfo("kakao-123", "kakao@test.com", "카카오멍냥", "https://img.test/profile.png");
            }
        };
    }
}
