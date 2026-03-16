package io.pet.petyard.auth.oauth;

public record OAuthUserInfo(
    String providerUserId,
    String email,
    String nickname,
    String profileImageUrl
) {
}
