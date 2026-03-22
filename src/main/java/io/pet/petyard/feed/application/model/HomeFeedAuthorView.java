package io.pet.petyard.feed.application.model;

public record HomeFeedAuthorView(
    Long id,
    String nickname,
    String profileImageUrl,
    boolean guardianRegisteredByMe
) {
}
