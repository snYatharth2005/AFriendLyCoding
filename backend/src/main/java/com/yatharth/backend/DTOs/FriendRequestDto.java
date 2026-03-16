package com.yatharth.backend.DTOs;
import com.yatharth.backend.Model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FriendRequestDto {
    private Long id;
    private String sender;
    private String receiver;
    private UserDto senderUser;
    private UserDto receiverUser;
}
