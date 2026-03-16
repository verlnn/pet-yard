package io.pet.petyard.auth.oauth;

import io.pet.petyard.auth.domain.AuthProvider;

public interface OAuthClient {
    AuthProvider provider();
    String buildAuthorizeUrl(String state);
    OAuthUserInfo fetchUser(String code, String redirectUri);
}
