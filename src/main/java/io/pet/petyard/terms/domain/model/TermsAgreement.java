package io.pet.petyard.terms.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "terms_agreements")
public class TermsAgreement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long termsId;

    @Column(nullable = false)
    private Instant agreedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected TermsAgreement() {
    }

    public TermsAgreement(Long userId, Long termsId, Instant agreedAt) {
        this.userId = userId;
        this.termsId = termsId;
        this.agreedAt = agreedAt;
        this.createdAt = agreedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getTermsId() {
        return termsId;
    }

    public Instant getAgreedAt() {
        return agreedAt;
    }
}
