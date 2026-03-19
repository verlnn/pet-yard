package io.pet.petyard.common.storage;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class LocalFileStorage {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");

    private final FileStorageProperties properties;

    public LocalFileStorage(FileStorageProperties properties) {
        this.properties = properties;
    }

    public String saveFeedImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        String extension = resolveExtension(file);
        Path rootDir = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        Path feedDir = rootDir.resolve("feed");
        String filename = UUID.randomUUID() + "." + extension;
        Path target = feedDir.resolve(filename).normalize();

        try {
            Files.createDirectories(feedDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new ApiException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        String basePath = properties.publicUrlPrefix();
        return basePath + "/feed/" + filename;
    }

    private String resolveExtension(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            String extension = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (ALLOWED_EXTENSIONS.contains(extension)) {
                return extension;
            }
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        }

        String extension = switch (contentType.toLowerCase(Locale.ROOT)) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> null;
        };

        if (extension == null) {
            throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        }
        return extension;
    }
}
