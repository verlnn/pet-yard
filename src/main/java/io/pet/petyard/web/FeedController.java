package io.pet.petyard.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feeds")
public class FeedController {

    @RequirePermission(Permission.FEED_READ)
    @GetMapping
    public Map<String, Object> listFeeds() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "ok");
        return body;
    }

    @RequirePermission(Permission.FEED_CREATE)
    @PostMapping
    public Map<String, Object> createFeed() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", "created");
        return body;
    }
}
