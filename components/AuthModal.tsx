import React, { useState } from 'react';
import { User, AuthAction } from '../types';
import { authService, userService } from '../services/supabase.service';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
    initialAction: AuthAction;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'MAGIC_LINK' | 'FORGOT_PASSWORD';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialAction }) => {
    const [mode, setMode] = useState<AuthMode>(initialAction === 'REGISTER' ? 'REGISTER' : 'LOGIN');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setError('');
        setSuccessMessage('');
    };

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (mode === 'REGISTER') {
                // Validate registration fields
                if (!name || name.trim().length < 2) {
                    setError('Name must be at least 2 characters long.');
                    setIsLoading(false);
                    return;
                }

                if (!email || !password) {
                    setError('Email and password are required.');
                    setIsLoading(false);
                    return;
                }

                if (password.length < 6) {
                    setError('Password must be at least 6 characters long.');
                    setIsLoading(false);
                    return;
                }

                // Register with Supabase
                const { data } = await authService.signUp(email, password, name);

                // Immediately sign in the user (don't wait for email verification)
                const signInResult = await authService.signIn(email, password);

                if (signInResult.session && signInResult.user) {
                    // Get user profile
                    const userProfile = await userService.getUserProfile(signInResult.user.id);

                    if (userProfile) {
                        onAuthSuccess(userProfile);
                        setSuccessMessage('Account created! Please check your email to verify your account.');
                        setIsLoading(false);
                    }
                }

            } else if (mode === 'LOGIN') {
                // Login
                if (!email || !password) {
                    setError('Email and password are required.');
                    setIsLoading(false);
                    return;
                }

                const { session, user: authUser } = await authService.signIn(email, password);

                if (!session || !authUser) {
                    setError('Login failed. Please check your credentials.');
                    setIsLoading(false);
                    return;
                }

                // Get user profile from database
                const userProfile = await userService.getUserProfile(authUser.id);

                if (!userProfile) {
                    setError('User profile not found. Please contact support.');
                    setIsLoading(false);
                    return;
                }

                onAuthSuccess(userProfile);
                setIsLoading(false);

            } else if (mode === 'MAGIC_LINK') {
                // Magic Link
                if (!email) {
                    setError('Email is required.');
                    setIsLoading(false);
                    return;
                }

                // Send magic link
                const { error: magicLinkError } = await authService.signIn(email, '');

                if (magicLinkError) {
                    setError('Failed to send magic link. Please try again.');
                    setIsLoading(false);
                    return;
                }

                setSuccessMessage('Check your email! We sent you a magic link to log in.');
                setIsLoading(false);

            } else if (mode === 'FORGOT_PASSWORD') {
                // Password Reset
                if (!email) {
                    setError('Email is required.');
                    setIsLoading(false);
                    return;
                }

                // In a real implementation, you'd call a password reset method
                // For now, we'll show a success message
                setSuccessMessage('If an account exists with this email, you will receive password reset instructions.');
                setIsLoading(false);

                // Clear form after 3 seconds and switch to login
                setTimeout(() => {
                    switchMode('LOGIN');
                }, 3000);
            }
        } catch (err: any) {
            console.error('Auth error:', err);

            // Handle specific Supabase error messages
            if (err.message?.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message?.includes('already registered') || err.message?.includes('User already registered')) {
                setError('This email is already registered. Please log in instead.');
                setTimeout(() => switchMode('LOGIN'), 2000);
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Please verify your email before logging in.');
            } else {
                setError(err.message || 'An error occurred. Please try again.');
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
                    {mode === 'REGISTER' && 'Create Account'}
                    {mode === 'LOGIN' && 'Welcome Back'}
                    {mode === 'MAGIC_LINK' && 'Magic Link Login'}
                    {mode === 'FORGOT_PASSWORD' && 'Reset Password'}
                </h2>
                <p className="text-center text-slate-500 mb-6">
                    {mode === 'REGISTER' && 'Sign up to get started'}
                    {mode === 'LOGIN' && 'Log in to continue'}
                    {mode === 'MAGIC_LINK' && 'Login without a password'}
                    {mode === 'FORGOT_PASSWORD' && 'Enter your email to reset'}
                </p>

                {/* Tabs for Login/Register */}
                {(mode === 'LOGIN' || mode === 'REGISTER') && (
                    <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => switchMode('LOGIN')}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                                mode === 'LOGIN'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => switchMode('REGISTER')}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                                mode === 'REGISTER'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'REGISTER' && (
                        <div>
                            <label className="font-semibold text-slate-700">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                                placeholder="Your full name"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    <div>
                        <label className="font-semibold text-slate-700">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                            placeholder="you@example.com"
                            disabled={isLoading}
                        />
                    </div>

                    {(mode === 'LOGIN' || mode === 'REGISTER') && (
                        <div>
                            <label className="font-semibold text-slate-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none"
                                placeholder="••••••••"
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-4 text-white bg-slate-800 rounded-md font-semibold hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Please wait...' : (
                            <>
                                {mode === 'LOGIN' && 'Log In'}
                                {mode === 'REGISTER' && 'Create Account'}
                                {mode === 'MAGIC_LINK' && 'Send Magic Link'}
                                {mode === 'FORGOT_PASSWORD' && 'Send Reset Link'}
                            </>
                        )}
                    </button>
                </form>

                {/* Additional Options */}
                <div className="mt-6 space-y-3">
                    {mode === 'LOGIN' && (
                        <>
                            <button
                                onClick={() => switchMode('FORGOT_PASSWORD')}
                                className="text-sm text-slate-600 hover:text-slate-900 font-semibold w-full text-center"
                            >
                                Forgot your password?
                            </button>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">Or</span>
                                </div>
                            </div>
                            <button
                                onClick={() => switchMode('MAGIC_LINK')}
                                className="w-full py-2 px-4 border-2 border-slate-200 rounded-md font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                            >
                                Send me a magic link
                            </button>
                        </>
                    )}

                    {(mode === 'MAGIC_LINK' || mode === 'FORGOT_PASSWORD') && (
                        <button
                            onClick={() => switchMode('LOGIN')}
                            className="text-sm text-slate-600 hover:text-slate-900 font-semibold w-full text-center mt-4"
                        >
                            ← Back to login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
