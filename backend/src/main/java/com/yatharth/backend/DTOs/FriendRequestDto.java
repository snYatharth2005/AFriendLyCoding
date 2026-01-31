package com.yatharth.backend.DTOs;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendRequestDto {
    private Long id;
    private String sender;
    private String receiver;
    private Long senderId;
    private String senderAvatar;
    private String SenderLeetCodeUsername;
    private Long receiverId;
    private String receiverAvatar;
    private String receiverLeetCodeUsername;
}
