import { faker } from '@faker-js/faker';
import type { Series, ArtStyle, Episode, Character } from '@/types';
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
    base: randomItem(ART_STYLES),
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
