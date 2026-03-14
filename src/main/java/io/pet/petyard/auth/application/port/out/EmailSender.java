package io.pet.petyard.auth.application.port.out;

public interface EmailSender {
    void send(String to, String subject, String body);
}
