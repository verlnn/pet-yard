package io.pet.petyard.auth.adapter.in.web;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResendEmailRequest(
    @Email @NotBlank String email
) {
}
