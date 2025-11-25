import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

export function RegisterForm() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthStore();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [validationError, setValidationError] = useState('');

    // Password strength
    const getPasswordStrength = (pwd: string): number => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z\d]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Clear errors
        clearError();
        setValidationError('');

        // Validate
        if (!email || !username || !password || !confirmPassword) {
            setValidationError('Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            setValidationError('Please enter a valid email');
            return;
        }

        if (username.length < 3) {
            setValidationError('Username must be at least 3 characters');
            return;
        }

        if (password.length < 8) {
            setValidationError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setValidationError('Passwords do not match');
            return;
        }

        try {
            await register({ email, username, password });
            // Navigate to dashboard on success
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error:', err);
        }
    };

    const displayError = validationError || error;

    return (
        <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        Start your comic creation journey
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                                placeholder="you@example.com"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Username Field */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="artist123"
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

                        {/* Password Strength Indicator */}
                        {password && (
                            <div className="mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                            key={level}
                                            className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength
                                                    ? level <= 2
                                                        ? 'bg-red-500'
                                                        : level <= 3
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                    : 'bg-gray-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-600 mt-1">
                                    {passwordStrength <= 2
                                        ? 'Weak password'
                                        : passwordStrength <= 3
                                            ? 'Medium password'
                                            : 'Strong password'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                            {password && confirmPassword && password === confirmPassword && (
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                            )}
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
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
}
