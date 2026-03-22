package io.pet.petyard.terms.adapter.in.web;

import io.pet.petyard.terms.application.port.out.LoadTermsPort;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/terms")
@Tag(name = "Terms", description = "회원가입 및 서비스 이용에 필요한 약관 조회 API")
public class TermsController {

    private final LoadTermsPort loadTermsPort;

    public TermsController(LoadTermsPort loadTermsPort) {
        this.loadTermsPort = loadTermsPort;
    }

    @GetMapping
    @Operation(summary = "약관 목록 조회", description = "회원가입에 필요한 약관 목록과 버전, 필수 여부를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = TermsResponse.class)))
    })
    public TermsResponse list() {
        List<TermsResponse.TermsItem> terms = loadTermsPort.findAll().stream()
            .map(t -> new TermsResponse.TermsItem(t.getCode(), t.getVersion(), t.getTitle(), t.isMandatory(), t.getContentUrl()))
            .toList();
        return new TermsResponse(terms);
    }
}
