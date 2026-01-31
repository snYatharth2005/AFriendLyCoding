package com.yatharth.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDto {
    private Long id;
    private String leetCodeUsername;
    private String realName;
    private String avatar;
    private boolean isSignedIn;
}
