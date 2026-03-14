package io.pet.petyard.auth;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

@TestConfiguration
public class TestOtpConfig {

    @Bean
    @Primary
    public CapturingOtpGenerator capturingOtpGenerator() {
        return new CapturingOtpGenerator();
    }

    @Bean
    @Primary
    public MutableClock mutableClock() {
        return new MutableClock();
    }
}
