import React from 'react';
import { Request } from '../types';
import VerifiedBadge from './VerifiedBadge';

interface ViewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: Request | null;
}

const ViewRequestModal: React.FC<ViewRequestModalProps> = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900">{request.title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                </div>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                    Posted by <span className="font-medium text-slate-700">{request.userName}</span>
                    <VerifiedBadge status={request.userVerification} size="sm" />
                </p>
                
                <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                     <h3 className="font-semibold text-slate-800">Contact Information</h3>
                     <div className="space-y-1 mt-2">
                        {request.whatsapp && <p className="text-slate-700"><strong>WhatsApp:</strong> <a href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{request.whatsapp}</a></p>}
                        {request.email && <p className="text-slate-700"><strong>Email:</strong> <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">{request.email}</a></p>}
                     </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-2">Full Description</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-lg">
                    <span className="font-semibold text-slate-600">Budget:</span>
                    <span className="font-bold text-2xl text-slate-800">N{request.budget.toLocaleString()}</span>
                </div>
                 <button 
                    onClick={onClose}
                    className="mt-8 w-full px-4 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ViewRequestModal;