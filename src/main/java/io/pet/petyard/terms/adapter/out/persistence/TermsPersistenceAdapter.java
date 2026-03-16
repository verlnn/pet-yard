package io.pet.petyard.terms.adapter.out.persistence;

import io.pet.petyard.terms.application.port.out.LoadTermsPort;
import io.pet.petyard.terms.application.port.out.SaveTermsAgreementPort;
import io.pet.petyard.terms.domain.model.Terms;
import io.pet.petyard.terms.domain.model.TermsAgreement;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class TermsPersistenceAdapter implements LoadTermsPort, SaveTermsAgreementPort {

    private final TermsRepository termsRepository;
    private final TermsAgreementRepository agreementRepository;

    public TermsPersistenceAdapter(TermsRepository termsRepository, TermsAgreementRepository agreementRepository) {
        this.termsRepository = termsRepository;
        this.agreementRepository = agreementRepository;
    }

    @Override
    public List<Terms> findByCodes(List<String> codes) {
        return termsRepository.findByCodeIn(codes);
    }

    @Override
    public List<Terms> findAll() {
        return termsRepository.findAll();
    }

    @Override
    public TermsAgreement save(TermsAgreement agreement) {
        return agreementRepository.save(agreement);
    }
}
