package com.yatharth.backend.Controller;

import com.yatharth.backend.Service.QuestionService;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/questions/")
public class QuestionController {
    private final QuestionService service;

    public QuestionController(QuestionService service){
        this.service = service;
    }

    @GetMapping("get/{username}")
    public ResponseEntity<?> getQuestions(@PathVariable String username){
        return service.getQuestions(username);
    }
}
