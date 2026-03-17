package io.pet.petyard.auth.security;

import java.io.IOException;

import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.application.service.ErrorLogService;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@Component
public class ErrorResponseWriter {

    private final ObjectMapper objectMapper;
    private final ErrorLogService errorLogService;

    public ErrorResponseWriter(ObjectMapper objectMapper, ErrorLogService errorLogService) {
        this.objectMapper = objectMapper;
        this.errorLogService = errorLogService;
    }

    public void write(HttpServletRequest request, HttpServletResponse response, int status, ErrorCode errorCode)
        throws IOException {
        write(request, response, status, errorCode, null);
    }

    public void write(HttpServletRequest request, HttpServletResponse response, int status, ErrorCode errorCode,
                      Throwable ex) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ErrorResponse body = ErrorResponse.of(errorCode, request.getRequestURI());
        errorLogService.record(request, status, errorCode.code(), errorCode.message(), ex);
        objectMapper.writeValue(response.getWriter(), body);
    }
}
