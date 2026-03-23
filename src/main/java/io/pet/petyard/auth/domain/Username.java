package io.pet.petyard.auth.domain;

import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

public final class Username {

    public static final int MAX_LENGTH = 30;
    public static final String REGEX = "^(?!\\.)(?!.*\\.\\.)(?!.*\\.$)[a-z0-9._]{3,30}$";
    private static final Pattern PATTERN = Pattern.compile(REGEX);

    private final String value;

    private Username(String value) {
        this.value = value;
    }

    public static Username fromRaw(String raw) {
        String normalized = normalize(raw);
        if (!isValidNormalized(normalized)) {
            throw new IllegalArgumentException("Invalid username");
        }
        return new Username(normalized);
    }

    public static String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        return raw.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isValidNormalized(String normalized) {
        return normalized != null && PATTERN.matcher(normalized).matches();
    }

    public static String legacyFallback(Long userId) {
        Objects.requireNonNull(userId, "userId");
        return "user." + userId;
    }

    public String value() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
