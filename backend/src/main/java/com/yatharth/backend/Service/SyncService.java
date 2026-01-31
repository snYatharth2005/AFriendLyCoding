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


    public ResponseEntity<?> syncQuestions(SyncRequest request, String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuestionDto> questionDtos = request.getProblems();
        if (questionDtos == null || questionDtos.isEmpty()) {
            return ResponseEntity.badRequest().body("No problems received");
        }


        if (user.getLastSyncedAt() == null) {
            firstTimeSync(questionDtos, user);
            return ResponseEntity.ok("FIRST_SYNC_SUCCESS");
        }

        // Incremental sync
        List<SolvedQuestion> newlySolved = new ArrayList<>();

        for (QuestionDto dto : questionDtos) {

            if (!"SOLVED".equalsIgnoreCase(dto.getStatus())) {
                continue;
            }


            Optional<Question> questionOpt = questionRepo.findBySlug(dto.getSlug());
            if (questionOpt.isEmpty()) {
                continue;
            }

            Question question = questionOpt.get();

            boolean alreadySolved =
                    solvedQuestionRepo.existsByUserIdAndQuestionSlug(
                            user.getId(),
                            question.getSlug()
                    );

            if (!alreadySolved) {
                SolvedQuestion solved = SolvedQuestion.builder()
                        .user(user)
                        .question(question)
                        .build();

                newlySolved.add(solved);
            }
        }

        if (!newlySolved.isEmpty()) {
            solvedQuestionRepo.saveAllAndFlush(newlySolved);
        }

        user.setLastSyncedAt(LocalDateTime.now());
        userRepo.saveAndFlush(user);
        return ResponseEntity.ok("INCREMENTAL_SYNC_SUCCESS");
    }

    @Transactional
    protected void firstTimeSync(List<QuestionDto> questionDtos, User user) {

        // 1️⃣ Fetch existing slugs ONCE
        List<String> existingSlugs = questionRepo.findAllSlugs();
        Set<String> slugSet = new HashSet<>(existingSlugs);

        List<Question> questionsToSave = new ArrayList<>();
        List<SolvedQuestion> solvedToSave = new ArrayList<>();

        for (QuestionDto dto : questionDtos) {

            Question question;

            if (slugSet.contains(dto.getSlug())) {
                question = questionRepo.getReferenceBySlug(dto.getSlug());
            } else {
                question = Question.builder()
                        .frontendId(dto.getFrontendId())
                        .title(dto.getTitle())
                        .slug(dto.getSlug())
                        .difficulty(dto.getDifficulty())
                        .build();

                questionsToSave.add(question);
                slugSet.add(dto.getSlug());
            }

            if ("SOLVED".equalsIgnoreCase(dto.getStatus())) {
                solvedToSave.add(
                        SolvedQuestion.builder()
                                .user(user)
                                .question(question)
                                .build()
                );
            }
        }

        questionRepo.saveAll(questionsToSave);
        solvedQuestionRepo.saveAll(solvedToSave);

        user.setLastSyncedAt(LocalDateTime.now());
        userRepo.save(user);
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
