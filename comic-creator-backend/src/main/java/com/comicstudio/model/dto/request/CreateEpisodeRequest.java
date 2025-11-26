package com.comicstudio.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateEpisodeRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 500)
    private String title;
    
    private String description;
}
