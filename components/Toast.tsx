import React from 'react';
import { Toast as ToastType } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: number) => void;
}

const ICONS = {
    success: <CheckCircleIcon />,
    error: <XCircleIcon />,
    info: <InformationCircleIcon />,
};

const BG_COLORS = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-slate-800',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    return (
        <div className={`flex items-center justify-between gap-4 p-4 rounded-lg shadow-lg text-white ${BG_COLORS[toast.type]} animate-fade-in-right`}>
            <div className="flex items-center gap-2">
                {ICONS[toast.type]}
                <span>{toast.message}</span>
            </div>
            <button onClick={() => onRemove(toast.id)} className="text-white/80 hover:text-white">&times;</button>
            <style>{`
                @keyframes fade-in-right {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-right { animation: fade-in-right 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Toast;
