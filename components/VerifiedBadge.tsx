import React from 'react';
import { VerificationStatus } from '../types';

interface VerifiedBadgeProps {
    status: VerificationStatus;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ status, size = 'sm', showLabel = false }) => {
    if (status !== 'VERIFIED') {
        return null;
    }

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const iconSize = sizeClasses[size];

    return (
        <span className="inline-flex items-center gap-1" title="Verified User">
            <svg
                className={`${iconSize} text-blue-500 flex-shrink-0`}
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                />
            </svg>
            {showLabel && (
                <span className="text-xs font-medium text-blue-600">Verified</span>
            )}
        </span>
    );
};

export default VerifiedBadge;
