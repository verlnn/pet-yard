package io.pet.petyard.auth.filter;

import io.jsonwebtoken.JwtException;
import io.pet.petyard.auth.context.AuthContext;
import io.pet.petyard.auth.context.AuthContextHolder;
import io.pet.petyard.auth.jwt.AuthTokenPayload;
import io.pet.petyard.auth.jwt.JwtTokenProvider;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    public JwtAuthFilter(JwtTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                AuthTokenPayload payload = tokenProvider.parseToken(token);
                AuthContext context = AuthContext.of(payload.userId(), payload.tier());
                AuthContextHolder.set(context);
                request.setAttribute(AuthContext.REQUEST_ATTRIBUTE, context);
            }

            filterChain.doFilter(request, response);
        } catch (JwtException ex) {
            writeUnauthorized(response, "AUTH_INVALID_TOKEN", "Invalid or expired token");
        } finally {
            AuthContextHolder.clear();
        }
    }

    private void writeUnauthorized(HttpServletResponse response, String code, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"code\":\"" + code + "\",\"message\":\"" + message + "\"}");
    }
}
