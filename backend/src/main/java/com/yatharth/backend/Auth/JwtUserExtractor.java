package com.yatharth.backend.Auth;

import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
public class JwtUserExtractor {

    private JwtService jwtService;
    private UserRepository userRepository;

    public JwtUserExtractor(JwtService jwtService, UserRepository userRepository){
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    public User extractUserFromToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
            String username = jwtService.extractUsername(token);
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("Invalid or missing token");
    }
}
