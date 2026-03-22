package io.pet.petyard.common.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme.Type;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("local")
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {

    @Bean
    public OpenAPI petYardOpenApi() {
        return new OpenAPI()
            .info(new Info()
                .title("멍냥마당 API")
                .description("""
                    멍냥마당 백엔드 API 문서입니다.

                    - 인증이 필요한 API는 우측 상단 Authorize 버튼에 `Bearer {accessToken}` 형식으로 입력합니다.
                    - 회원가입/온보딩 API는 `X-Signup-Token` 헤더를 사용합니다.
                    - 에러 응답은 공통적으로 `code`, `message`, `path`, `timestamp` 구조를 따릅니다.
                    """)
                .version("v1")
                .contact(new Contact().name("PetYard Backend"))
                .license(new License().name("Internal")))
            .components(new Components().addSecuritySchemes("bearerAuth",
                new io.swagger.v3.oas.models.security.SecurityScheme()
                    .type(Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
