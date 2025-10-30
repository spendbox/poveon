import React from 'react';
import { Request, User } from '../types';
import LockIcon from './icons/LockIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface ViewRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: Request | null;
    isOwner: boolean;
    isUnlocked: boolean;
    onUnlock: () => void;
    currentUser: User | null;
}

const ViewRequestModal: React.FC<ViewRequestModalProps> = ({ isOpen, onClose, request, isOwner, isUnlocked, onUnlock, currentUser }) => {
    if (!isOpen || !request) return null;

    const canViewContact = isOwner || isUnlocked;
    const cost = Math.min(request.budget * 0.001, 250000);

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
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                    Posted by {request.userName}
                    {request.userVerification === 'VERIFIED' && <ShieldCheckIcon />}
                </p>

                <div className="mt-6">
                    <h3 className="font-semibold text-slate-800 mb-2">Full Description</h3>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
                </div>

                {request.category && (
                    <div className="mt-4">
                        <h3 className="font-semibold text-slate-800 mb-2">Category</h3>
                        <p className="text-slate-700">{request.category}</p>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-lg">
                    <span className="font-semibold text-slate-600">Budget:</span>
                    <span className="font-bold text-2xl text-slate-800">N{request.budget.toLocaleString()}</span>
                </div>

                {/* Contact Information Section */}
                <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        Contact Information
                        {!canViewContact && <LockIcon />}
                    </h3>
                    {canViewContact ? (
                        <div className="space-y-1 mt-2">
                            {request.whatsapp && <p className="text-slate-700"><strong>WhatsApp:</strong> <a href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{request.whatsapp}</a></p>}
                            {request.email && <p className="text-slate-700"><strong>Email:</strong> <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">{request.email}</a></p>}
                        </div>
                    ) : (
                        <div className="mt-3">
                            <p className="text-slate-600 text-sm mb-3">
                                Unlock contact details to reach out to the requester directly.
                            </p>
                            <button
                                onClick={() => {
                                    onClose();
                                    onUnlock();
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                            >
                                <LockIcon /> Unlock for N{cost.toFixed(2)}
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="mt-6 w-full px-4 py-3 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ViewRequestModal;