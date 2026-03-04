package io.pet.petyard.common;

public enum ApiMessage {
    OK("ok"),
    CREATED("created"),
    APPLIED("applied");

    private final String message;

    ApiMessage(String message) {
        this.message = message;
    }

    public String message() {
        return message;
    }
}
