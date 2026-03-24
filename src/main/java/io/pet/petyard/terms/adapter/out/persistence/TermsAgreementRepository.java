package io.pet.petyard.terms.adapter.out.persistence;

import io.pet.petyard.terms.domain.model.TermsAgreement;

import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TermsAgreementRepository extends JpaRepository<TermsAgreement, Long> {
    void deleteByUserIdIn(Collection<Long> userIds);
}
