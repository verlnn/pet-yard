package io.pet.petyard.auth.adapter.out.mail;

import io.pet.petyard.auth.application.port.out.EmailSender;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

@Component
//@ConditionalOnMissingBean(EmailSender.class)
@ConditionalOnMissingBean(org.springframework.mail.javamail.JavaMailSender.class)
public class NoopEmailSender implements EmailSender {

    private static final Logger log = LoggerFactory.getLogger(NoopEmailSender.class);

    @Override
    public void send(String to, String subject, String body) {
        log.warn("[EMAIL][SKIP] No EmailSender configured. to={}, subject={}", to, subject);
    }
}
