# Comic Creator Web Application - Technical Specification (Frontend-First)

## Executive Summary

A comprehensive web-based comic creation application with **frontend-first development approach** using mock data. The platform enables users to create multi-episode comic series with AI-powered panel generation through Google's Gemini API. Frontend development can proceed independently while backend is built in parallel.

---

## 1. System Architecture Overview

### 1.1 Technology Stack

**Frontend (Priority 1 - Build First)**
- React 18+ with TypeScript
- State Management: Zustand (Redux Toolkit for complex flows)
- UI Framework: Tailwind CSS + shadcn/ui
- Canvas Manipulation: Fabric.js or Konva.js
- Animation: Framer Motion
- Rich Text Editor: Lexical or TipTap
- Build Tool: Vite
- Testing: Vitest + React Testing Library

**Backend (Priority 2 - Build After Frontend)**
- Platform: Java 17+ with Spring Boot 3
- API Style: RESTful APIs (JSON-based)
- Authentication: JWT (access token) + OAuth 2.0 (Google, GitHub)
- Database: MySQL 8.0+ (primary)
- Cache: Redis (sessions, rate limiting)
- Persistence: Spring Data JPA / Hibernate
- Validation: Bean Validation (Jakarta Validation)
- Security: Spring Security

**AI Integration**
- LLM & Vision: Google Gemini API (Gemini Pro, Gemini Vision)
  - Story assistance (plot suggestions, dialogue, script refinement)
  - Natural language understanding
- Image Generation: Imagen API or compatible provider
  - Panel generation, backgrounds, style variations
- Prompt Orchestration: Centralized backend layer

**Infrastructure**
- Containerization: Docker
- CI/CD: GitHub Actions
- Hosting:
  - Frontend: Vercel (React/Next.js)
  - Backend: Render (Spring Boot)
- File Storage: AWS S3
- Secrets: Environment variables (Render + Vercel)

### 1.2 Development Approach: Frontend-First

```
Phase 1: Frontend Development (Weeks 1-6)
┌─────────────────────────────────────────────┐
│  React App with Mock Data                   │
│  ┌──────────────┐    ┌──────────────┐      │
│  │  Components  │    │  Mock API    │      │
│  │  & Pages     │◄───│  Services    │      │
│  └──────────────┘    └──────────────┘      │
│  ┌──────────────┐    ┌──────────────┐      │
│  │  Zustand     │    │  Mock Data   │      │
│  │  Stores      │◄───│  Generators  │      │
│  └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────┘

Phase 2: Backend Development (Weeks 5-10, parallel)
┌─────────────────────────────────────────────┐
│  Spring Boot API                             │
│  ┌──────────────┐    ┌──────────────┐      │
│  │  Controllers │◄───│  Services    │      │
│  └──────────────┘    └──────────────┘      │
│  ┌──────────────┐    ┌──────────────┐      │
│  │  JPA Repos   │◄───│  MySQL DB    │      │
│  └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────┘

Phase 3: Integration (Weeks 11-12)
┌─────────────────────────────────────────────┐
│  Frontend switches from Mock to Real API    │
│  ┌──────────────┐                           │
│  │  React App   │──────API Calls────►       │
│  └──────────────┘                           │
│                    ┌──────────────┐         │
│                    │  Spring Boot │         │
│                    │  Backend     │         │
│                    └──────────────┘         │
└─────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture (Build First)

### 2.1 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── editor/
│   │   │   ├── EpisodeEditor.tsx
│   │   │   ├── PageList.tsx
│   │   │   ├── PanelCanvas.tsx
│   │   │   ├── PanelToolbar.tsx
│   │   │   └── TextEditor.tsx
│   │   ├── series/
│   │   │   ├── SeriesCard.tsx
│   │   │   ├── SeriesForm.tsx
│   │   │   └── EpisodeCard.tsx
│   │   ├── character/
│   │   │   ├── CharacterList.tsx
│   │   │   └── CharacterForm.tsx
│   │   └── ui/ (shadcn/ui components)
│   │       ├── Button.tsx
│   │       ├── Dialog.tsx
│   │       ├── Input.tsx
│   │       └── ...
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── editorStore.ts
│   │   ├── seriesStore.ts
│   │   └── uiStore.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── mockApi.ts        ← Mock implementations
│   │   │   ├── realApi.ts        ← Real API (implement later)
│   │   │   └── apiClient.ts      ← Switch between mock/real
│   │   ├── mockData/
│   │   │   ├── users.ts
│   │   │   ├── series.ts
│   │   │   ├── episodes.ts
│   │   │   └── generators.ts     ← Data generators
│   │   └── utils/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useAutoSave.ts
│   │   ├── usePanel.ts
│   │   └── useMockDelay.ts       ← Simulate API latency
│   ├── types/
│   │   └── index.ts
│   └── pages/
│       ├── LoginPage.tsx
│       ├── Dashboard.tsx
│       ├── SeriesPage.tsx
│       └── EditorPage.tsx
├── public/
│   └── mock-images/               ← Sample images for development
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 2.2 Mock API System

```typescript
// lib/api/apiClient.ts
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const api = USE_MOCK ? mockApi : realApi;

