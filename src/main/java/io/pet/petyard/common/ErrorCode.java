package io.pet.petyard.common;

public enum ErrorCode {
    UNAUTHORIZED("UNAUTHORIZED", "인증이 필요합니다"),
    INVALID_TOKEN("UNAUTHORIZED", "유효하지 않거나 만료된 토큰입니다"),
    INVALID_CREDENTIALS("UNAUTHORIZED", "자격 증명이 올바르지 않습니다"),
    REFRESH_TOKEN_NOT_FOUND("UNAUTHORIZED", "리프레시 토큰을 찾을 수 없습니다"),
    REFRESH_TOKEN_INVALID("UNAUTHORIZED", "리프레시 토큰이 유효하지 않습니다"),

    FORBIDDEN("FORBIDDEN", "권한이 없습니다"),
    ACCOUNT_NOT_ACTIVE("FORBIDDEN", "계정이 활성화되지 않았습니다"),
    VERIFICATION_ATTEMPTS_EXCEEDED("FORBIDDEN", "인증 시도 횟수를 초과했습니다"),

    BAD_REQUEST("BAD_REQUEST", "잘못된 요청입니다"),
    INTERNAL_ERROR("INTERNAL_ERROR", "서버 오류가 발생했습니다"),
    CONFIG_SECRET_REQUIRED("INTERNAL_ERROR", "JWT 시크릿이 필요합니다"),
    CONFIG_SECRET_TOO_SHORT("INTERNAL_ERROR", "JWT 시크릿은 HS256을 위해 최소 32바이트여야 합니다"),
    CRYPTO_NOT_SUPPORTED("INTERNAL_ERROR", "SHA-256을 지원하지 않습니다"),
    EMAIL_ALREADY_REGISTERED("BAD_REQUEST", "이미 등록된 이메일입니다"),
    VERIFICATION_CODE_NOT_FOUND("BAD_REQUEST", "인증 코드를 찾을 수 없습니다"),
    VERIFICATION_CODE_EXPIRED("BAD_REQUEST", "인증 코드가 만료되었습니다"),
    VERIFICATION_CODE_NOT_EXPIRED("BAD_REQUEST", "인증 코드가 아직 만료되지 않았습니다"),
    INVALID_VERIFICATION_CODE("BAD_REQUEST", "인증 코드가 올바르지 않습니다"),
    VERIFICATION_EXTEND_RATE_LIMIT("BAD_REQUEST", "인증 코드 연장을 너무 자주 요청했습니다"),
    USER_NOT_FOUND("BAD_REQUEST", "사용자를 찾을 수 없습니다"),
    OAUTH_STATE_MISMATCH("BAD_REQUEST", "OAuth state가 일치하지 않습니다"),
    OAUTH_PROVIDER_FAILED("BAD_REQUEST", "OAuth 제공자 통신에 실패했습니다"),
    OAUTH_ACCOUNT_EXISTS("BAD_REQUEST", "이미 가입된 소셜 계정입니다"),
    SOCIAL_EMAIL_CONFLICT("BAD_REQUEST", "이미 다른 계정에 연결된 이메일입니다"),
    NICKNAME_ALREADY_TAKEN("BAD_REQUEST", "이미 사용 중인 닉네임입니다"),
    PET_REGISTRATION_VERIFY_FAILED("BAD_REQUEST", "반려견 등록 정보를 확인할 수 없습니다"),
    PET_REGISTRATION_NOT_APPROVED("BAD_REQUEST", "반려견 등록 정보가 승인 상태가 아닙니다"),
    REQUIRED_TERMS_MISSING("BAD_REQUEST", "필수 약관 동의가 필요합니다"),
    SIGNUP_SESSION_EXPIRED("BAD_REQUEST", "회원가입 세션이 만료되었습니다"),
    SIGNUP_STEP_INVALID("BAD_REQUEST", "회원가입 단계가 올바르지 않습니다"),
    VALIDATION_FAILED("BAD_REQUEST", "요청 값 검증에 실패했습니다"),
    INVALID_FILE_TYPE("BAD_REQUEST", "지원하지 않는 파일 형식입니다"),
    FILE_SIZE_EXCEEDED("BAD_REQUEST", "업로드 가능한 파일 크기를 초과했습니다"),
    FILE_UPLOAD_FAILED("INTERNAL_ERROR", "파일 업로드에 실패했습니다");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String code() {
        return code;
    }

    public String message() {
        return message;
    }
}
