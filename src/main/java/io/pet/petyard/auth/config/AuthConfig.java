package io.pet.petyard.auth.config;

import io.pet.petyard.auth.jwt.JwtProperties;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(JwtProperties.class)
public class AuthConfig {
}
