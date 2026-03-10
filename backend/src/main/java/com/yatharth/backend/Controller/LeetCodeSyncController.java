package com.yatharth.backend.Controller;

import com.yatharth.backend.DTOs.SyncRequest;
import com.yatharth.backend.DTOs.UserProfileDto;
import com.yatharth.backend.Service.SyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/leetcode")
public class LeetCodeSyncController {

    private final SyncService service;

    public LeetCodeSyncController(SyncService service){
        this.service = service;
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncQuestions(@RequestBody SyncRequest request, Principal principal){
        System.out.println(principal.getName());
        return service.syncQuestions(request, principal.getName());
    }

    @GetMapping("/lastSyncedAt")
    public ResponseEntity<?> lastSyncedAt(Principal principal){
        return service.lastSyncedAt(principal.getName());
    }

    @PostMapping("/sync/profile")
    public ResponseEntity<?> syncProfile(@RequestBody UserProfileDto profileDto, Principal principal){
        return service.syncProfile(profileDto, principal.getName());
    }
}