// Switch between mock and real API with environment variable
// .env.development: VITE_USE_MOCK=true
// .env.production: VITE_USE_MOCK=false
```

**Mock API Implementation:**

```typescript
// lib/api/mockApi.ts
import { mockDelay } from '../utils/mockDelay';
import { generateMockSeries, generateMockEpisode } from '../mockData/generators';

export const mockApi = {
  // Auth
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await mockDelay(500); // Simulate network latency
    
    if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
      return {
        user: {
          user_id: 'mock-user-1',
          email: 'demo@example.com',
          username: 'demo',
          credits_balance: 100,
          subscription_tier: 'pro'
        },
        tokens: {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token'
        }
      };
    }
    throw new Error('Invalid credentials');
  },
  
  async register(data: RegisterData): Promise<AuthResponse> {
    await mockDelay(800);
    return {
      user: {
        user_id: generateId(),
        email: data.email,
        username: data.username,
        credits_balance: 10,
        subscription_tier: 'free'
      },
      tokens: {
        access_token: 'mock-jwt-token',
        refresh_token: 'mock-refresh-token'
      }
    };
  },
  
  // Series
  async getSeries(): Promise<Series[]> {
    await mockDelay(300);
    const stored = localStorage.getItem('mock-series');
    if (stored) return JSON.parse(stored);
    
    const mockSeries = [
      generateMockSeries(),
      generateMockSeries(),
      generateMockSeries()
    ];
    localStorage.setItem('mock-series', JSON.stringify(mockSeries));
    return mockSeries;
  },
  
  async createSeries(data: CreateSeriesData): Promise<Series> {
    await mockDelay(500);
    const newSeries = {
      series_id: generateId(),
      ...data,
      user_id: 'mock-user-1',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store in localStorage
    const series = await this.getSeries();
    series.push(newSeries);
    localStorage.setItem('mock-series', JSON.stringify(series));
    
    return newSeries;
  },
  
  async getEpisodeFull(episodeId: string): Promise<EpisodeFullResponse> {
    await mockDelay(600);
    
    // Check localStorage first
    const stored = localStorage.getItem(`mock-episode-${episodeId}`);
    if (stored) return JSON.parse(stored);
    
    // Generate mock episode
    const mockEpisode = generateMockEpisode(episodeId);
    localStorage.setItem(`mock-episode-${episodeId}`, JSON.stringify(mockEpisode));
    
    return mockEpisode;
  },
  
  async updatePanel(panelId: string, updates: Partial<Panel>): Promise<Panel> {
    await mockDelay(200);
    
    // Simple update - in real app would update in localStorage
    return {
      panel_id: panelId,
      ...updates
    } as Panel;
  },
  
  // AI Generation (mock)
  async createAIJob(input: AIJobInput): Promise<AIJob> {
    await mockDelay(1000);
    
    const jobId = generateId();
    const job: AIJob = {
      job_id: jobId,
      status: 'pending',
      estimated_credits: 1,
      estimated_duration_seconds: 10,
      created_at: new Date().toISOString()
    };
    
    // Simulate job processing
    setTimeout(() => {
      const completedJob: AIJob = {
        ...job,
        status: 'success',
        result: {
          image_url: `/mock-images/panel-${Math.floor(Math.random() * 10)}.jpg`,
          thumbnail_url: `/mock-images/thumb-${Math.floor(Math.random() * 10)}.jpg`,
          width: 1024,
          height: 576,
          prompt_used: input.input.scene_description
        },
        finished_at: new Date().toISOString()
      };
      
      localStorage.setItem(`mock-job-${jobId}`, JSON.stringify(completedJob));
    }, 8000);
    
    return job;
  },
  
  async getAIJob(jobId: string): Promise<AIJob> {
    await mockDelay(100);
    
    const stored = localStorage.getItem(`mock-job-${jobId}`);
    if (stored) return JSON.parse(stored);
    
    // Still processing
    return {
      job_id: jobId,
      status: 'processing',
      progress: Math.floor(Math.random() * 80) + 10,
      started_at: new Date().toISOString()
    };
  }
};
```

**Mock Data Generators:**

```typescript
// lib/mockData/generators.ts
import { faker } from '@faker-js/faker';

