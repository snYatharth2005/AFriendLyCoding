package com.yatharth.backend.Repository;

import com.yatharth.backend.DTOs.FriendRequestStatus;
import com.yatharth.backend.Model.FriendRequest;
import com.yatharth.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FriendRepository extends JpaRepository<FriendRequest, Long> {

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);

    List<FriendRequest> findByReceiverAndStatus(
            User receiver,
            FriendRequestStatus status
    );

    @Query("""
         SELECT request from FriendRequest request
         WHERE (request.sender = :user OR request.receiver = :user ) AND request.status = :status
         """)
    List<FriendRequest> findByUserAndStatus(User user, FriendRequestStatus status);

    @Query("""
    select fr
    from FriendRequest fr
    where 
        (fr.sender = :user1 and fr.receiver = :user2)
        or
        (fr.sender = :user2 and fr.receiver = :user1)
""")
    Optional<FriendRequest> findFriendRelation(User user1, User user2);

    @Query("""
    select 
        case 
            when fr.sender.id = :userId then fr.receiver.id
            else fr.sender.id
        end
    from FriendRequest fr
    where 
        (fr.sender.id = :userId or fr.receiver.id = :userId)
        and fr.status = com.yatharth.backend.DTOs.FriendRequestStatus.ACCEPTED
""")
    Set<Long> findAcceptedFriendIds(Long userId);
}
