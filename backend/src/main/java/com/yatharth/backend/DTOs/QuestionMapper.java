package com.yatharth.backend.DTOs;

import com.yatharth.backend.Model.Question;

public class QuestionMapper {
    public static QuestionDto toDto(Question q){
        return QuestionDto.builder()
                .frontendId(q.getFrontendId())
                .title(q.getTitle())
                .slug(q.getSlug())
                .difficulty(q.getDifficulty())
                .status(q.getStatus())
                .build();
    }
}
