package io.pet.petyard.auth.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.pet.petyard.auth.domain.UserTier;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;

import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {

    private final JwtProperties properties;
    private final Key key;

    public JwtTokenProvider(JwtProperties properties) {
        this.properties = properties;
        this.key = createKey(properties.secret());
    }

    public String createAccessToken(long userId, UserTier tier) {
        Instant now = Clock.systemUTC().instant();
        Instant exp = now.plusSeconds(properties.expSeconds());

        return Jwts.builder()
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(exp))
            .claim("uid", userId)
            .claim("tier", tier.name())
            .signWith(key, SignatureAlgorithm.HS256)
            .compact();
    }

    public AuthTokenPayload parseAndValidate(String token) {
        try {
            Jws<Claims> jws = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);

            Claims claims = jws.getBody();
            Number uid = claims.get("uid", Number.class);
            String tierName = claims.get("tier", String.class);

            if (uid == null || tierName == null) {
                throw new JwtException("Missing required claims");
            }

            UserTier tier = UserTier.valueOf(tierName);
            return new AuthTokenPayload(uid.longValue(), tier);
        } catch (IllegalArgumentException ex) {
            throw new JwtException("Invalid token", ex);
        }
    }

    private static Key createKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("auth.jwt.secret is required");
        }

        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) {
            throw new IllegalStateException("auth.jwt.secret must be at least 32 bytes for HS256");
        }

        return Keys.hmacShaKeyFor(raw);
    }
}
