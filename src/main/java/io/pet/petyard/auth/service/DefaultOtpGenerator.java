package io.pet.petyard.auth.service;

import java.util.Random;

import org.springframework.stereotype.Component;

@Component
public class DefaultOtpGenerator implements OtpGenerator {

    private final Random random;

    public DefaultOtpGenerator(Random random) {
        this.random = random;
    }

    @Override
    public String generate(String email) {
        int value = random.nextInt(1_000_000);
        return String.format("%06d", value);
    }
}
