package io.pet.petyard.feed.application.model;

public record HomeFeedAuthorView(
    Long id,
    String username,
    String nickname,
    String profileImageUrl,
    String guardianRelationStatus,
    boolean guardianRegisteredByMe
) {
}
