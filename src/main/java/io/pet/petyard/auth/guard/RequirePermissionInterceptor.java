package io.pet.petyard.auth.guard;

import io.pet.petyard.auth.context.AuthContext;
import io.pet.petyard.auth.context.AuthContextHolder;
import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.error.ForbiddenException;
import io.pet.petyard.auth.error.UnauthorizedException;

import java.util.Arrays;
import java.util.EnumSet;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class RequirePermissionInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod handlerMethod)) {
            return true;
        }

        RequirePermission require = findAnnotation(handlerMethod);
        if (require == null) {
            return true;
        }

        AuthContext context = AuthContextHolder.getOptional()
            .orElseThrow(() -> new UnauthorizedException("AUTH_REQUIRED", "Authentication required"));

        EnumSet<Permission> granted = context.permissions();
        EnumSet<Permission> required = EnumSet.copyOf(Arrays.asList(require.value()));

        boolean allowed = switch (require.mode()) {
            case ALL -> granted.containsAll(required);
            case ANY -> required.stream().anyMatch(granted::contains);
        };

        if (!allowed) {
            throw new ForbiddenException("PERMISSION_DENIED", "Permission denied");
        }

        return true;
    }

    private RequirePermission findAnnotation(HandlerMethod handlerMethod) {
        RequirePermission method = handlerMethod.getMethodAnnotation(RequirePermission.class);
        if (method != null) {
            return method;
        }
        return handlerMethod.getBeanType().getAnnotation(RequirePermission.class);
    }
}
