package com.yatharth.backend.Controller;

import com.yatharth.backend.DTOs.AuthResponse;
import com.yatharth.backend.DTOs.LoginRequest;
import com.yatharth.backend.DTOs.RegisterRequest;
import com.yatharth.backend.Service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService service;

    public AuthController(AuthService service){
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request){
        return service.register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        return ResponseEntity.ok( new AuthResponse(service.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @AuthenticationPrincipal UserDetails user
    ) {
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "authenticated", true
        ));
    }
}
