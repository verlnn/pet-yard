package io.pet.petyard.auth.demo;

import io.pet.petyard.auth.context.AuthContext;
import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoAuthController {

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/api/feed")
    public Map<String, Object> readFeed() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "ok");
        return body;
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping("/api/feed")
    public Map<String, Object> createFeed() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "created");
        return body;
    }

    @RequirePermission(value = {Permission.WALK_APPLY, Permission.WALK_CHAT}, mode = RequirePermission.Mode.ALL)
    @PostMapping("/api/walk/apply")
    public Map<String, Object> applyWalk() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "applied");
        return body;
    }

    @RequirePermission(Permission.FEED_READ)
    @GetMapping("/api/me")
    public Map<String, Object> me(@RequestAttribute(name = AuthContext.REQUEST_ATTRIBUTE, required = false) AuthContext context) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (context == null) {
            body.put("userId", null);
            body.put("tier", null);
        } else {
            body.put("userId", context.userId());
            body.put("tier", context.tier().name());
        }
        return body;
    }
}
