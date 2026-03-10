package com.yatharth.backend.Service;


import com.yatharth.backend.DTOs.QuestionDto;
import com.yatharth.backend.DTOs.QuestionMapper;
import com.yatharth.backend.DTOs.UserDto;
import com.yatharth.backend.DTOs.UserMapper;
import com.yatharth.backend.Model.Question;
import com.yatharth.backend.Model.SolvedQuestion;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.FriendRepository;
import com.yatharth.backend.Repository.SolvedQuestionRepository;
import com.yatharth.backend.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    private final SolvedQuestionRepository solvedQuestionRepo;
    private final UserRepository userRepo;
    private final FriendRepository friendRepo;

    public QuestionService(FriendRepository friendRepo, SolvedQuestionRepository solvedQuestionRepo, UserRepository userRepo){
        this.solvedQuestionRepo = solvedQuestionRepo;
        this.userRepo = userRepo;
        this.friendRepo = friendRepo;
    }


    public ResponseEntity<?> getQuestions(String username) {

        User loggedUser = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Long> friendIds =
                friendRepo.findAcceptedFriendIds(loggedUser.getId());

        friendIds.add(loggedUser.getId());



        List<Question> questions =
                solvedQuestionRepo.findSolvedQuestionByUserId(loggedUser.getId())
                        .stream()
                        .map(SolvedQuestion::getQuestion)
                        .toList();

        Set<String> ids = questions.stream()
                .map(Question::getFrontendId)
                .collect(Collectors.toSet());


        List<Object[]> rawResults =
                solvedQuestionRepo.findUsersByQuestionIds(ids);

        Map<String, List<UserDto>> userMap = new HashMap<>();

        for (Object[] row : rawResults) {

            String frontendId = (String) row[0];
            User userEntity = (User) row[1];

            if (!friendIds.contains(userEntity.getId())) {
                continue;
            }

            userMap
                    .computeIfAbsent(frontendId, k -> new ArrayList<>())
                    .add(UserMapper.toDto(userEntity));
        }


        List<QuestionDto> dtos = questions.stream()
                .map(q -> {
                    QuestionDto dto = QuestionMapper.toDto(q);
                    dto.setUsers(
                            userMap.getOrDefault(
                                    q.getFrontendId(),
                                    List.of()
                            )
                    );
                    return dto;
                })
                .toList();

        return ResponseEntity.ok(dtos);
    }
}
