package io.pet.petyard.feed.adapter.in.web;

public record FeedPostRequest(
    String content,
    String imageUrl
) {
}
