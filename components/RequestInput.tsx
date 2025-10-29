
import React, { useState } from 'react';
import SparklesIcon from './icons/SparklesIcon';

interface RequestInputProps {
    onPost: (prompt: string) => void;
    isLoading: boolean;
}

const RequestInput: React.FC<RequestInputProps> = ({ onPost, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onPost(prompt);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8">
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., I need a modern logo for my new coffee shop"
                    className="w-full pl-4 pr-32 py-4 text-lg border-2 border-slate-300 rounded-full focus:ring-2 focus:ring-slate-800 focus:border-slate-800 outline-none transition-shadow"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-2 px-6 py-3 text-white bg-slate-800 rounded-full font-semibold hover:bg-slate-900 transition-colors disabled:bg-slate-400"
                    disabled={isLoading || !prompt.trim()}
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Analysing...</span>
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            <span>Post</span>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default RequestInput;
