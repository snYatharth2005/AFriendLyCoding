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
                .senderAvatar(request.getSender().getAvatar())
                .SenderLeetCodeUsername(request.getSender().getLeetcodeUsername())
                .senderId(request.getSender().getId())
                .receiverId(request.getReceiver().getId())
                .receiverAvatar(request.getReceiver().getAvatar())
                .receiverLeetCodeUsername(request.getReceiver().getLeetcodeUsername())
                .build();
    }
}
