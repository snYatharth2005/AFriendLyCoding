package com.yatharth.backend.DTOs;

import lombok.Builder;

@Builder
public class SolvedQuestionDto {
    private UserDto user;
    private QuestionDto question;
//    private List<String> topics;
}
