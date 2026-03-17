package io.pet.petyard.pet.application.service;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "animal.registration")
public record AnimalRegistrationProperties(
    String serviceKey,
    String baseUrl
) {
    public String baseUrlOrDefault() {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "https://apis.data.go.kr/1543061/animalInfoSrvc_v3/animalInfo_v3";
        }
        return baseUrl;
    }
}
