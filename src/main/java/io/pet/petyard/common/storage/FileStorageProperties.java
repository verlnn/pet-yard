package io.pet.petyard.common.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.storage")
public record FileStorageProperties(
    String uploadDir,
    String publicUrlPrefix
) {
}
