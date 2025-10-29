import React, { useState } from 'react';
import { User, AuthAction, VerificationStatus } from '../types';
import { authService, userService } from '../services/supabase.service';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
    initialAction: AuthAction;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialAction }) => {
    const [action, setAction] = useState<AuthAction>(initialAction);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (action === 'REGISTER') {
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
                await authService.signUp(email, password, name);

                setSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');
                setIsLoading(false);

                // Clear form
                setName('');
                setEmail('');
                setPassword('');

                // Switch to login after 3 seconds
                setTimeout(() => {
                    setAction('LOGIN');
                    setSuccessMessage('');
                }, 3000);

            } else {
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

                // Check if email is verified
                if (!authUser.email_confirmed_at) {
                    setError('Please verify your email before logging in. Check your inbox for the verification link.');
                    await authService.signOut();
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
            }
        } catch (err: any) {
            console.error('Auth error:', err);

            // Handle specific Supabase error messages
            if (err.message?.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message?.includes('already registered')) {
                setError('This email is already registered. Please log in instead.');
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Please verify your email before logging in.');
            } else {
                setError(err.message || 'An error occurred. Please try again.');
            }

            setIsLoading(false);
        }
    };

    const toggleAction = () => {
        setAction(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN');
        setError('');
        setSuccessMessage('');
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
                    {action === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-center text-slate-500 mb-6">
                    {action === 'LOGIN' ? 'Log in to continue.' : 'Sign up to post your first request.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {action === 'REGISTER' && (
                         <div>
                            <label className="font-semibold text-slate-700">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                        </div>
                    )}
                    <div>
                        <label className="font-semibold text-slate-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm">{successMessage}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 mt-4 text-white bg-slate-800 rounded-md font-semibold hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Please wait...' : (action === 'LOGIN' ? 'Log In' : 'Register')}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    {action === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={toggleAction} className="font-semibold text-slate-800 hover:underline ml-1">
                        {action === 'LOGIN' ? 'Sign Up' : 'Log In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
