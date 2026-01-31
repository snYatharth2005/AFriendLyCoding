package com.yatharth.backend.DTOs;

import com.yatharth.backend.Model.SolvedQuestion;

public class SolvedQuestionMapper {
    public static SolvedQuestionDto toDto(SolvedQuestion solvedQuestion){
        return SolvedQuestionDto.builder()
                .question(QuestionMapper.toDto(solvedQuestion.getQuestion()))
                .user(UserMapper.toDto(solvedQuestion.getUser()))
                .build();
    }
}
