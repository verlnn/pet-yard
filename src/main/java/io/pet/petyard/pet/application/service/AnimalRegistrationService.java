package io.pet.petyard.pet.application.service;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.pet.domain.PetGender;

import java.net.URI;
import java.time.LocalDate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class AnimalRegistrationService {

    private final AnimalRegistrationProperties properties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AnimalRegistrationService(AnimalRegistrationProperties properties) {
        this.properties = properties;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public AnimalRegistrationResult verify(String dogRegNo, String rfidCd, String ownerNm, String ownerBirth) {
        if (properties.serviceKey() == null || properties.serviceKey().isBlank()) {
            throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
        }

        URI uri = UriComponentsBuilder.fromUriString(properties.baseUrlOrDefault())
            .queryParam("serviceKey", properties.serviceKey())
            .queryParam("dog_reg_no", dogRegNo)
            .queryParam("rfid_cd", rfidCd)
            .queryParam("owner_nm", ownerNm)
            .queryParam("owner_birth", ownerBirth)
            .queryParam("_type", "json")
            .build()
            .toUri();

        String body = restTemplate.getForObject(uri, String.class);
        if (body == null || body.isBlank()) {
            throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
        }

        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode response = root.path("response");
            String resultCode = response.path("header").path("resultCode").asText();
            if (!"00".equals(resultCode)) {
                throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
            }

            JsonNode item = response.path("body").path("item");
            if (item.isMissingNode() || item.isNull()) {
                throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
            }
            if (item.isArray() && !item.isEmpty()) {
                item = item.get(0);
            }

            String apiDogRegNo = item.path("dogRegNo").asText();
            String apiRfidCd = item.path("rfidCd").asText();
            if (!dogRegNo.equals(apiDogRegNo) || !rfidCd.equals(apiRfidCd)) {
                throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
            }

            String approvalStatus = item.path("aprGbNm").asText();
            if (!approvalStatus.isBlank() && !"승인".equals(approvalStatus)) {
                throw new ApiException(ErrorCode.PET_REGISTRATION_NOT_APPROVED);
            }

            String birth = item.path("birthDt").asText();
            LocalDate birthDate = birth.isBlank() ? null : LocalDate.parse(birth);

            return new AnimalRegistrationResult(
                apiDogRegNo,
                apiRfidCd,
                item.path("dogNm").asText(),
                birthDate,
                parseGender(item.path("sexNm").asText()),
                item.path("kindNm").asText(),
                parseNeutered(item.path("neuterYn").asText()),
                item.path("orgNm").asText(),
                item.path("officeTel").asText(),
                approvalStatus,
                item.path("regTm").asText(),
                item.path("aprTm").asText()
            );
        } catch (ApiException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ApiException(ErrorCode.PET_REGISTRATION_VERIFY_FAILED);
        }
    }

    private PetGender parseGender(String raw) {
        if (raw == null || raw.isBlank()) {
            return PetGender.UNKNOWN;
        }
        if (raw.contains("수컷")) {
            return PetGender.MALE;
        }
        if (raw.contains("암컷")) {
            return PetGender.FEMALE;
        }
        return PetGender.UNKNOWN;
    }

    private Boolean parseNeutered(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        if (raw.contains("중성") || "Y".equalsIgnoreCase(raw)) {
            return true;
        }
        if (raw.contains("미중성") || "N".equalsIgnoreCase(raw)) {
            return false;
        }
        return null;
    }
}
