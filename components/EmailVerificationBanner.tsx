import React, { useState } from 'react';
import { User } from '../types';
import { authService } from '../services/supabase.service';

interface EmailVerificationBannerProps {
    user: User;
    onDismiss?: () => void;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ user, onDismiss }) => {
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState('');

    const handleResendVerification = async () => {
        setIsResending(true);
        setMessage('');

        try {
            // Supabase doesn't have a direct "resend" method, so we'd need to implement this
            // For now, show a helpful message
            setMessage('Please check your email inbox for the verification link we sent when you registered.');
            setTimeout(() => setMessage(''), 5000);
        } catch (error) {
            console.error('Error resending verification:', error);
            setMessage('Failed to resend. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-900">
                                Verify your email address
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Check your inbox and click the verification link to unlock all features and build trust with other users.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="text-xs font-semibold text-amber-900 hover:text-amber-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isResending ? 'Sending...' : 'Resend Email'}
                        </button>
                        {onDismiss && (
                            <button
                                onClick={onDismiss}
                                className="text-amber-600 hover:text-amber-800 transition-colors"
                                aria-label="Dismiss"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {message && (
                    <p className="text-xs text-amber-700 mt-2">{message}</p>
                )}
            </div>
        </div>
    );
};

export default EmailVerificationBanner;
