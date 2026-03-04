package io.pet.petyard.web;

import io.pet.petyard.auth.domain.Permission;
import io.pet.petyard.auth.guard.RequirePermission;
import io.pet.petyard.common.ApiMessage;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/walk")
public class WalkController {

    @RequirePermission(Permission.WALK_READ)
    @GetMapping("/posts")
    public Map<String, Object> listWalkPosts() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.OK.message());
        return body;
    }

    @RequirePermission(Permission.WALK_CREATE)
    @PostMapping("/posts")
    public Map<String, Object> createWalkPost() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.CREATED.message());
        return body;
    }

    @RequirePermission(Permission.WALK_APPLY)
    @PostMapping("/apply")
    public Map<String, Object> applyWalk() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("result", ApiMessage.APPLIED.message());
        return body;
    }

    @RequirePermission(Permission.WALK_CHAT)
    @PostMapping("/chat/{roomId}")
    public Map<String, Object> chat(@PathVariable String roomId) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("roomId", roomId);
        body.put("result", ApiMessage.OK.message());
        return body;
    }
}
