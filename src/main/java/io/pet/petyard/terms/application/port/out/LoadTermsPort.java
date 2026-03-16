package io.pet.petyard.terms.application.port.out;

import io.pet.petyard.terms.domain.model.Terms;

import java.util.List;

public interface LoadTermsPort {
    List<Terms> findByCodes(List<String> codes);
    List<Terms> findAll();
}
