package io.pet.petyard.auth.security;

import io.pet.petyard.auth.jwt.JwtTokenProvider;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtTokenProvider tokenProvider,
                                                   ErrorResponseWriter errorResponseWriter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint(errorResponseWriter))
                .accessDeniedHandler(accessDeniedHandler(errorResponseWriter))
            )
            .addFilterBefore(new JwtAuthenticationFilter(tokenProvider, errorResponseWriter),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint(ErrorResponseWriter errorResponseWriter) {
        return (request, response, authException) ->
            errorResponseWriter.write(request, response, 401, "UNAUTHORIZED", "Authentication required");
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler(ErrorResponseWriter errorResponseWriter) {
        return (request, response, accessDeniedException) ->
            errorResponseWriter.write(request, response, 403, "FORBIDDEN", "Permission denied");
    }
}
