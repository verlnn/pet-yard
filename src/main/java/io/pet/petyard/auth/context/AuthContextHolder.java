package io.pet.petyard.auth.context;

import java.util.Optional;

public final class AuthContextHolder {

    private static final ThreadLocal<AuthContext> HOLDER = new ThreadLocal<>();

    private AuthContextHolder() {
    }

    public static void set(AuthContext context) {
        HOLDER.set(context);
    }

    public static Optional<AuthContext> getOptional() {
        return Optional.ofNullable(HOLDER.get());
    }

    public static AuthContext getRequired() {
        AuthContext context = HOLDER.get();
        if (context == null) {
            throw new IllegalStateException("AuthContext not initialized");
        }
        return context;
    }

    public static void clear() {
        HOLDER.remove();
    }
}
