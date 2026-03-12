package io.pet.petyard.auth.application.service;

public interface OtpGenerator {
    String generate(String email);
}
