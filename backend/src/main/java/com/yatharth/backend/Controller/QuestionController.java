package com.yatharth.backend.Controller;

import com.yatharth.backend.DTOs.QuestionDto;
import com.yatharth.backend.DTOs.SolvedQuestionDto;
import com.yatharth.backend.Service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/questions/")
public class QuestionController {
    private final QuestionService service;

    public QuestionController(QuestionService service){
        this.service = service;
    }

    @GetMapping("get")
    public ResponseEntity<?> getQuestions(Principal principal){
        return service.getQuestions(principal.getName());
    }
}
