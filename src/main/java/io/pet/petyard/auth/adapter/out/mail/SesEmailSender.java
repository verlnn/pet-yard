package io.pet.petyard.auth.adapter.out.mail;

import io.pet.petyard.auth.application.port.out.EmailSender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@Primary
public class SesEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(SesEmailSender.class);

    @Override
    public void send(String to, String subject, String body) {
        // TODO: AWS SES SDK 연동 예정
        log.warn("[EMAIL][SES][TODO] SES sender not configured. to={}, subject={}", to, subject);
    }
}
