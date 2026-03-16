package com.yatharth.backend.DTOs;

import com.yatharth.backend.Model.FriendRequest;
import lombok.Data;

@Data
public class FriendRequestMapper {
    public static FriendRequestDto toDto(FriendRequest request){
        return FriendRequestDto.builder()
                .id(request.getId())
                .sender(request.getSender().getUsername())
                .receiver(request.getReceiver().getUsername())
                .senderUser(UserMapper.toDto(request.getSender()))
                .receiverUser(UserMapper.toDto(request.getReceiver()))
                .build();
    }
}
