package io.pet.petyard.pet.domain.model;

import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;

import java.math.BigDecimal;
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

    @Column(columnDefinition = "text")
    private String photoUrl;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "vaccination_complete")
    private Boolean vaccinationComplete;

    @Column(name = "walk_safety_checked")
    private Boolean walkSafetyChecked;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected PetProfile() {
    }

    public PetProfile(Long userId, String name, PetSpecies species, String breed, LocalDate birthDate, String ageGroup,
                      PetGender gender, Boolean neutered, String intro, String photoUrl, BigDecimal weightKg,
                      Boolean vaccinationComplete, Boolean walkSafetyChecked) {
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
        this.weightKg = weightKg;
        this.vaccinationComplete = vaccinationComplete;
        this.walkSafetyChecked = walkSafetyChecked;
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

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public PetSpecies getSpecies() {
        return species;
    }

    public String getBreed() {
        return breed;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public String getAgeGroup() {
        return ageGroup;
    }

    public PetGender getGender() {
        return gender;
    }

    public Boolean getNeutered() {
        return neutered;
    }

    public String getIntro() {
        return intro;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public Boolean getVaccinationComplete() {
        return vaccinationComplete;
    }

    public Boolean getWalkSafetyChecked() {
        return walkSafetyChecked;
    }

    public void updateFrom(
        String name,
        PetSpecies species,
        String breed,
        LocalDate birthDate,
        String ageGroup,
        PetGender gender,
        Boolean neutered,
        String intro,
        String photoUrl,
        BigDecimal weightKg,
        Boolean vaccinationComplete,
        Boolean walkSafetyChecked
    ) {
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.birthDate = birthDate;
        this.ageGroup = ageGroup;
        this.gender = gender;
        this.neutered = neutered;
        this.intro = intro;
        this.photoUrl = photoUrl;
        this.weightKg = weightKg;
        this.vaccinationComplete = vaccinationComplete;
        this.walkSafetyChecked = walkSafetyChecked;
    }
}
