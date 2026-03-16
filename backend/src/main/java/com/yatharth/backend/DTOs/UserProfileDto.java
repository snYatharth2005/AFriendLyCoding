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
public class UserProfileDto {
    private String leetCodeUsername;
    private String realName;
    private String avatar;
    private Integer streak;
    private Integer problemsSolvedInAWeek;
    private LocalDateTime lastSyncedAt;
    private boolean isSignedIn;
}
