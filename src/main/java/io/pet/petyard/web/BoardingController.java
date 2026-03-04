package io.pet.petyard.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.common.ApiMessage;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/boarding")
public class BoardingController {

    @RequirePermission(Permission.BOARDING_APPLY)
    @PostMapping("/apply")
    public Map<String, Object> applyBoarding() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.APPLIED.message());
        return body;
    }
}
