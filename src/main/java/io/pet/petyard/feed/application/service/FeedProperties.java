package io.pet.petyard.feed.application.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.feed")
public record FeedProperties(
    int initialLoadSize
) {
    public FeedProperties {
        if (initialLoadSize <= 0) {
            initialLoadSize = 10;
        }
    }
}
