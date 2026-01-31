package com.yatharth.backend.Service;

import com.yatharth.backend.DTOs.QuestionDto;
import com.yatharth.backend.DTOs.QuestionMapper;
import com.yatharth.backend.DTOs.SolvedQuestionDto;
import com.yatharth.backend.DTOs.SolvedQuestionMapper;
import com.yatharth.backend.Model.SolvedQuestion;
import com.yatharth.backend.Model.User;
import com.yatharth.backend.Repository.QuestionRepository;
import com.yatharth.backend.Repository.SolvedQuestionRepository;
import com.yatharth.backend.Repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {
    private final SolvedQuestionRepository solvedQuestionRepo;
    private final UserRepository userRepo;

    public QuestionService( SolvedQuestionRepository solvedQuestionRepo, UserRepository userRepo){
        this.solvedQuestionRepo = solvedQuestionRepo;
        this.userRepo = userRepo;
    }


    public ResponseEntity<?> getQuestions(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<QuestionDto> dtos =
                solvedQuestionRepo.findSolvedQuestionByUserId(user.getId())
                        .stream()
                        .map(sq -> QuestionMapper.toDto(sq.getQuestion()))
                        .toList();
        return ResponseEntity.ok(dtos);
    }
}
