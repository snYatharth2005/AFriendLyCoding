package com.yatharth.backend.Controller;

import com.yatharth.backend.DTOs.FriendRequestDto;
import com.yatharth.backend.DTOs.FriendRequestStatus;
import com.yatharth.backend.DTOs.UserDto;
import com.yatharth.backend.Model.FriendRequest;
import com.yatharth.backend.Service.FriendService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/friends")
public class FriendController {
    private final FriendService service;

    public FriendController(FriendService service){
        this.service = service;
    }

    @GetMapping("/accepted")
    public List<FriendRequestDto> acceptedFriends(Principal principal){
        return service.acceptedFriends(principal.getName());
    }

    @PostMapping("/request/create")
    public String friendRequest(@RequestParam String senderUsername, @RequestParam String receiverUsername){
        return service.friendRequest(senderUsername, receiverUsername);
    }

    @PostMapping("/request/{id}/accept")
    public ResponseEntity<String> requestAccepted(Principal principal, @PathVariable Long id){
        return service.requestAccepted(principal.getName(), id);
    }

    @PostMapping("request/{id}/reject")
    public ResponseEntity<String> requestRejected(Principal principal,@PathVariable Long id){
        return service.requestRejected(principal.getName(), id);
    }

    @GetMapping("request/check")
    public ResponseEntity<?> requestCheck(@RequestParam String senderUsername, @RequestParam String receiverUsername, Principal principal){
        return service.requestCheck(senderUsername, receiverUsername);
    }

    @GetMapping("requests/incoming")
    public List<FriendRequestDto> requestIncoming(Principal principal){
        return service.requestIncoming(principal.getName());
    }

    @GetMapping("get/user/{username}")
    public UserDto getUserDto(@PathVariable String username){
        return service.getUserDto(username);
    }


    @GetMapping("/requests/sent")
    public List<FriendRequestDto> sentRequests(Principal principal) {
        return service.sentRequests(principal.getName());
    }

    @DeleteMapping("/request/{id}/withdraw")
    public ResponseEntity<String> withdrawRequest(@PathVariable Long id, Principal principal) {
        return service.withdrawRequest(id, principal.getName());
    }
}
