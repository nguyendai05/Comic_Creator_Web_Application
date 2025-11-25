import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
    const navigate = useNavigate();
    const { login, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('demo@example.com');
    const [password, setPassword] = useState('demo123');
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Clear errors
        clearError();
        setValidationError('');

        // Validate
        if (!email || !password) {
            setValidationError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setValidationError('Please enter a valid email');
            return;
        }

        try {
            await login({ email, password });
            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            // Error is handled by store
            console.error('Login error:', err);
        }
    };

    const displayError = validationError || error;

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Sign in to continue to Comic Creator
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="demo@example.com"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {displayError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-800">{displayError}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Credentials Hint */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Demo Credentials:</strong><br />
                        Email: demo@example.com<br />
                        Password: demo123
                    </p>
                </div>

                {/* Register Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/register')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    );
}
