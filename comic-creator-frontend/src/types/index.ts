// ============================================
// USER & AUTHENTICATION
// ============================================

export interface User {
  user_id: string;
  email: string;
  username: string;
  display_name?: string;
  credits_balance: number;
  subscription_tier: 'free' | 'pro' | 'enterprise';
  email_verified: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// ============================================
// SERIES
// ============================================

export interface ArtStyle {
  base: 'manga' | 'western' | 'webtoon';
  color_palette: string[];
  line_weight?: 'light' | 'medium' | 'heavy';
  shading_style?: 'cell' | 'realistic' | 'minimal';
}

export interface Series {
  series_id: string;
  user_id: string;
  title: string;
  description?: string;
  genre?: string;
  art_style?: ArtStyle;
  status: 'draft' | 'published' | 'archived';
  cover_image_url?: string;
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSeriesData {
  title: string;
  description?: string;
  genre?: string;
  art_style?: ArtStyle;
  tags?: string[];
}

// ============================================
// EPISODES
// ============================================

export interface Episode {
  episode_id: string;
  series_id: string;
  episode_number: number;
  title: string;
  description?: string;
  script?: string;
  status: 'draft' | 'published' | 'archived';
  thumbnail_url?: string;
  page_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEpisodeData {
  title: string;
  description?: string;
}

// ============================================
// PAGES & PANELS
// ============================================

export interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
  z_index?: number;
}

export interface Panel {
  panel_id: string;
  page_id: string;
  panel_number: number;
  panel_type?: 'standard' | 'splash' | 'inset';
  position: Position;
  image_url?: string;
  thumbnail_url?: string;
  generation_prompt?: string;
  generation_config?: any;
  script_text?: string;
  text_elements?: TextElement[];
  created_at: string;
  updated_at: string;
}

export interface Page {
  page_id: string;
  episode_id: string;
  page_number: number;
  layout_type: 'traditional' | 'webtoon' | 'spread';
  layout_data?: any;
  panels: Panel[];
  created_at: string;
  updated_at: string;
}

// ============================================
// TEXT ELEMENTS
// ============================================

export interface TextElement {
  text_id: string;
  panel_id: string;
  text_type: 'dialogue' | 'narration' | 'sfx';
  content: string;
  position: Position;
  style: {
    font_family: string;
    font_size: number;
    color: string;
    bold?: boolean;
    italic?: boolean;
    bubble_style?: string;
    bubble_color?: string;
    bubble_border_color?: string;
    bubble_border_width?: number;
  };
  character_id?: string;
  created_at: string;
}

// ============================================
// CHARACTERS
// ============================================

export interface Character {
  character_id: string;
  series_id: string;
  name: string;
  description?: string;
  appearance_description?: string;
  personality_traits?: string[];
  reference_images?: string[];
  consistency_token?: string;
  style_guide?: any;
  created_at: string;
  updated_at: string;
}

// ============================================
// EPISODE FULL RESPONSE
// ============================================

export interface EpisodeFullResponse {
  episode: Episode;
  pages: Page[];
  characters: Character[];
  comments: any[];
}

// ============================================
// AI GENERATION
// ============================================

export interface PanelGenerationInput {
  scene_description: string;
  characters?: {
    character_id: string;
    expression: string;
    pose: string;
  }[];
  style: {
    base: string;
    quality: 'standard' | 'high';
    color_treatment?: string;
  };
  panel: {
    camera_angle: string;
    aspect_ratio: string;
    shot_type?: string;
  };
}

export interface AIJobInput {
  job_type: 'panel_generation' | 'character_generation' | 'batch_generation';
  panel_id?: string;
  input: PanelGenerationInput;
}

export interface AIJob {
  job_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  estimated_credits?: number;
  estimated_duration_seconds?: number;
  progress?: number;
  result?: {
    image_url: string;
    thumbnail_url: string;
    width: number;
    height: number;
    prompt_used: string;
    generation_metadata?: any;
  };
  error?: {
    code: string;
    message: string;
    suggestions?: string[];
  };
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

// ============================================
// CREDITS
// ============================================

export interface CreditTransaction {
  tx_id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  reason: string;
  metadata?: any;
  created_at: string;
}

// ============================================
// EXPORT
// ============================================

export interface ExportJob {
  export_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  estimated_duration?: number;
  progress?: number;
  result_url?: string;
  error_message?: string;
  created_at?: string;
  finished_at?: string;
}
