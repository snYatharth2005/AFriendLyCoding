package com.yatharth.backend.Model;

import com.yatharth.backend.DTOs.FriendRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "friend_requests",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"sender_id", "receiver_id"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendRequestStatus status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        this.status = FriendRequestStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        if (this.status != FriendRequestStatus.PENDING) {
            this.respondedAt = LocalDateTime.now();
        }
    }
}
