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
