package com.yatharth.backend.DTOs;

import lombok.Getter;
import lombok.Setter;

import java.util.List;


@Setter
@Getter
public class SyncRequest {
    private List<QuestionDto> problems;
}
