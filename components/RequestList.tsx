import React, { useMemo } from 'react';
import { Request, FilterType, User, SortType } from '../types';
import RequestCard from './RequestCard';

interface RequestListProps {
    requests: Request[];
    filter: FilterType;
    sortBy: SortType;
    currentUser: User | null;
    unlockedRequestIds: string[];
    onEdit: (request: Request) => void;
    onDelete: (requestId: string) => void;
    onUnlock: (request: Request) => void;
    onViewDetails: (request: Request) => void;
    onApply: (requestId: string) => void;
    onReport: (requestId: string) => void;
}

const RequestList: React.FC<RequestListProps> = ({ requests, filter, sortBy, currentUser, unlockedRequestIds, onEdit, onDelete, onUnlock, onViewDetails, onApply, onReport }) => {

    const processedRequests = useMemo(() => {
        let filtered: Request[] = [];

        // 1. Filtering
        if (filter === 'MY_REQUESTS') {
            filtered = currentUser ? requests.filter(r => r.userId === currentUser.id) : [];
        } else if (filter === 'MY_APPLICATIONS') {
            filtered = currentUser ? requests.filter(r => r.applicants.some(app => app.userId === currentUser.id)) : [];
        } else if (filter === 'ALL') {
            filtered = requests;
        } else {
            filtered = requests.filter(request => request.urgency === filter);
        }

        // 2. Sorting
        const sorted = [...filtered];
        switch (sortBy) {
            case 'BUDGET_HIGH':
                sorted.sort((a, b) => b.budget - a.budget);
                break;
            case 'BUDGET_LOW':
                sorted.sort((a, b) => a.budget - b.budget);
                break;
            case 'APPLICANTS_HIGH':
                sorted.sort((a, b) => b.applicants.length - a.applicants.length);
                break;
            case 'APPLICANTS_LOW':
                sorted.sort((a, b) => a.applicants.length - b.applicants.length);
                break;
            case 'NEWEST':
            default:
                sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
        }

        return sorted;
    }, [requests, filter, sortBy, currentUser]);

    return (
        <div className="space-y-4">
            {processedRequests.length > 0 ? (
                processedRequests.map(request => {
                    const isUnlocked = unlockedRequestIds.includes(request.id);
                    return (
                        <RequestCard
                            key={request.id}
                            request={request}
                            isOwner={currentUser?.id === request.userId}
                            isUnlocked={isUnlocked}
                            currentUser={currentUser}
                            onEdit={() => onEdit(request)}
                            onDelete={() => onDelete(request.id)}
                            onViewDetails={() => onViewDetails(request)}
                            onUnlock={() => onUnlock(request)}
                            onApply={() => onApply(request.id)}
                            onReport={() => onReport(request.id)}
                        />
                    );
                })
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-700">No requests found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your filters or post a new request!</p>
                </div>
            )}
        </div>
    );
};

export default RequestList;
