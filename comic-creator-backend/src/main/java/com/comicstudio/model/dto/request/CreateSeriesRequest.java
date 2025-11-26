package com.comicstudio.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateSeriesRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    private String title;
    
    private String description;
    private String genre;
    private Map<String, Object> artStyle;
    private List<String> tags;
}