export function generateMockSeries(): Series {
  return {
    series_id: faker.string.uuid(),
    user_id: 'mock-user-1',
    title: faker.book.title(),
    description: faker.lorem.paragraph(),
    genre: faker.helpers.arrayElement(['action', 'comedy', 'drama', 'fantasy', 'sci-fi']),
    art_style: {
      base: faker.helpers.arrayElement(['manga', 'western', 'webtoon']),
      color_palette: [faker.color.rgb(), faker.color.rgb(), faker.color.rgb()]
    },
    status: 'draft',
    cover_image_url: `/mock-images/cover-${faker.number.int({ min: 1, max: 10 })}.jpg`,
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString()
  };
}

export function generateMockEpisode(episodeId?: string): EpisodeFullResponse {
  const id = episodeId || faker.string.uuid();
  
  // Generate 3-5 pages with 4-6 panels each
  const pageCount = faker.number.int({ min: 3, max: 5 });
  const pages: Page[] = [];
  
  for (let i = 1; i <= pageCount; i++) {
    const panelCount = faker.number.int({ min: 4, max: 6 });
    const panels: Panel[] = [];
    
    for (let j = 1; j <= panelCount; j++) {
      const panel: Panel = {
        panel_id: faker.string.uuid(),
        panel_number: j,
        position: {
          x: ((j - 1) % 2) * 50,
          y: Math.floor((j - 1) / 2) * 50,
          width: 50,
          height: 50
        },
        image_url: `/mock-images/panel-${faker.number.int({ min: 1, max: 20 })}.jpg`,
        thumbnail_url: `/mock-images/thumb-${faker.number.int({ min: 1, max: 20 })}.jpg`,
        generation_prompt: faker.lorem.sentence(),
        text_elements: generateMockTextElements(faker.number.int({ min: 1, max: 3 }))
      };
      panels.push(panel);
    }
    
    pages.push({
      page_id: faker.string.uuid(),
      page_number: i,
      layout_type: 'traditional',
      panels
    });
  }
  
  return {
    episode: {
      episode_id: id,
      series_id: faker.string.uuid(),
      episode_number: 1,
      title: `Chapter ${faker.number.int({ min: 1, max: 10 })}`,
      description: faker.lorem.paragraph(),
      status: 'draft'
    },
    pages,
    characters: generateMockCharacters(3),
    comments: []
  };
}

function generateMockTextElements(count: number): TextElement[] {
  return Array.from({ length: count }, (_, i) => ({
    text_id: faker.string.uuid(),
    text_type: faker.helpers.arrayElement(['dialogue', 'narration', 'sfx']),
    content: faker.lorem.sentence(),
    position: {
      x: faker.number.int({ min: 10, max: 40 }),
      y: faker.number.int({ min: 10, max: 40 }),
      width: 30,
      height: 15
    },
    style: {
      font_family: 'Arial',
      font_size: 16,
      color: '#000000'
    }
  }));
}

