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