package com.yatharth.backend.Service;

import com.yatharth.backend.DTOs.UserDto;
import com.yatharth.backend.DTOs.UserProfileDto;
import com.yatharth.backend.DTOs.UserProfileResponseDto;
import com.yatharth.backend.DTOs.UserSearchResponse;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserSearchService {

    private final UserRepository userRepo;

    public UserSearchService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public List<UserSearchResponse> searchUsers(String query) {
        query = query == null ? "" : query.trim().toLowerCase();

        if (query.length() < 2) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(0, 10);

        return userRepo.searchUsers(query, pageable)
                .stream()
                .map(u -> UserSearchResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .name(u.getName())
                        .leetCodeUsername(u.getLeetcodeUsername())
                        .avatar(u.getAvatar())
                        .lastSyncedAt(u.getLastSyncedAt())
                        .build())
                .toList();
    }

    public UserProfileResponseDto getProfile(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return UserProfileResponseDto.builder()
                .id(user.getId())
                .leetCodeUsername(user.getLeetcodeUsername())
                .avatar(user.getAvatar())
                .realName(user.getName())
                .build();
    }
}
