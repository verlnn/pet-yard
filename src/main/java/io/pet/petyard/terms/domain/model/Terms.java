package io.pet.petyard.terms.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "terms")
public class Terms {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private int version;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private boolean mandatory;

    private String contentUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    protected Terms() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public int getVersion() {
        return version;
    }

    public String getTitle() {
        return title;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public String getContentUrl() {
        return contentUrl;
    }
}
