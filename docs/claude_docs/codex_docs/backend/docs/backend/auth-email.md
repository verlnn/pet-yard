# Auth Email Delivery

## Purpose
- 이메일 인증(OTP) 전달을 위한 SMTP 발송 로직

## Implementation
- Port: `EmailSender`
- Adapter: `SmtpEmailSender` (JavaMailSender 기반)
- 사용 위치: `AuthApplicationService.signup`

## Local Development
- 기본 SMTP 설정은 환경변수/로컬 프로파일로 주입
- 로컬 테스트 시 Mailpit/MailHog 등으로 확인 가능

예시(Mailpit):
```
# Mailpit 실행 후 (기본 1025 포트)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS=false
```

## Config Keys
- `spring.mail.host`
- `spring.mail.port`
- `spring.mail.username`
- `spring.mail.password`
- `app.mail.from`
