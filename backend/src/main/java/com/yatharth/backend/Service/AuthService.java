package com.yatharth.backend.Service;

import com.yatharth.backend.Auth.JwtService;
import com.yatharth.backend.DTOs.AuthResponse;
import com.yatharth.backend.DTOs.LoginRequest;
import com.yatharth.backend.DTOs.RegisterRequest;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.UserRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository repo;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthService(UserRepository repo, AuthenticationManager authManager, JwtService jwtService){
        this.repo = repo;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);


    public ResponseEntity<String> register(RegisterRequest request) {
        if(repo.findByUsername(request.username()).isPresent()) return new ResponseEntity<>("username is already in use", HttpStatus.CREATED);
        else if(repo.findByEmail(request.email()).isPresent()) return new ResponseEntity<>("email is already in use", HttpStatus.CREATED);

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(encoder.encode(request.password()))
                .build();

        repo.save(user);
        return new ResponseEntity<>("Success", HttpStatus.CREATED);
    }


    public @Nullable String login(LoginRequest req) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
        if(authentication.isAuthenticated()){
            return jwtService.generateToken(req.username());
        }
        throw new RuntimeException("Authentication Failed");
    }
}
