package io.pet.petyard.common.storage;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Base64;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class LocalFileStorage {

    private static final Logger log = LoggerFactory.getLogger(LocalFileStorage.class);
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private static final Pattern DATA_URL_PATTERN =
        Pattern.compile("^data:(image/[a-zA-Z0-9.+-]+);base64,(.+)$", Pattern.DOTALL);

    private final FileStorageProperties properties;

    public LocalFileStorage(FileStorageProperties properties) {
        this.properties = properties;
    }

    public String saveFeedImage(Long userId, MultipartFile file, Double aspectRatioValue, String aspectRatio) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (userId == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        String extension = resolveExtension(file);
        String outputExtension = shouldCrop(aspectRatio, aspectRatioValue) ? toOutputExtension(extension) : extension;
        Path rootDir = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        Path feedDir = rootDir.resolve("feed").resolve(String.valueOf(userId));
        String filename = UUID.randomUUID() + "." + outputExtension;
        Path target = feedDir.resolve(filename).normalize();

        try {
            Files.createDirectories(feedDir);
            if (shouldCrop(aspectRatio, aspectRatioValue)) {
                cropAndSave(file, target, outputExtension, aspectRatioValue);
            } else {
                try (InputStream inputStream = file.getInputStream()) {
                    Files.copy(inputStream, target);
                }
            }
        } catch (IOException ex) {
            throw new ApiException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        String basePath = properties.publicUrlPrefix();
        String publicPath = basePath + "/feed/" + userId + "/" + filename;
        log.info("피드 이미지 저장 완료: userId={}, 원본파일명={}, 저장경로={}, 공개경로={}, 비율={}, 비율값={}",
            userId,
            file.getOriginalFilename(),
            target,
            publicPath,
            aspectRatio,
            aspectRatioValue);
        return publicPath;
    }

    public String resolvePetImage(Long userId, String incomingPhotoUrl, String existingPhotoUrl) {
        String normalizedIncoming = normalizeBlank(incomingPhotoUrl);
        String normalizedExisting = normalizeBlank(existingPhotoUrl);

        if (normalizedIncoming == null) {
            deleteManagedPetImage(normalizedExisting);
            return null;
        }
        if (normalizedIncoming.equals(normalizedExisting)) {
            return normalizedIncoming;
        }
        if (isDataUrlImage(normalizedIncoming)) {
            String savedPhotoUrl = savePetImage(userId, normalizedIncoming);
            deleteManagedPetImage(normalizedExisting);
            return savedPhotoUrl;
        }

        if (normalizedExisting != null && !normalizedExisting.equals(normalizedIncoming)) {
            deleteManagedPetImage(normalizedExisting);
        }
        return normalizedIncoming;
    }

    public String savePetImage(Long userId, String dataUrl) {
        if (userId == null) {
            throw new ApiException(ErrorCode.BAD_REQUEST);
        }

        Matcher matcher = DATA_URL_PATTERN.matcher(normalizeBlank(dataUrl) == null ? "" : dataUrl.trim());
        if (!matcher.matches()) {
            throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        }

        String mimeType = matcher.group(1).toLowerCase(Locale.ROOT);
        String payload = matcher.group(2);
        String extension = resolveExtensionFromMimeType(mimeType);
        String filename = UUID.randomUUID() + "." + extension;
        Path rootDir = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        Path petDir = rootDir.resolve("pets").resolve(String.valueOf(userId));
        Path target = petDir.resolve(filename).normalize();

        try {
            Files.createDirectories(petDir);
            byte[] imageBytes = Base64.getMimeDecoder().decode(payload);
            Files.write(target, imageBytes, StandardOpenOption.CREATE_NEW);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        } catch (IOException ex) {
            throw new ApiException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        String publicPath = properties.publicUrlPrefix() + "/pets/" + userId + "/" + filename;
        log.info("반려동물 이미지 저장 완료: userId={}, 저장경로={}, 공개경로={}", userId, target, publicPath);
        return publicPath;
    }

    public void deleteManagedPetImage(String photoUrl) {
        Path target = resolveManagedPetPath(photoUrl);
        if (target == null) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ex) {
            log.warn("반려동물 이미지 삭제 실패: photoUrl={}, path={}", photoUrl, target, ex);
        }
    }

    private boolean shouldCrop(String aspectRatio, Double aspectRatioValue) {
        return aspectRatio != null
            && !aspectRatio.isBlank()
            && !"original".equalsIgnoreCase(aspectRatio)
            && aspectRatioValue != null
            && aspectRatioValue > 0;
    }

    private void cropAndSave(MultipartFile file, Path target, String extension, Double aspectRatioValue) throws IOException {
        BufferedImage sourceImage;
        try (InputStream inputStream = file.getInputStream()) {
            sourceImage = ImageIO.read(inputStream);
        }

        if (sourceImage == null) {
            throw new ApiException(ErrorCode.IMAGE_PROCESSING_FAILED);
        }

        int sourceWidth = sourceImage.getWidth();
        int sourceHeight = sourceImage.getHeight();
        double sourceRatio = (double) sourceWidth / sourceHeight;
        double targetRatio = aspectRatioValue;

        int cropWidth = sourceWidth;
        int cropHeight = sourceHeight;
        int offsetX = 0;
        int offsetY = 0;

        if (sourceRatio > targetRatio) {
            cropWidth = (int) Math.round(sourceHeight * targetRatio);
            offsetX = Math.max(0, (sourceWidth - cropWidth) / 2);
        } else if (sourceRatio < targetRatio) {
            cropHeight = (int) Math.round(sourceWidth / targetRatio);
            offsetY = Math.max(0, (sourceHeight - cropHeight) / 2);
        }

        BufferedImage cropped = sourceImage.getSubimage(offsetX, offsetY, cropWidth, cropHeight);
        String writeFormat = toOutputExtension(extension);

        try (OutputStream outputStream = Files.newOutputStream(target)) {
            boolean written = ImageIO.write(cropped, writeFormat, outputStream);
            if (!written) {
                throw new ApiException(ErrorCode.IMAGE_PROCESSING_FAILED);
            }
        }
    }

    private String toOutputExtension(String extension) {
        return switch (extension) {
            case "jpeg", "jpg", "png", "gif" -> extension;
            case "webp" -> "png";
            default -> throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        };
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

    private boolean isDataUrlImage(String value) {
        return value != null && DATA_URL_PATTERN.matcher(value).matches();
    }

    private String resolveExtensionFromMimeType(String mimeType) {
        return switch (mimeType) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> throw new ApiException(ErrorCode.INVALID_FILE_TYPE);
        };
    }

    private Path resolveManagedPetPath(String photoUrl) {
        String normalizedPhotoUrl = normalizeBlank(photoUrl);
        if (normalizedPhotoUrl == null) {
            return null;
        }

        String publicPrefix = properties.publicUrlPrefix();
        String petPrefix = publicPrefix + "/pets/";
        if (!normalizedPhotoUrl.startsWith(petPrefix)) {
            return null;
        }

        String relativePath = normalizedPhotoUrl.substring(publicPrefix.length());
        if (relativePath.startsWith("/")) {
            relativePath = relativePath.substring(1);
        }

        Path rootDir = Path.of(properties.uploadDir()).toAbsolutePath().normalize();
        Path target = rootDir.resolve(relativePath).normalize();
        if (!target.startsWith(rootDir)) {
            return null;
        }
        return target;
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
