package io.pet.petyard.user.domain.model;

import java.time.Instant;

import io.pet.petyard.user.domain.UserProfileGender;

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
@Table(name = "user_profile_settings")
public class UserProfileSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 150)
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private UserProfileGender gender;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected UserProfileSettings() {
    }

    public UserProfileSettings(Long userId, String bio) {
        this.userId = userId;
        this.bio = bio;
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

    public String getBio() {
        return bio;
    }

    public void updateBio(String bio) {
        this.bio = bio;
    }

    public UserProfileGender getGender() {
        return gender;
    }

    public void updateGender(UserProfileGender gender) {
        this.gender = gender;
    }
}
