package com.yatharth.backend.DTOs;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public class UserDto {
    private String username;
    private String email;
    private String leetCodeUsername;
    private LocalDateTime lastSyncedAt;
}
