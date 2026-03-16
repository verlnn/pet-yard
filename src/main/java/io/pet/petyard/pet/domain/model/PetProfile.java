package io.pet.petyard.pet.domain.model;

import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "pet_profiles", schema = "pet")
public class PetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetSpecies species;

    private String breed;

    private LocalDate birthDate;

    private String ageGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetGender gender;

    private Boolean neutered;

    private String intro;

    private String photoUrl;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected PetProfile() {
    }

    public PetProfile(Long userId, String name, PetSpecies species, String breed, LocalDate birthDate, String ageGroup,
                      PetGender gender, Boolean neutered, String intro, String photoUrl) {
        this.userId = userId;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.birthDate = birthDate;
        this.ageGroup = ageGroup;
        this.gender = gender;
        this.neutered = neutered;
        this.intro = intro;
        this.photoUrl = photoUrl;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }
}
