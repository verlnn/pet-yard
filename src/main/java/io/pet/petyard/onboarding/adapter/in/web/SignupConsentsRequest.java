package io.pet.petyard.onboarding.adapter.in.web;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record SignupConsentsRequest(
    @NotEmpty List<ConsentItemRequest> consents
) {
    public record ConsentItemRequest(String code, boolean agreed) {
    }
}
