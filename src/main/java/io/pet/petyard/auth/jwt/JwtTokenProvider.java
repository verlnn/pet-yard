package io.pet.petyard.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.common.ErrorCode;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;

import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final JwtProperties properties;
    private final Key key;
    private final Clock clock;
    private final SecureRandom secureRandom;

    public JwtTokenProvider(JwtProperties properties, Clock clock, SecureRandom secureRandom) {
        this.properties = properties;
        this.key = createKey(properties.secret());
        this.clock = clock;
        this.secureRandom = secureRandom;
    }

    public String createAccessToken(long userId, UserTier tier) {
        Instant now = clock.instant();
        Instant exp = now.plusSeconds(properties.accessTtlSeconds());

        return Jwts.builder()
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(exp))
            .claim("uid", userId)
            .claim("tier", tier.name())
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public AccessClaims validateAndParseAccessToken(String token) {
        try {
            Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);

            Claims claims = jws.getBody();
            Number uid = claims.get("uid", Number.class);
            String tierName = claims.get("tier", String.class);

            if (uid == null || tierName == null) {
            throw new JwtException(ErrorCode.INVALID_TOKEN.message());
            }

            UserTier tier = UserTier.valueOf(tierName);
            return new AccessClaims(uid.longValue(), tier);
        } catch (IllegalArgumentException ex) {
            throw new JwtException(ErrorCode.INVALID_TOKEN.message(), ex);
        }
    }

    public String createRefreshToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hashRefreshToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            // TODO: salt 적용 고려 (운영 환경)
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ErrorCode.CRYPTO_NOT_SUPPORTED.message(), ex);
        }
    }

    public Instant refreshExpiry() {
        return clock.instant().plusSeconds(properties.refreshTtlSeconds());
    }

    private static Key createKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(ErrorCode.CONFIG_SECRET_REQUIRED.message());
        }

        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) {
            throw new IllegalStateException(ErrorCode.CONFIG_SECRET_TOO_SHORT.message());
        }

        return Keys.hmacShaKeyFor(raw);
    }
}
