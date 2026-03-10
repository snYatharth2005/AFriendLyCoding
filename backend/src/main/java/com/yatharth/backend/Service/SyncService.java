package com.yatharth.backend.Service;

import com.yatharth.backend.DTOs.QuestionDto;
import com.yatharth.backend.DTOs.SyncRequest;
import com.yatharth.backend.DTOs.UserProfileDto;
import com.yatharth.backend.Model.Question;
import com.yatharth.backend.Model.SolvedQuestion;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.QuestionRepository;
import com.yatharth.backend.Repository.SolvedQuestionRepository;
import com.yatharth.backend.Repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyncService {

    private final QuestionRepository questionRepo;
    private final SolvedQuestionRepository solvedQuestionRepo;
    private final UserRepository userRepo;


    public SyncService(
            QuestionRepository questionRepo,
            SolvedQuestionRepository solvedQuestionRepo,
            UserRepository userRepo
    ) {
        this.questionRepo = questionRepo;
        this.solvedQuestionRepo = solvedQuestionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ResponseEntity<?> syncQuestions(SyncRequest request, String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuestionDto> dtos = request.getProblems();

        if (dtos == null || dtos.isEmpty()) {
            return ResponseEntity.badRequest().body("No problems received");
        }

        Set<String> incomingSlugs = dtos.stream()
                .map(QuestionDto::getSlug)
                .collect(Collectors.toSet());

        List<Question> existingQuestions =
                questionRepo.findBySlugIn(incomingSlugs);

        Map<String, Question> slugToQuestion =
                existingQuestions.stream()
                        .collect(Collectors.toMap(
                                Question::getSlug,
                                q -> q
                        ));

        List<Question> newQuestions = new ArrayList<>();

        for (QuestionDto dto : dtos) {

            if (!slugToQuestion.containsKey(dto.getSlug())) {

                Question question = Question.builder()
                        .frontendId(dto.getFrontendId())
                        .title(dto.getTitle())
                        .slug(dto.getSlug())
                        .difficulty(dto.getDifficulty())
                        .build();

                newQuestions.add(question);
                slugToQuestion.put(dto.getSlug(), question);
            }
        }

        if (!newQuestions.isEmpty()) {
            questionRepo.saveAll(newQuestions);
        }

        Set<String> alreadySolvedSlugs =
                solvedQuestionRepo.findSolvedSlugsByUserId(user.getId());

        List<SolvedQuestion> newSolved = new ArrayList<>();

        for (QuestionDto dto : dtos) {

            if (!"SOLVED".equalsIgnoreCase(dto.getStatus())) {
                continue;
            }

            if (!alreadySolvedSlugs.contains(dto.getSlug())) {

                Question question = slugToQuestion.get(dto.getSlug());

                newSolved.add(
                        SolvedQuestion.builder()
                                .user(user)
                                .question(question)
                                .build()
                );
            }
        }

        if (!newSolved.isEmpty()) {
            solvedQuestionRepo.saveAll(newSolved);
        }

        user.setLastSyncedAt(LocalDateTime.now());
        userRepo.save(user);

        return ResponseEntity.ok("SYNC_SUCCESS");
    }


    public ResponseEntity<?> lastSyncedAt(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user.getLastSyncedAt());
    }

    public ResponseEntity<?> syncProfile(UserProfileDto profileDto, String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(profileDto.getRealName());
        user.setLeetcodeUsername(profileDto.getLeetCodeUsername());
        user.setAvatar(profileDto.getAvatar());
        userRepo.saveAndFlush(user);
        return ResponseEntity.ok("success");
    }
}
