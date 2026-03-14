package io.pet.petyard.auth.adapter.out.mail;

import io.pet.petyard.auth.application.port.out.EmailSender;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.context.annotation.Profile;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Profile("local")
@Primary
@ConditionalOnBean(JavaMailSender.class)
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpEmailSender(JavaMailSender mailSender,
                           @Value("${app.mail.from:no-reply@pet-yard.local}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void send(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setFrom(fromAddress);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
