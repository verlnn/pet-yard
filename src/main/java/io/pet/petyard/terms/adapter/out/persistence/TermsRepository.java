package io.pet.petyard.terms.adapter.out.persistence;

import io.pet.petyard.terms.domain.model.Terms;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TermsRepository extends JpaRepository<Terms, Long> {
    List<Terms> findByCodeIn(List<String> codes);
}
