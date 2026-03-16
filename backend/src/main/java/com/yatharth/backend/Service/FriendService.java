package com.yatharth.backend.Service;

import com.yatharth.backend.DTOs.*;
import com.yatharth.backend.Model.FriendRequest;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.FriendRepository;
import com.yatharth.backend.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class FriendService {

    private final UserRepository userRepo;
    private final FriendRepository friendRepo;

    public FriendService(UserRepository userRepo,
                         FriendRepository friendRepo) {
        this.userRepo = userRepo;
        this.friendRepo = friendRepo;
    }

    public String friendRequest(String senderUsername, String receiverUsername) {

        User sender = getUser(senderUsername);
        User receiver = getUser(receiverUsername);

        if (friendRepo.findBySenderAndReceiver(sender, receiver).isPresent()) {
            throw new RuntimeException("Request already exists");
        }

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        friendRepo.save(request);
        return "Requested";
    }

    public ResponseEntity<String> requestAccepted(String receiverUsername, Long requestId) {
        FriendRequest request = friendRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        request.setStatus(FriendRequestStatus.ACCEPTED);
        friendRepo.save(request);
        return ResponseEntity.ok("Request Accepted");
    }

    public ResponseEntity<String> requestRejected(String receiverUsername, Long requestId) {
        FriendRequest request = friendRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        request.setStatus(FriendRequestStatus.REJECTED);
        friendRepo.save(request);
        return ResponseEntity.ok("Request Rejected");
    }

    public List<FriendRequestDto> sentRequests(String username) {
        User sender = getUser(username);
        return friendRepo.findBySenderAndStatus(sender, FriendRequestStatus.PENDING)
                .stream()
                .map(FriendRequestMapper::toDto)
                .toList();
    }

    public ResponseEntity<String> withdrawRequest(Long requestId, String senderUsername) {
        FriendRequest request = friendRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        // only the sender can withdraw
        if (!request.getSender().getUsername().equals(senderUsername)) {
            return ResponseEntity.status(403).body("Not authorized");
        }
        friendRepo.delete(request);
        return ResponseEntity.ok("Request withdrawn");
    }

    public ResponseEntity<FriendRequestStatus> requestCheck(
            String senderUsername,
            String receiverUsername) {
        User user1 = getUser(senderUsername);
        User user2 = getUser(receiverUsername);

        Optional<FriendRequest> request =
                friendRepo.findFriendRelation(user1, user2);

        if (request.isEmpty()) {
            return ResponseEntity.ok(FriendRequestStatus.None);
        }

        return ResponseEntity.ok(request.get().getStatus());
    }

    public List<FriendRequestDto> requestIncoming(String username) {
        User receiver = getUser(username);

        return friendRepo.findByReceiverAndStatus(
                receiver,
                FriendRequestStatus.PENDING
        )
                .stream()
                .map(FriendRequestMapper::toDto).toList();
    }

    public User getUser(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + username)
                );
    }

    private FriendRequest getRequest(
            String senderUsername,
            String receiverUsername) {

        User sender = getUser(senderUsername);
        User receiver = getUser(receiverUsername);

        return friendRepo.findBySenderAndReceiver(sender, receiver)
                .orElseThrow(() ->
                        new RuntimeException("Friend request not found")
                );
    }


    public List<FriendRequestDto> acceptedFriends(String username) {
        User user = getUser(username);

        return friendRepo.findByUserAndStatus(user, FriendRequestStatus.ACCEPTED)
                .stream()
                .map(FriendRequestMapper::toDto)
                .toList();
    }

    //gives the user info
    public UserDto getUserDto(String username) {
        return UserMapper.toDto(getUser(username));
    }
}
