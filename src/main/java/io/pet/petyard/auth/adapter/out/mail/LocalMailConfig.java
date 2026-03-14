package io.pet.petyard.auth.adapter.out.mail;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@Profile("local")
public class LocalMailConfig {

    @Bean
    @ConditionalOnMissingBean(JavaMailSender.class)
    public JavaMailSender localJavaMailSender(
        @Value("${spring.mail.host:localhost}") String host,
        @Value("${spring.mail.port:1025}") int port,
        @Value("${spring.mail.username:}") String username,
        @Value("${spring.mail.password:}") String password,
        @Value("${spring.mail.properties.mail.smtp.auth:false}") String smtpAuth,
        @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}") String startTls
    ) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties javaMailProps = sender.getJavaMailProperties();
        javaMailProps.setProperty("mail.smtp.auth", smtpAuth);
        javaMailProps.setProperty("mail.smtp.starttls.enable", startTls);

        return sender;
    }
}