function generateMockCharacters(count: number): Character[] {
  return Array.from({ length: count }, () => ({
    character_id: faker.string.uuid(),
    name: faker.person.firstName(),
    description: faker.lorem.paragraph(),
    appearance_description: faker.lorem.sentences(2),
    consistency_token: `char_${faker.string.alphanumeric(10)}`
  }));
}
```

**Mock Delay Utility:**

```typescript
// lib/utils/mockDelay.ts
export async function mockDelay(ms: number = 500): Promise<void> {
  const jitter = Math.random() * 200 - 100; // ±100ms jitter
  return new Promise(resolve => setTimeout(resolve, ms + jitter));
}
```

### 2.3 Zustand Stores with Mock Data

```typescript
// stores/editorStore.ts
import { create } from 'zustand';
import { api } from '@/lib/api/apiClient';

interface EditorState {
  episode: Episode | null;
  pages: Page[];
  panelsById: Record<string, Panel>;
  textElementsById: Record<string, TextElement>;
  charactersById: Record<string, Character>;
  selectedPanelId: string | null;
  dirty: boolean;
  saving: boolean;
  loading: boolean;
  
  // Actions
  loadEpisode: (episodeId: string) => Promise<void>;
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  addTextElement: (panelId: string, element: Omit<TextElement, 'text_id'>) => void;
  saveChanges: () => Promise<void>;
  generatePanel: (panelId: string, input: PanelGenerationInput) => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  episode: null,
  pages: [],
  panelsById: {},
  textElementsById: {},
  charactersById: {},
  selectedPanelId: null,
  dirty: false,
  saving: false,
  loading: false,
  
  loadEpisode: async (episodeId: string) => {
    set({ loading: true });
    
    try {
      const data = await api.getEpisodeFull(episodeId);
      
      // Normalize data
      const panelsById: Record<string, Panel> = {};
      const textElementsById: Record<string, TextElement> = {};
      
      data.pages.forEach(page => {
        page.panels.forEach(panel => {
          panelsById[panel.panel_id] = panel;
          panel.text_elements?.forEach(te => {
            textElementsById[te.text_id] = te;
          });
        });
      });
      
      set({
        episode: data.episode,
        pages: data.pages,
        panelsById,
        textElementsById,
        charactersById: keyBy(data.characters, 'character_id'),
        loading: false,
        dirty: false
      });
    } catch (error) {
      console.error('Failed to load episode:', error);
      set({ loading: false });
      throw error;
    }
  },
  
  updatePanel: (panelId: string, updates: Partial<Panel>) => {
    set((state) => ({
      panelsById: {
        ...state.panelsById,
        [panelId]: { ...state.panelsById[panelId], ...updates }
      },
      dirty: true
    }));
  },
  
  addTextElement: (panelId: string, element: Omit<TextElement, 'text_id'>) => {
    const textId = crypto.randomUUID();
    const newElement = { ...element, text_id: textId, panel_id: panelId };
    
    set((state) => ({
      textElementsById: {
        ...state.textElementsById,
        [textId]: newElement
      },
      dirty: true
    }));
  },
  
  saveChanges: async () => {
    const state = get();
    if (!state.dirty || state.saving) return;
    
    set({ saving: true });
    
    try {
      // In mock mode, just simulate save
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In real mode, would send updates to API
      // const updates = collectChanges(state);
      // await api.updateEpisode(state.episode.episode_id, updates);
      
      set({ dirty: false, saving: false });
      toast.success('Changes saved');
    } catch (error) {
      set({ saving: false });
      toast.error('Failed to save changes');
      throw error;
    }
  },
  
  generatePanel: async (panelId: string, input: PanelGenerationInput) => {
    try {
      // Create AI job
      const job = await api.createAIJob({
        job_type: 'panel_generation',
        panel_id: panelId,
        input
      });
      
      // Poll for completion
      const result = await pollJobStatus(job.job_id);
      
      // Update panel with generated image
      get().updatePanel(panelId, {
        image_url: result.result.image_url,
        thumbnail_url: result.result.thumbnail_url,
        generation_prompt: result.result.prompt_used
      });
      
      toast.success('Panel generated successfully!');
    } catch (error) {
      console.error('Failed to generate panel:', error);
      toast.error('Generation failed');
      throw error;
    }
  }
}));

