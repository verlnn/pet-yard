package io.pet.petyard.user.domain.model;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_profiles", schema = "auth")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String nickname;

    private String regionCode;

    private String profileImageUrl;

    @Column(nullable = false)
    private boolean marketingOptIn;

    @Column(nullable = false)
    private boolean hasPet;

    @Column(nullable = false)
    private boolean isPrivate;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    protected UserProfile() {
    }

    public UserProfile(Long userId, String nickname, String regionCode, String profileImageUrl, boolean marketingOptIn, boolean hasPet) {
        this.userId = userId;
        this.nickname = nickname;
        this.regionCode = regionCode;
        this.profileImageUrl = profileImageUrl;
        this.marketingOptIn = marketingOptIn;
        this.hasPet = hasPet;
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

    public String getNickname() {
        return nickname;
    }

    public String getRegionCode() {
        return regionCode;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public boolean isMarketingOptIn() {
        return marketingOptIn;
    }

    public boolean hasPet() {
        return hasPet;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void updatePrivacy(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }
}
