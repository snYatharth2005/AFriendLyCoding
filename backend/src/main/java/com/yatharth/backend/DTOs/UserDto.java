package com.yatharth.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@Builder
public class UserDto {
    private String username;
    private String email;
    private String leetCodeUsername;
    private String avatar;
    private LocalDateTime lastSyncedAt;
    private Integer streak;
    private Integer solvedInAWeek;
    private Integer totalProblems;
    private Integer easyProblems;
    private Integer mediumProblems;
    private Integer hardProblems;
}
