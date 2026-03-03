package io.pet.petyard.auth.security;

import io.jsonwebtoken.JwtException;
import io.pet.petyard.auth.jwt.AuthTokenPayload;
import io.pet.petyard.auth.jwt.JwtTokenProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Collections;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

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
            AuthTokenPayload payload = tokenProvider.parseAndValidate(token);
            AuthPrincipal principal = new AuthPrincipal(payload.userId(), payload.tier());

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                Collections.emptyList()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            filterChain.doFilter(request, response);
        } catch (JwtException ex) {
            errorResponseWriter.write(request, response, HttpServletResponse.SC_UNAUTHORIZED,
                "UNAUTHORIZED", "Invalid or expired token");
        }
    }
}
