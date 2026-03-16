package com.yatharth.backend.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;

    @EqualsAndHashCode.Include
    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String name;
    private String avatar;

    @Column(unique = true)
    private String leetcodeUsername;

    @Builder.Default
    private Integer streak = 0;
    @Builder.Default
    private Integer solvedProblemsInAWeek = 0;
    @Builder.Default
    private Integer totalSolvedProblem = 0;

    @Builder.Default
    private Integer easyProblems = 0;
    @Builder.Default
    private Integer mediumProblems = 0;
    @Builder.Default
    private Integer hardProblems = 0;

    @Builder.Default
    private LocalDateTime lastSyncedAt = null;

    @OneToMany(mappedBy = "user")
    List<SolvedQuestion> solvedQuestions;

    @OneToMany(mappedBy = "receiver")
    private Set<FriendRequest> receivedRequests = new HashSet<>();

    @OneToMany(mappedBy = "sender")
    private Set<FriendRequest> sentRequests = new HashSet<>();

}
