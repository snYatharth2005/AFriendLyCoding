package com.yatharth.backend.DTOs;

import com.yatharth.backend.Model.User;

public class UserMapper {
    public static UserDto toDto(User user){
        return UserDto.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .leetCodeUsername(user.getLeetcodeUsername())
                .lastSyncedAt(user.getLastSyncedAt())
                .avatar(user.getAvatar())
                .build();
    }
}
