import { faker } from '@faker-js/faker';
import type { Series, ArtStyle, Episode, Character, Panel, Page, TextElement, EpisodeFullResponse } from '@/types';
import { generateId, randomItem, randomItems } from '@/lib/utils/mockUtils';

// Constants
const ART_STYLES = ['manga', 'western', 'webtoon'] as const;
const GENRES = ['action', 'comedy', 'drama', 'fantasy', 'sci-fi', 'romance', 'horror', 'slice-of-life'];
const TAGS = ['adventure', 'mystery', 'supernatural', 'school', 'martial-arts', 'psychological', 'historical', 'sports'];

/**
 * Generate a mock art style
 */
export function generateMockArtStyle(): ArtStyle {
  return {
    base: randomItem([...ART_STYLES]),
    color_palette: [
      faker.color.rgb(),
      faker.color.rgb(),
      faker.color.rgb()
    ],
    line_weight: randomItem(['light', 'medium', 'heavy']),
    shading_style: randomItem(['cell', 'realistic', 'minimal'])
  };
}

/**
 * Generate a single mock series
 */
export function generateMockSeries(): Series {
  return {
    series_id: generateId(),
    user_id: 'demo-user-123',
    title: faker.book.title(),
    description: faker.lorem.paragraphs(2),
    genre: randomItem(GENRES),
    art_style: generateMockArtStyle(),
    status: randomItem(['draft', 'published', 'archived']),
    cover_image_url: `/mock-images/cover-${faker.number.int({ min: 1, max: 10 })}.jpg`,
    tags: randomItems(TAGS, faker.number.int({ min: 2, max: 4 })),
    is_public: faker.datatype.boolean(),
    created_at: faker.date.past({ years: 1 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString()
  };
}

/**
 * Generate multiple mock series
 */
export function generateMockSeriesList(count: number = 3): Series[] {
  return Array.from({ length: count }, () => generateMockSeries());
}

/**
 * Generate a mock episode
 */
export function generateMockEpisode(
  seriesId: string,
  episodeNumber: number
): Episode {
  return {
    episode_id: generateId(),
    series_id: seriesId,
    episode_number: episodeNumber,
    title: `Chapter ${episodeNumber}: ${faker.lorem.words(3)}`,
    description: faker.lorem.paragraph(),
    script: undefined,
    status: 'draft',
    thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
    page_count: faker.number.int({ min: 15, max: 30 }),
    published_at: undefined,
    created_at: faker.date.past({ years: 0.25 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString()
  };
}

/**
 * Generate multiple episodes for a series
 */
export function generateMockEpisodeList(
  seriesId: string,
  count: number = 5
): Episode[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockEpisode(seriesId, i + 1)
  );
}

/**
 * Generate a mock character
 */
export function generateMockCharacter(seriesId: string): Character {
  const firstName = faker.person.firstName();
  const age = faker.number.int({ min: 16, max: 40 });

  const buildTypes = ['athletic', 'slim', 'muscular', 'average', 'heavyset'];
  const hairStyles = ['short', 'long', 'spiky', 'wavy', 'straight', 'curly'];
  const hairColors = ['black', 'brown', 'blonde', 'red', 'blue', 'silver'];
  const eyeColors = ['blue', 'brown', 'green', 'hazel', 'amber', 'gray'];

  const personalityTraits = [
    'brave', 'timid', 'confident', 'shy', 'kind', 'stern',
    'cheerful', 'serious', 'intelligent', 'impulsive',
    'calculating', 'spontaneous', 'loyal', 'mysterious'
  ];

  return {
    character_id: generateId(),
    series_id: seriesId,
    name: firstName,
    description: faker.lorem.paragraph(),
    appearance_description: [
      `${age} years old`,
      `${randomItem(buildTypes)} build`,
      `${randomItem(hairStyles)} ${randomItem(hairColors)} hair`,
      `${randomItem(eyeColors)} eyes`
    ].join(', '),
    personality_traits: randomItems(personalityTraits, 3),
    reference_images: [
      `/mock-images/character-${faker.number.int({ min: 1, max: 10 })}.jpg`
    ],
    consistency_token: `char_${firstName.toLowerCase()}_${faker.string.alphanumeric(8)}`,
    style_guide: {
      hair_color: randomItem(hairColors),
      eye_color: randomItem(eyeColors),
      typical_expression: randomItem(['neutral', 'smiling', 'stern', 'worried'])
    },
    created_at: faker.date.past({ years: 0.25 }).toISOString(),
    updated_at: faker.date.recent({ days: 7 }).toISOString()
  };
}

/**
 * Generate multiple characters for a series
 */
export function generateMockCharacterList(
  seriesId: string,
  count: number = 3
): Character[] {
  return Array.from({ length: count }, () => generateMockCharacter(seriesId));
}

/**
 * Generate a mock text element
 */
export function generateMockTextElement(panelId: string): TextElement {
  const textTypes = ['dialogue', 'narration', 'sfx'] as const;

  return {
    text_id: generateId(),
    panel_id: panelId,
    text_type: randomItem([...textTypes]),
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
    created_at: new Date().toISOString()
  };
}

/**
 * Generate a mock panel
 */
export function generateMockPanel(pageId: string, panelNumber: number): Panel {
  const panelId = generateId();
  const textElementCount = faker.number.int({ min: 0, max: 3 });

  return {
    panel_id: panelId,
    page_id: pageId,
    panel_number: panelNumber,
    panel_type: randomItem(['standard', 'splash', 'inset']),
    position: {
      x: ((panelNumber - 1) % 2) * 50,
      y: Math.floor((panelNumber - 1) / 2) * 50,
      width: 50,
      height: 50,
      z_index: panelNumber
    },
    image_url: `/mock-images/panel-${faker.number.int({ min: 1, max: 20 })}.jpg`,
    thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
    generation_prompt: faker.lorem.sentence(),
    generation_config: {
      style: 'manga',
      quality: 'standard',
      camera_angle: randomItem(['close-up', 'medium', 'wide', 'extreme-wide'])
    },
    script_text: faker.lorem.paragraph(),
    text_elements: Array.from({ length: textElementCount }, () =>
      generateMockTextElement(panelId)
    ),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Generate a mock page
 */
export function generateMockPage(episodeId: string, pageNumber: number): Page {
  const pageId = generateId();
  const panelCount = faker.number.int({ min: 4, max: 6 });

  return {
    page_id: pageId,
    episode_id: episodeId,
    page_number: pageNumber,
    layout_type: randomItem(['traditional', 'webtoon', 'spread']),
    layout_data: {
      columns: 2,
      gutter: 10,
      margin: 20
    },
    panels: Array.from({ length: panelCount }, (_, i) =>
      generateMockPanel(pageId, i + 1)
    ),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Generate complete episode with all nested data
 * This is the main function for loading editor
 */
export function generateMockEpisodeFull(episodeId?: string): EpisodeFullResponse {
  const id = episodeId || generateId();
  const seriesId = generateId();
  const pageCount = faker.number.int({ min: 3, max: 8 });

  return {
    episode: {
      episode_id: id,
      series_id: seriesId,
      episode_number: 1,
      title: `Chapter 1: ${faker.lorem.words(3)}`,
      description: faker.lorem.paragraph(),
      status: 'draft',
      page_count: pageCount,
      created_at: faker.date.past({ years: 0.1 }).toISOString(),
      updated_at: faker.date.recent({ days: 1 }).toISOString()
    },
    pages: Array.from({ length: pageCount }, (_, i) =>
      generateMockPage(id, i + 1)
    ),
    characters: generateMockCharacterList(seriesId, faker.number.int({ min: 2, max: 5 })),
    comments: []
  };
}
