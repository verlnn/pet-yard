package io.pet.petyard.auth.guard;

import io.pet.petyard.auth.domain.Permission;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermission {
    Permission[] value();

    Mode mode() default Mode.ALL;

    enum Mode {
        ALL,
        ANY
    }
}
