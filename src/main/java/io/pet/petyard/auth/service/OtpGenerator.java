package io.pet.petyard.auth.service;

public interface OtpGenerator {
    String generate(String email);
}