// Helper function to poll job status
async function pollJobStatus(jobId: string): Promise<AIJob> {
  const maxAttempts = 30;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const job = await api.getAIJob(jobId);
    
    if (job.status === 'success') {
      return job;
    }
    
    if (job.status === 'failed') {
      throw new Error('Generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }
  
  throw new Error('Generation timeout');
}
```

### 2.4 Environment Setup

```bash
# .env.development (use mock data)
VITE_USE_MOCK=true
VITE_API_BASE_URL=http://localhost:8080/api

# .env.production (use real API)
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## 3. Backend Architecture (Spring Boot)

### 3.1 Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── comicstudio/
│   │   │           ├── ComicStudioApplication.java
│   │   │           ├── config/
│   │   │           │   ├── SecurityConfig.java
│   │   │           │   ├── JwtConfig.java
│   │   │           │   ├── RedisConfig.java
│   │   │           │   └── CorsConfig.java
│   │   │           ├── controller/
│   │   │           │   ├── AuthController.java
│   │   │           │   ├── SeriesController.java
│   │   │           │   ├── EpisodeController.java
│   │   │           │   ├── PanelController.java
│   │   │           │   ├── AIController.java
│   │   │           │   └── ExportController.java
│   │   │           ├── service/
│   │   │           │   ├── AuthService.java
│   │   │           │   ├── SeriesService.java
│   │   │           │   ├── EpisodeService.java
│   │   │           │   ├── AIService.java
│   │   │           │   ├── CreditService.java
│   │   │           │   └── StorageService.java
│   │   │           ├── repository/
│   │   │           │   ├── UserRepository.java
│   │   │           │   ├── SeriesRepository.java
│   │   │           │   ├── EpisodeRepository.java
│   │   │           │   ├── PanelRepository.java
│   │   │           │   └── AIJobRepository.java
│   │   │           ├── model/
│   │   │           │   ├── entity/
│   │   │           │   │   ├── User.java
│   │   │           │   │   ├── Series.java
│   │   │           │   │   ├── Episode.java
│   │   │           │   │   ├── Page.java
│   │   │           │   │   ├── Panel.java
│   │   │           │   │   └── AIJob.java
│   │   │           │   └── dto/
│   │   │           │       ├── AuthRequest.java
│   │   │           │       ├── SeriesDTO.java
│   │   │           │       └── ...
│   │   │           ├── security/
│   │   │           │   ├── JwtTokenProvider.java
│   │   │           │   └── JwtAuthenticationFilter.java
│   │   │           └── exception/
│   │   │               ├── GlobalExceptionHandler.java
│   │   │               └── CustomExceptions.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       └── application-prod.yml
│   └── test/
├── pom.xml
└── Dockerfile
```

### 3.2 Database Schema (MySQL)

```sql
-- Users and Authentication
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    credits_balance INT DEFAULT 10,
    subscription_plan_id INT DEFAULT 1,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscription Plans
CREATE TABLE subscription_plans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    monthly_price_cents INT NOT NULL,
    monthly_credits INT NOT NULL,
    daily_credits_limit INT,
    max_storage_gb INT NOT NULL,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credit Transactions
CREATE TABLE credit_transactions (
    tx_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount INT NOT NULL,
    balance_after INT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Series
CREATE TABLE series (
    series_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    genre VARCHAR(100),
    art_style JSON,
    status VARCHAR(50) DEFAULT 'draft',
    cover_image_url TEXT,
    tags JSON,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Episodes
CREATE TABLE episodes (
    episode_id VARCHAR(36) PRIMARY KEY,
    series_id VARCHAR(36) NOT NULL,
    episode_number INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    script TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    thumbnail_url TEXT,
    page_count INT DEFAULT 0,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(series_id) ON DELETE CASCADE,
    UNIQUE KEY unique_series_episode (series_id, episode_number),
    INDEX idx_series (series_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pages
CREATE TABLE pages (
    page_id VARCHAR(36) PRIMARY KEY,
    episode_id VARCHAR(36) NOT NULL,
    page_number INT NOT NULL,
    layout_type VARCHAR(50) DEFAULT 'traditional',
    layout_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id) ON DELETE CASCADE,
    UNIQUE KEY unique_episode_page (episode_id, page_number),
    INDEX idx_episode (episode_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Panels
CREATE TABLE panels (
    panel_id VARCHAR(36) PRIMARY KEY,
    page_id VARCHAR(36) NOT NULL,
    panel_number INT NOT NULL,
    panel_type VARCHAR(50),
    position JSON NOT NULL,
    image_url TEXT,
    thumbnail_url TEXT,
    generation_prompt TEXT,
    generation_config JSON,
    script_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE,
    INDEX idx_page (page_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Text Elements
CREATE TABLE text_elements (
    text_id VARCHAR(36) PRIMARY KEY,
    panel_id VARCHAR(36) NOT NULL,
    text_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    position JSON NOT NULL,
    style JSON NOT NULL,
    character_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (panel_id) REFERENCES panels(panel_id) ON DELETE CASCADE,
    INDEX idx_panel (panel_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Characters
CREATE TABLE characters (
    character_id VARCHAR(36) PRIMARY KEY,
    series_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    appearance_description TEXT,
    personality_traits JSON,
    reference_images JSON,
    consistency_token TEXT,
    style_guide JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (series_id) REFERENCES series(series_id) ON DELETE CASCADE,
    INDEX idx_series (series_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI Jobs
CREATE TABLE ai_jobs (
    job_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    input JSON NOT NULL,
    result JSON,
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    scheduled_at TIMESTAMP NOT NULL,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status),
    INDEX idx_scheduled (scheduled_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Export Jobs
CREATE TABLE export_jobs (
    export_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    episode_id VARCHAR(36) NOT NULL,
    format VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    config JSON,
    result_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (episode_id) REFERENCES episodes(episode_id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets
CREATE TABLE assets (
    asset_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    series_id VARCHAR(36),
    asset_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    tags JSON,
    metadata JSON,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (series_id) REFERENCES series(series_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_type (asset_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 3.3 Spring Boot Configuration

**pom.xml:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
    </parent>
    
    <groupId>com.comicstudio</groupId>
    <artifactId>comic-creator-backend</artifactId>
    <version>1.0.0</version>
    <name>Comic Creator Backend</name>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
        
        <!-- Database -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.12.3</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.12.3</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- AWS S3 -->
        <dependency>
            <groupId>software.amazon.awssdk</groupId>
            <artifactId>s3</artifactId>
            <version>2.21.0</version>
        </dependency>
        
        <!-- Google Gemini API -->
        <dependency>
            <groupId>com.google.cloud</groupId>
            <artifactId>google-cloud-aiplatform</artifactId>
            <version>3.35.0</version>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**application.yml:**

```yaml
spring:
  application:
    name: comic-creator-backend
  
  datasource:
    url: ${DATABASE_URL:jdbc:mysql://localhost:3306/comic_creator}
    username: ${DATABASE_USER:root}
    password: ${DATABASE_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-secret-key-change-in-production}
  expiration: 604800000  # 7 days
  refresh-expiration: 2592000000  # 30 days

# AWS S3
aws:
  s3:
    bucket: ${AWS_S3_BUCKET:comic-creator-assets}
    region: ${AWS_REGION:us-east-1}
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}

# Gemini API
gemini:
  api-key: ${GEMINI_API_KEY}
  model: gemini-pro-vision
  project-id: ${GCP_PROJECT_ID}

# CORS
cors:
  allowed-origins: ${FRONTEND_URL:http://localhost:5173}

# Credit System
credits:
  free-tier-daily-limit: 10
  panel-generation-cost: 1
  batch-discount: 0.8

server:
  port: ${PORT:8080}

logging:
  level:
    com.comicstudio: INFO
    org.springframework: WARN
```

### 3.4 Key Spring Boot Classes

**JWT Token Provider:**

```java
// security/JwtTokenProvider.java
@Component
public class JwtTokenProvider {
    
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    @Value("${jwt.expiration}")
    private long jwtExpiration;
    
    public String generateToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        
        return Jwts.builder()
            .setSubject(userId)
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
        
        return claims.getSubject();
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
```

**Episode Controller (Full Endpoint):**

```java
// controller/EpisodeController.java
@RestController
@RequestMapping("/api/episodes")
@RequiredArgsConstructor
public class EpisodeController {
    
    private final EpisodeService episodeService;
    
    @GetMapping("/{episodeId}/full")
    public ResponseEntity<EpisodeFullResponse> getEpisodeFull(
        @PathVariable String episodeId,
        @AuthenticationPrincipal String userId
    ) {
        EpisodeFullResponse response = episodeService.getEpisodeFull(episodeId, userId);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<EpisodeDTO> createEpisode(
        @Valid @RequestBody CreateEpisodeRequest request,
        @AuthenticationPrincipal String userId
    ) {
        EpisodeDTO episode = episodeService.createEpisode(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(episode);
    }
    
    @PatchMapping("/{episodeId}")
    public ResponseEntity<EpisodeDTO> updateEpisode(
        @PathVariable String episodeId,
        @Valid @RequestBody UpdateEpisodeRequest request,
        @AuthenticationPrincipal String userId
    ) {
        EpisodeDTO episode = episodeService.updateEpisode(episodeId, request, userId);
        return ResponseEntity.ok(episode);
    }
}
```

**Credit Service:**

```java
// service/CreditService.java
@Service
@RequiredArgsConstructor
@Transactional
public class CreditService {
    
    private final UserRepository userRepository;
    private final CreditTransactionRepository transactionRepository;
    
    public boolean checkBalance(String userId, int cost) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        return user.getCreditsBalance() >= cost;
    }
    
    public void deduct(String userId, int amount, String reason, Map<String, Object> metadata) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        if (user.getCreditsBalance() < amount) {
            throw new InsufficientCreditsException();
        }
        
        user.setCreditsBalance(user.getCreditsBalance() - amount);
        userRepository.save(user);
        
        // Log transaction
        CreditTransaction tx = CreditTransaction.builder()
            .txId(UUID.randomUUID().toString())
            .userId(userId)
            .amount(-amount)
            .balanceAfter(user.getCreditsBalance())
            .reason(reason)
            .metadata(metadata)
            .build();
        
        transactionRepository.save(tx);
    }
    
    public void refund(String userId, int amount, String reason) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException(userId));
        
        user.setCreditsBalance(user.getCreditsBalance() + amount);
        userRepository.save(user);
        
        // Log refund
        CreditTransaction tx = CreditTransaction.builder()
            .txId(UUID.randomUUID().toString())
            .userId(userId)
            .amount(amount)
            .balanceAfter(user.getCreditsBalance())
            .reason("refund_" + reason)
            .build();
        
        transactionRepository.save(tx);
    }
}
```

---

## 4. Development Workflow

### 4.1 Frontend Development (Weeks 1-6)

**Week 1: Setup & Basic UI**
```bash
# Setup project
npm create vite@latest comic-creator-frontend -- --template react-ts
cd comic-creator-frontend
npm install

# Install dependencies
npm install zustand react-router-dom
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react react-hot-toast
npm install fabric konva react-konva
npm install @faker-js/faker -D

# Setup Tailwind
npx tailwindcss init -p

# Setup mock data
mkdir -p src/lib/mockData
mkdir -p src/lib/api
mkdir -p public/mock-images

# Download sample images to public/mock-images/
# Or use placeholder services like https://placehold.co
```

**Week 2-3: Core Components**
- Dashboard
- Series List/Card
- Episode Editor (basic layout)
- Authentication (with mock)

**Week 4-5: Canvas & Editing**
- Panel Canvas (Fabric.js/Konva)
- Text Editor integration
- Image upload/manipulation
- Auto-save with mock API

**Week 6: Polish**
- Animations (Framer Motion)
- Error handling
- Loading states
- Responsive design

### 4.2 Backend Development (Weeks 5-10, parallel)

**Week 5-6: Setup & Auth**
```bash
# Create Spring Boot project
spring init --dependencies=web,data-jpa,security,validation,data-redis \
  --build=maven --java-version=17 \
  comic-creator-backend

# Setup database
docker-compose up -d mysql redis

# Create entities & repositories
# Implement JWT authentication
```

**Week 7-8: Core APIs**
- Series CRUD
- Episode CRUD
- Episode Full endpoint
- Panel updates
- Credits system

**Week 9-10: AI Integration**
- Gemini API integration
- Job queue system
- Image processing
- S3 upload

### 4.3 Integration (Weeks 11-12)

**Week 11: Connect Frontend to Backend**
```typescript
// Switch from mock to real API
// .env.production
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://backend.onrender.com/api

// Test all endpoints
// Fix CORS issues
// Handle authentication flow
```

**Week 12: Testing & Deployment**
- E2E testing
- Performance optimization
- Deploy to Vercel (frontend)
- Deploy to Render (backend)

---

## 5. Mock Images Setup

```bash
# Create mock image directory
mkdir -p public/mock-images

# Download or generate sample images
# Panel examples (20 images)
for i in {1..20}; do
  wget "https://placehold.co/1024x576/000000/FFFFFF/png?text=Panel+$i" \
    -O public/mock-images/panel-$i.jpg
done

# Thumbnails (20 images)
for i in {1..20}; do
  wget "https://placehold.co/300x169/000000/FFFFFF/png?text=Thumb+$i" \
    -O public/mock-images/thumb-$i.jpg
done

# Cover images (10 images)
for i in {1..10}; do
  wget "https://placehold.co/600x800/000000/FFFFFF/png?text=Cover+$i" \
    -O public/mock-images/cover-$i.jpg
done
```

---

## 6. Deployment Configuration

### 6.1 Frontend (Vercel)

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_USE_MOCK": "false",
    "VITE_API_BASE_URL": "@api-base-url"
  }
}
```

### 6.2 Backend (Render)

**render.yaml:**
```yaml
services:
  - type: web
    name: comic-creator-backend
    env: java
    buildCommand: ./mvnw clean package -DskipTests
    startCommand: java -jar target/comic-creator-backend-1.0.0.jar
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: comic-creator-db
          property: connectionString
      - key: REDIS_HOST
        fromService:
          name: comic-creator-redis
          property: host
      - key: JWT_SECRET
        generateValue: true
      - key: GEMINI_API_KEY
        sync: false
      - key: AWS_ACCESS_KEY_ID
        sync: false
      - key: AWS_SECRET_ACCESS_KEY
        sync: false

databases:
  - name: comic-creator-db
    databaseName: comic_creator
    user: comic_creator_user

services:
  - type: redis
    name: comic-creator-redis
    plan: starter
```

---

## 7. Testing Strategy

### 7.1 Frontend Testing

```typescript
// Component test example
describe('EpisodeEditor', () => {
  it('loads episode with mock data', async () => {
    render(<EpisodeEditor />);
    
    await waitFor(() => {
      expect(screen.getByText(/Chapter/i)).toBeInTheDocument();
    });
  });
  
  it('updates panel position', async () => {
    const { store } = renderWithStore(<PanelCanvas />);
    
    act(() => {
      store.getState().updatePanel('panel-1', { position: { x: 100 } });
    });
    
    expect(store.getState().panelsById['panel-1'].position.x).toBe(100);
  });
});
```

### 7.2 Backend Testing

```java
@SpringBootTest
@AutoConfigureMockMvc
class EpisodeControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void getEpisodeFull_ReturnsCompleteData() throws Exception {
        mockMvc.perform(get("/api/episodes/{id}/full", "episode-1")
            .header("Authorization", "Bearer " + validToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.episode").exists())
            .andExpect(jsonPath("$.pages").isArray())
            .andExpect(jsonPath("$.characters").isArray());
    }
}
```

---

## Conclusion

This specification provides a **frontend-first development approach** that allows:

✅ **Independent Frontend Development** - Work with mock data from day 1  
✅ **Realistic Development Experience** - Mock API simulates real latency and behavior  
✅ **Easy Integration** - Switch from mock to real API with environment variable  
✅ **Complete Tech Stack** - Spring Boot backend ready for parallel development  
✅ **Production Ready** - Deploy to Vercel + Render with CI/CD  

**Next Steps:**

1. **Week 1:** Setup React project + mock data system
2. **Week 2-6:** Build all frontend components with mock API
3. **Week 5+:** Start Spring Boot backend in parallel
4. **Week 11:** Integration testing
5. **Week 12:** Deploy to production

---

*Document Version: 3.0 (Frontend-First)*  
*Last Updated: November 2025*  
*Technology: React 18 + TypeScript + Spring Boot 3 + MySQL 8*