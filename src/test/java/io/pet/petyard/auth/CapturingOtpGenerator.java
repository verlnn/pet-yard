package io.pet.petyard.auth;

import io.pet.petyard.auth.service.OtpGenerator;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class CapturingOtpGenerator implements OtpGenerator {

    private final Map<String, String> latest = new ConcurrentHashMap<>();

    @Override
    public String generate(String email) {
        String code = "123456";
        latest.put(email, code);
        return code;
    }

    public String lastCodeFor(String email) {
        return latest.get(email);
    }
}
