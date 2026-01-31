package com.yatharth.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchResponse {
    private Long id;
    private String username;
    private String name;
    private String leetCodeUsername;
    private LocalDateTime lastSyncedAt;
    private String avatar;
}
