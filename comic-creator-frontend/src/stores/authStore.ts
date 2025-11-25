import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { User, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
    // State
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, _get) => ({
            // Initial state
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Login
            login: async (credentials: LoginCredentials) => {
                set({ isLoading: true, error: null });

                try {
                    console.log('🔐 Attempting login...');
                    const response = await api.login(credentials);

                    set({
                        user: response.user,
                        accessToken: response.tokens.access_token,
                        refreshToken: response.tokens.refresh_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    console.log('✅ Login successful:', response.user.username);
                } catch (error) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Login failed';

                    console.error('❌ Login failed:', errorMessage);

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage
                    });

                    throw error;
                }
            },

            // Register
            register: async (data: RegisterData) => {
                set({ isLoading: true, error: null });

                try {
                    console.log('📝 Attempting registration...');
                    const response = await api.register(data);

                    set({
                        user: response.user,
                        accessToken: response.tokens.access_token,
                        refreshToken: response.tokens.refresh_token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    console.log('✅ Registration successful:', response.user.username);
                } catch (error) {
                    const errorMessage = error instanceof Error
                        ? error.message
                        : 'Registration failed';

                    console.error('❌ Registration failed:', errorMessage);

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: errorMessage
                    });

                    throw error;
                }
            },

            // Logout
            logout: async () => {
                try {
                    console.log('🔓 Logging out...');
                    await api.logout();

                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null
                    });

                    console.log('✅ Logged out successfully');
                } catch (error) {
                    console.error('❌ Logout error:', error);

                    // Clear state anyway
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        error: null
                    });
                }
            },

            // Clear error
            clearError: () => {
                set({ error: null });
            },

            // Set user (for updates)
            setUser: (user: User) => {
                set({ user });
            }
        }),
        {
            name: 'comic-creator-auth', // localStorage key
            partialize: (state) => ({
                // Only persist these fields
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

// Helper hook for checking auth status
export const useIsAuthenticated = () => {
    return useAuthStore((state) => state.isAuthenticated);
};

// Helper hook for getting current user
export const useCurrentUser = () => {
    return useAuthStore((state) => state.user);
};
