package com.yatharth.backend.DTOs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class QuestionDto {
    private String frontendId;
    private String title;
    private String slug;
    private String difficulty;
    private String status;
//    private List<String> topics;
}
