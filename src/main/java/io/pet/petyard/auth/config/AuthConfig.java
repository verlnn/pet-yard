package io.pet.petyard.auth.config;

import io.pet.petyard.auth.jwt.JwtProperties;
import io.pet.petyard.auth.oauth.KakaoOAuthProperties;

import java.security.SecureRandom;
import java.time.Clock;
import java.util.Random;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableConfigurationProperties({JwtProperties.class, KakaoOAuthProperties.class})
public class AuthConfig {
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public SecureRandom secureRandom() {
        return new SecureRandom();
    }

    @Bean
    public Random random(SecureRandom secureRandom) {
        return secureRandom;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
