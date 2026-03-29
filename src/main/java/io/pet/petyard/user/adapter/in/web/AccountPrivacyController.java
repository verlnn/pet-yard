package io.pet.petyard.user.adapter.in.web;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.ErrorResponse;
import io.pet.petyard.user.application.port.in.UpdateAccountPrivacyUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
@Tag(name = "Account Privacy", description = "계정 공개/비공개 설정 API")
@SecurityRequirement(name = "bearerAuth")
public class AccountPrivacyController {

    private final UpdateAccountPrivacyUseCase updateAccountPrivacyUseCase;

    public AccountPrivacyController(UpdateAccountPrivacyUseCase updateAccountPrivacyUseCase) {
        this.updateAccountPrivacyUseCase = updateAccountPrivacyUseCase;
    }

    @PatchMapping("/privacy")
    @Operation(summary = "계정 공개/비공개 설정 변경", description = "계정을 공개(isPrivate=false) 또는 비공개(isPrivate=true)로 전환합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "설정 변경 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> updatePrivacy(
        @AuthenticationPrincipal AuthPrincipal principal,
        @Valid @RequestBody AccountPrivacyRequest request
    ) {
        updateAccountPrivacyUseCase.updatePrivacy(principal.userId(), request.isPrivate());
        return ResponseEntity.noContent().build();
    }
}
