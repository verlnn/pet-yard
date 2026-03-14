package io.pet.petyard.auth;

import io.pet.petyard.auth.application.port.out.EmailSender;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class TestEmailSender implements EmailSender {
    @Override
    public void send(String to, String subject, String body) {
        // no-op for tests
    }
}
