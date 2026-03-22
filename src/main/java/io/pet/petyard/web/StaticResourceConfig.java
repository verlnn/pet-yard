package io.pet.petyard.web;

import io.pet.petyard.common.storage.FileStorageProperties;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    public StaticResourceConfig(FileStorageProperties fileStorageProperties) {
        this.fileStorageProperties = fileStorageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String publicPath = fileStorageProperties.publicUrlPrefix();
        String normalizedPublicPath = publicPath.endsWith("/") ? publicPath : publicPath + "/";
        String resourcePattern = normalizedPublicPath + "**";
        String location = Path.of(fileStorageProperties.uploadDir())
            .toAbsolutePath()
            .normalize()
            .toUri()
            .toString();

        registry.addResourceHandler(resourcePattern)
            .addResourceLocations(location);
    }
}
