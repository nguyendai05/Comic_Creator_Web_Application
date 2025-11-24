---
description: Mock Data System -> Data Generators
---

```typescript
// lib/mockData/generators.ts
import { faker } from '@faker-js/faker';

export function generateMockSeries(): Series {
  const artStyles = ['manga', 'western', 'webtoon'];
  const genres = ['action', 'comedy', 'drama', 'fantasy', 'sci-fi', 'romance', 'horror'];
  
  return {
    series_id: crypto.randomUUID(),
    user_id: 'demo-user-123',
    title: faker.book.title(),
    description: faker.lorem.paragraphs(2),
    genre: faker.helpers.arrayElement(genres),
    art_style: {
      base: faker.helpers.arrayElement(artStyles),
      color_palette: [
        faker.color.rgb(),
        faker.color.rgb(),
        faker.color.rgb()
      ],
      line_weight: faker.helpers.arrayElement(['light', 'medium', 'heavy']),
      shading_style: faker.helpers.arrayElement(['cell', 'realistic', 'minimal'])
    },
    status: faker.helpers.arrayElement(['draft', 'published', 'archived']),
    cover_image_url: `/mock-images/cover-${faker.number.int({ min: 1, max: 10 })}.jpg`,
    tags: faker.helpers.arrayElements(
      ['adventure', 'mystery', 'supernatural', 'school', 'martial-arts'],
      faker.number.int({ min: 2, max: 4 })
    ),
    is_public: faker.datatype.boolean(),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString()
  };
}

export function generateMockEpisode(seriesId: string, episodeNumber: number): Episode {
  return {
    episode_id: crypto.randomUUID(),
    series_id: seriesId,
    episode_number: episodeNumber,
    title: `Chapter ${episodeNumber}: ${faker.lorem.words(3)}`,
    description: faker.lorem.paragraph(),
    script: null,
    status: 'draft',
    thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
    page_count: faker.number.int({ min: 15, max: 30 }),
    published_at: null,
    created_at: faker.date.past({ months: 3 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString()
  };
}

export function generateMockEpisodeFull(episodeId: string): EpisodeFullResponse {
  const pageCount = faker.number.int({ min: 3, max: 8 });
  const pages: Page[] = [];
  
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const panelCount = faker.number.int({ min: 4, max: 6 });
    const panels: Panel[] = [];
    
    for (let panelNum = 1; panelNum <= panelCount; panelNum++) {
      const textElementCount = faker.number.int({ min: 0, max: 3 });
      const textElements: TextElement[] = [];
      
      for (let i = 0; i < textElementCount; i++) {
        textElements.push({
          text_id: crypto.randomUUID(),
          panel_id: '', // Will be set
          text_type: faker.helpers.arrayElement(['dialogue', 'narration', 'sfx']),
          content: faker.lorem.sentence(),
          position: {
            x: faker.number.int({ min: 5, max: 45 }),
            y: faker.number.int({ min: 5, max: 45 }),
            width: 40,
            height: 15
          },
          style: {
            font_family: 'Comic Sans MS',
            font_size: 16,
            color: '#000000',
            bold: false,
            italic: false,
            bubble_style: 'round',
            bubble_color: '#FFFFFF',
            bubble_border_color: '#000000',
            bubble_border_width: 2
          },
          character_id: null,
          created_at: new Date().toISOString()
        });
      }
      
      const panel: Panel = {
        panel_id: crypto.randomUUID(),
        page_id: '', // Will be set
        panel_number: panelNum,
        panel_type: faker.helpers.arrayElement(['standard', 'splash', 'inset']),
        position: {
          x: ((panelNum - 1) % 2) * 50,
          y: Math.floor((panelNum - 1) / 2) * 50,
          width: 50,
          height: 50,
          z_index: panelNum
        },
        image_url: `/mock-images/panel-${faker.number.int({ min: 1, max: 20 })}.jpg`,
        thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
        generation_prompt: faker.lorem.sentence(),
        generation_config: {
          style: 'manga',
          quality: 'standard',
          camera_angle: 'medium'
        },
        script_text: faker.lorem.paragraph(),
        text_elements: textElements,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Set panel_id for text elements
      textElements.forEach(te => {
        te.panel_id = panel.panel_id;
      });
      
      panels.push(panel);
    }
    
    const page: Page = {
      page_id: crypto.randomUUID(),
      episode_id: episodeId,
      page_number: pageNum,
      layout_type: faker.helpers.arrayElement(['traditional', 'webtoon', 'spread']),
      layout_data: {
        columns: 2,
        gutter: 10,
        margin: 20
      },
      panels: panels,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Set page_id for panels
    panels.forEach(p => {
      p.page_id = page.page_id;
    });
    
    pages.push(page);
  }
  
  const characters = generateMockCharacters(faker.number.int({ min: 2, max: 5 }));
  
  return {
    episode: {
      episode_id: episodeId,
      series_id: crypto.randomUUID(),
      episode_number: 1,
      title: `Chapter 1: ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      status: 'draft',
      created_at: faker.date.past({ months: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 1 }).toISOString()
    },
    pages: pages,
    characters: characters,
    comments: []
  };
}

function generateMockCharacters(count: number): Character[] {
  return Array.from({ length: count }, () => {
    const firstName = faker.person.firstName();
    const age = faker.number.int({ min: 16, max: 40 });
    
    return {
      character_id: crypto.randomUUID(),
      series_id: '', // Will be set by caller
      name: firstName,
      description: faker.lorem.paragraph(),
      appearance_description: `${age} year old, ${faker.helpers.arrayElement([
        'athletic build',
        'slim build',
        'muscular build',
        'average build'
      ])}, ${faker.helpers.arrayElement([
        'short black hair',
        'long brown hair',
        'spiky blonde hair',
        'shoulder-length red hair'
      ])}, ${faker.helpers.arrayElement([
        'blue eyes',
        'brown eyes',
        'green eyes',
        'hazel eyes'
      ])}`,
      personality_traits: [
        faker.helpers.arrayElement(['brave', 'timid', 'confident', 'shy']),
        faker.helpers.arrayElement(['kind', 'stern', 'cheerful', 'serious']),
        faker.helpers.arrayElement(['intelligent', 'impulsive', 'calculating', 'spontaneous'])
      ],
      reference_images: [
        `/mock-images/character-${faker.number.int({ min: 1, max: 10 })}.jpg`
      ],
      consistency_token: `char_${firstName.toLowerCase()}_${faker.string.alphanumeric(8)}`,
      style_guide: {
        hair_color: faker.color.human(),
        eye_color: faker.color.human(),
        typical_expression: faker.helpers.arrayElement(['neutral', 'smiling', 'stern', 'worried'])
      },
      created_at: faker.date.past({ months: 3 }).toISOString(),
      updated_at: faker.date.recent({ days: 7 }).toISOString()
    };
  });
}
```