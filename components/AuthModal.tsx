import React, { useState } from 'react';
import { User, AuthAction, VerificationStatus } from '../types';

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

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (action === 'REGISTER' && !name) {
            setError('Name is required for registration.');
            return;
        }

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }

        // Mock authentication logic
        const mockUser: User = {
            id: `user-${Date.now()}`,
            name: action === 'REGISTER' ? name : 'Mock User',
            email: email,
            password: password,
            walletBalance: action === 'REGISTER' ? 1000 : 5000,
            verificationStatus: 'NOT_VERIFIED',
            joinedDate: new Date().toISOString(),
        };

        onAuthSuccess(mockUser);
    };

    const toggleAction = () => {
        setAction(prev => prev === 'LOGIN' ? 'REGISTER' : 'LOGIN');
        setError('');
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

                    <button type="submit" className="w-full py-3 mt-4 text-white bg-slate-800 rounded-md font-semibold hover:bg-slate-900 transition-colors">
                        {action === 'LOGIN' ? 'Log In' : 'Register'}
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
