package io.pet.petyard.auth.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.pet.petyard.auth.jwt.AccessClaims;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.common.ErrorCode;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import java.time.Duration;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtTokenProvider tokenProvider;
    private final ErrorResponseWriter errorResponseWriter;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, ErrorResponseWriter errorResponseWriter) {
        this.tokenProvider = tokenProvider;
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            AccessClaims payload = tokenProvider.validateAndParseAccessToken(token);
            AuthPrincipal principal = new AuthPrincipal(payload.userId(), payload.tier());
            long remainingSeconds = Duration.between(Instant.now(), payload.expiresAt()).getSeconds();
            log.info("Access token remaining: {}s (uid={}, path={})",
                Math.max(remainingSeconds, 0),
                payload.userId(),
                request.getRequestURI());

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                Collections.emptyList()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (ExpiredJwtException ex) {
            Instant expiresAt = ex.getClaims().getExpiration().toInstant();
            long remainingSeconds = Duration.between(Instant.now(), expiresAt).getSeconds();
            log.info("Access token remaining: {}s (uid=unknown, path={})",
                remainingSeconds,
                request.getRequestURI());
            errorResponseWriter.write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                ErrorCode.INVALID_TOKEN, ex);
        } catch (JwtException ex) {
            errorResponseWriter.write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                ErrorCode.INVALID_TOKEN, ex);
        }
    }
}
