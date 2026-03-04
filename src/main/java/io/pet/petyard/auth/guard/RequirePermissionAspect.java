package io.pet.petyard.auth.guard;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ErrorCode;

import java.util.Arrays;
import java.util.EnumSet;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class RequirePermissionAspect {

    @Around("@annotation(io.pet.petyard.auth.guard.RequirePermission) || @within(io.pet.petyard.auth.guard.RequirePermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        RequirePermission require = resolveAnnotation(joinPoint);
        if (require == null) {
            return joinPoint.proceed();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.UNAUTHORIZED.message());
        }

        Object principalObj = authentication.getPrincipal();
        if (!(principalObj instanceof AuthPrincipal principal)) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.UNAUTHORIZED.message());
        }

        EnumSet<Permission> granted = principal.permissions();
        EnumSet<Permission> required = EnumSet.copyOf(Arrays.asList(require.value()));

        boolean allowed = switch (require.mode()) {
            case ALL -> granted.containsAll(required);
            case ANY -> required.stream().anyMatch(granted::contains);
        };

        if (!allowed) {
            throw new AccessDeniedException(ErrorCode.FORBIDDEN.message());
        }

        return joinPoint.proceed();
    }

    private RequirePermission resolveAnnotation(ProceedingJoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        RequirePermission method = signature.getMethod().getAnnotation(RequirePermission.class);
        if (method != null) {
            return method;
        }
        return joinPoint.getTarget().getClass().getAnnotation(RequirePermission.class);
    }
}
