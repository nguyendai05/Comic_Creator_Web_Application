---
description: Testing Workflows -> Component Testing with Mock Data
---

```typescript
// __tests__/EditorPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { EditorPage } from '@/pages/EditorPage';
import { BrowserRouter } from 'react-router-dom';

// Mock the API
vi.mock('@/lib/api/apiClient', () => ({
  api: {
    getEpisodeFull: vi.fn().mockResolvedValue({
      episode: {
        episode_id: 'test-episode',
        title: 'Test Episode'
      },
      pages: [],
      characters: [],
      comments: []
    })
  }
}));

describe('EditorPage', () => {
  it('loads and displays episode', async () => {
    render(
      <BrowserRouter>
        <EditorPage />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Episode')).toBeInTheDocument();
    });
  });
  
  it('shows loading state initially', () => {
    render(
      <BrowserRouter>
        <EditorPage />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### 5.2 Integration Testing

```typescript
// __tests__/integration/editor-workflow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '@/App';

describe('Complete Editor Workflow', () => {
  it('allows user to create and edit episode', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // 1. Login
    await user.type(screen.getByLabelText(/email/i), 'demo@example.com');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // 2. Navigate to series
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
    
    // 3. Open episode
    const episode = screen.getAllByText(/chapter/i)[0];
    await user.click(episode);
    
    // 4. Add text to panel
    await waitFor(() => {
      const panel = screen.getAllByTestId('panel')[0];
      await user.click(panel);
    });
    
    const addTextButton = screen.getByRole('button', { name: /add text/i });
    await user.click(addTextButton);
    
    const textInput = screen.getByPlaceholderText(/enter dialogue/i);
    await user.type(textInput, 'Hello, world!');
    
    // 5. Verify auto-save
    await waitFor(() => {
      expect(screen.getByText(/saved/i)).toBeInTheDocument();
    }, { timeout: 6000 });
  });
});
```