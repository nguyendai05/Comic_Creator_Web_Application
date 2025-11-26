package com.comicstudio.model.dto.response;

import com.comicstudio.model.entity.*;
import com.comicstudio.model.entity.Character;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class EpisodeFullResponse {
    private EpisodeResponse episode;
    private List<PageResponse> pages;
    private List<CharacterResponse> characters;
    private List<Object> comments;

    @Data
    @Builder
    public static class PageResponse {
        private String pageId;
        private String episodeId;
        private Integer pageNumber;
        private String layoutType;
        private Object layoutData;
        private List<PanelResponse> panels;
        private String createdAt;
        private String updatedAt;

        public static PageResponse fromEntity(Page page) {
            return PageResponse.builder()
                    .pageId(page.getPageId())
                    .episodeId(page.getEpisode().getEpisodeId())
                    .pageNumber(page.getPageNumber())
                    .layoutType(page.getLayoutType().name().toLowerCase())
                    .layoutData(page.getLayoutData())
                    .panels(page.getPanels().stream()
                            .map(PanelResponse::fromEntity)
                            .collect(Collectors.toList()))
                    .createdAt(page.getCreatedAt().toString())
                    .updatedAt(page.getUpdatedAt().toString())
                    .build();
        }
    }

    @Data
    @Builder
    public static class PanelResponse {
        private String panelId;
        private String pageId;
        private Integer panelNumber;
        private String panelType;
        private Object position;
        private String imageUrl;
        private String thumbnailUrl;
        private String generationPrompt;
        private Object generationConfig;
        private String scriptText;
        private List<TextElementResponse> textElements;
        private String createdAt;
        private String updatedAt;

        public static PanelResponse fromEntity(Panel panel) {
            return PanelResponse.builder()
                    .panelId(panel.getPanelId())
                    .pageId(panel.getPage().getPageId())
                    .panelNumber(panel.getPanelNumber())
                    .panelType(panel.getPanelType() != null ? 
                        panel.getPanelType().name().toLowerCase() : "standard")
                    .position(panel.getPosition())
                    .imageUrl(panel.getImageUrl())
                    .thumbnailUrl(panel.getThumbnailUrl())
                    .generationPrompt(panel.getGenerationPrompt())
                    .generationConfig(panel.getGenerationConfig())
                    .scriptText(panel.getScriptText())
                    .textElements(panel.getTextElements().stream()
                            .map(TextElementResponse::fromEntity)
                            .collect(Collectors.toList()))
                    .createdAt(panel.getCreatedAt().toString())
                    .updatedAt(panel.getUpdatedAt().toString())
                    .build();
        }
    }

    @Data
    @Builder
    public static class TextElementResponse {
        private String textId;
        private String panelId;
        private String textType;
        private String content;
        private Object position;
        private Object style;
        private String characterId;
        private String createdAt;

        public static TextElementResponse fromEntity(TextElement text) {
            return TextElementResponse.builder()
                    .textId(text.getTextId())
                    .panelId(text.getPanel().getPanelId())
                    .textType(text.getTextType().name().toLowerCase())
                    .content(text.getContent())
                    .position(text.getPosition())
                    .style(text.getStyle())
                    .characterId(text.getCharacterId())
                    .createdAt(text.getCreatedAt().toString())
                    .build();
        }
    }

    @Data
    @Builder
    public static class CharacterResponse {
        private String characterId;
        private String seriesId;
        private String name;
        private String description;
        private String appearanceDescription;
        private List<String> personalityTraits;
        private List<String> referenceImages;
        private String consistencyToken;
        private Object styleGuide;
        private String createdAt;
        private String updatedAt;

        public static CharacterResponse fromEntity(Character character) {
            return CharacterResponse.builder()
                    .characterId(character.getCharacterId())
                    .seriesId(character.getSeries().getSeriesId())
                    .name(character.getName())
                    .description(character.getDescription())
                    .appearanceDescription(character.getAppearanceDescription())
                    .personalityTraits(character.getPersonalityTraits())
                    .referenceImages(character.getReferenceImages())
                    .consistencyToken(character.getConsistencyToken())
                    .styleGuide(character.getStyleGuide())
                    .createdAt(character.getCreatedAt().toString())
                    .updatedAt(character.getUpdatedAt().toString())
                    .build();
        }
    }
}
