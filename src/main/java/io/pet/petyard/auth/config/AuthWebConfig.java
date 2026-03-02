package io.pet.petyard.auth.config;

import io.pet.petyard.auth.guard.RequirePermissionInterceptor;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AuthWebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new RequirePermissionInterceptor())
            .addPathPatterns("/**");
    }
}
