package io.pet.petyard.auth.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/feed")
    public Map<String, Object> readFeed() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "ok");
        return body;
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/feed")
    public Map<String, Object> createFeed() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "created");
        return body;
    }

    @RequirePermission(value = {Permission.WALK_APPLY, Permission.WALK_CHAT}, mode = RequirePermission.Mode.ALL)
    @PostMapping("/walk/apply")
    public Map<String, Object> applyWalk() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "applied");
        return body;
    }
}
