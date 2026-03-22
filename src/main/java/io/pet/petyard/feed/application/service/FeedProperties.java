package io.pet.petyard.feed.application.service;

import jakarta.validation.constraints.Positive;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.feed")
public record FeedProperties(
    @Positive int initialLoadSize,
    @Positive int maxLoadSize
) {
    public FeedProperties {
        if (initialLoadSize <= 0) {
            initialLoadSize = 10;
        }
        if (maxLoadSize <= 0) {
            maxLoadSize = Math.max(initialLoadSize, 20);
        }
        if (maxLoadSize < initialLoadSize) {
            maxLoadSize = initialLoadSize;
        }
    }

    public int resolvePageSize(Integer requestedLimit) {
        if (requestedLimit == null || requestedLimit <= 0) {
            return initialLoadSize;
        }
        return Math.min(requestedLimit, maxLoadSize);
    }
}
