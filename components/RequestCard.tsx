import React from 'react';
import { Request, User } from '../types';
import { URGENCY_OPTIONS } from '../constants';
import PencilIcon from './icons/PencilIcon';
import TrashIcon from './icons/TrashIcon';
import LockIcon from './icons/LockIcon';
import UsersIcon from './icons/UsersIcon';
import FlagIcon from './icons/FlagIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface RequestCardProps {
    request: Request;
    isOwner: boolean;
    isUnlocked: boolean;
    currentUser: User | null;
    onEdit: () => void;
    onDelete: () => void;
    onViewDetails: () => void;
    onUnlock: () => void;
    onApply: () => void;
    onReport: () => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, isOwner, isUnlocked, currentUser, onEdit, onDelete, onViewDetails, onUnlock, onApply, onReport }) => {
    const urgencyInfo = URGENCY_OPTIONS.find(opt => opt.level === request.urgency);
    const timeAgo = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysAgo = Math.round((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    const hasApplied = currentUser ? request.applicants.some(app => app.userId === currentUser.id) : false;

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${urgencyInfo?.color}`}>
                            {urgencyInfo?.label}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900">{request.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                            {request.userName}
                            {request.userVerification === 'VERIFIED' && <ShieldCheckIcon />}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{daysAgo > 0 ? timeAgo.format(-daysAgo, 'day') : 'Today'}</span>
                         <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                            <UsersIcon />
                            {request.applicants.length}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 mt-2 line-clamp-2">{request.description}</p>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1 md:min-w-[140px]">
                     <div className="text-xl font-bold text-slate-800">
                        N{request.budget.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-500">Budget</p>
                </div>
            </div>

            {isOwner && request.applicants.length > 0 && (
                 <div className="mt-3 pt-3 border-t border-slate-200">
                     <h4 className="font-semibold text-xs text-slate-600 mb-1.5">Applicants:</h4>
                     <div className="flex flex-wrap items-center gap-2 text-slate-800">
                        {request.applicants.map(applicant => (
                            <span key={applicant.userId} className="bg-slate-100 px-2 py-0.5 rounded text-xs">{applicant.userName}</span>
                        ))}
                     </div>
                 </div>
            )}

            {(isOwner || isUnlocked) && (request.whatsapp || request.email) && (
                 <div className="mt-3 pt-3 border-t border-slate-200">
                     <h4 className="font-semibold text-xs text-slate-600 mb-1.5">Contact:</h4>
                     <div className="flex flex-wrap items-center gap-3 text-xs text-slate-800">
                        {request.whatsapp && <span><strong>WhatsApp:</strong> <a href={`https://wa.me/${request.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{request.whatsapp}</a></span>}
                        {request.email && <span><strong>Email:</strong> <a href={`mailto:${request.email}`} className="text-blue-600 hover:underline">{request.email}</a></span>}
                     </div>
                 </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center gap-2">
                <div>
                   {!isOwner && (
                     <button onClick={onReport} title="Report post" className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded transition-colors">
                        <FlagIcon />
                     </button>
                   )}
                </div>
                <div className="flex items-center gap-2">
                    {isOwner ? (
                        <>
                            <button onClick={onEdit} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                               <PencilIcon /> Edit
                            </button>
                            <button onClick={onDelete} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors">
                               <TrashIcon /> Delete
                            </button>
                        </>
                    ) : (
                        <>
                        <button onClick={onViewDetails} className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                            View Details
                        </button>
                        {isUnlocked ? (
                            <button
                                onClick={onApply}
                                disabled={hasApplied}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            >
                                {hasApplied ? 'Applied' : 'Apply Now'}
                            </button>
                        ) : (
                            <button onClick={onUnlock} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded transition-colors">
                                <LockIcon /> Unlock Contact
                            </button>
                        )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RequestCard;
