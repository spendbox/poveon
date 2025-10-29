import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Request, UrgencyLevel, ModalType, FilterType, AuthAction, Toast, SortType, VerificationStatus } from './types';
import { URGENCY_OPTIONS, MOCK_REQUESTS } from './constants';
import Header from './components/Header';
import RequestInput from './components/RequestInput';
import Filter from './components/Filter';
import RequestList from './components/RequestList';
import RequestModal from './components/RequestModal';
import AuthModal from './components/AuthModal';
import WalletModal from './components/WalletModal';
import ViewRequestModal from './components/ViewRequestModal';
import ConfirmationModal from './components/ConfirmationModal';
import ToastContainer from './components/ToastContainer';
import useLocalStorage from './hooks/useLocalStorage';
import SortControl from './components/SortControl';
import ProfileModal from './components/ProfileModal';

const App: React.FC = () => {
    const [user, setUser] = useLocalStorage<User | null>('poveon-user', null);
    const [requests, setRequests] = useLocalStorage<Request[]>('poveon-requests', MOCK_REQUESTS);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [sortBy, setSortBy] = useState<SortType>('NEWEST');
    const [currentModal, setCurrentModal] = useState<ModalType>(null);
    const [authAction, setAuthAction] = useState<AuthAction>('REGISTER');
    
    const [activeRequest, setActiveRequest] = useState<Partial<Request> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [unlockedRequestIds, setUnlockedRequestIds] = useLocalStorage<string[]>('poveon-unlocked-ids', []);
    const [pendingUnlockRequest, setPendingUnlockRequest] = useState<Request | null>(null);
    const [viewingRequest, setViewingRequest] = useState<Request | null>(null);
    
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

    // --- Toast and Confirmation Helpers ---
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 5000);
    };
    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // --- Auth Handlers ---
    const handleLogout = () => {
        setUser(null);
        setFilter('ALL'); // Reset filter on logout
        showToast('You have been logged out.');
    };

    const handleAuthSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        setCurrentModal(null);
        showToast(`Welcome, ${loggedInUser.name}!`, 'success');
        if (activeRequest) {
            setCurrentModal('REQUEST');
        }
        if (pendingUnlockRequest) {
            handleUnlockRequest(pendingUnlockRequest);
            setPendingUnlockRequest(null);
        }
    };
    
    // --- AI and Request Logic ---
    const generateRequestDetails = useCallback(async (prompt: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!process.env.API_KEY) { throw new Error("API key is missing."); }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analyze this user request and break it down into a title, a detailed description, a suitable category, and an estimated budget in Nigerian Naira (NGN). The user request is: "${prompt}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            category: { type: Type.STRING },
                            budget: { type: Type.NUMBER }
                        },
                        required: ["title", "description", "category", "budget"]
                    }
                }
            });
            const parsedResponse = JSON.parse(response.text);
            setActiveRequest({ ...parsedResponse, rawInput: prompt });
            setCurrentModal('REQUEST');
        } catch (err) {
            setError('Failed to process request with AI. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handlePostRequest = (requestToPost: Partial<Request>) => {
        if (!user) {
            setAuthAction('REGISTER');
            setCurrentModal('AUTH');
            return;
        }
        
        const urgencyOption = URGENCY_OPTIONS.find(opt => opt.level === requestToPost.urgency);
        const cost = urgencyOption ? urgencyOption.cost : 0;
        const isUpdate = !!requestToPost.id;
        let costToCharge = cost;

        if (isUpdate) {
            const originalRequest = requests.find(r => r.id === requestToPost.id);
            const originalCost = URGENCY_OPTIONS.find(opt => opt.level === originalRequest?.urgency)?.cost || 0;
            costToCharge = cost - originalCost;
        }
        
        const performPost = () => {
             if (isUpdate) {
                setRequests(prev => prev.map(r => r.id === requestToPost.id ? { ...r, ...requestToPost } as Request : r));
                showToast('Request updated successfully!', 'success');
            } else {
                const newRequest: Request = {
                    id: Date.now().toString(),
                    userId: user.id,
                    userName: user.name,
                    userVerification: user.verificationStatus,
                    createdAt: new Date().toISOString(),
                    applicants: [],
                    ...requestToPost,
                    urgency: requestToPost.urgency || UrgencyLevel.GENERAL,
                } as Request;
                setRequests(prev => [newRequest, ...prev]);
                showToast('Request posted successfully!', 'success');
            }
            setCurrentModal(null);
            setActiveRequest(null);
        };

        if (costToCharge > 0) {
            if (user.walletBalance < costToCharge) {
                showToast(`Insufficient funds. You need N${costToCharge.toLocaleString()}.`, 'error');
                openWallet();
                return;
            }
            setConfirmation({
                title: 'Confirm Payment',
                message: `This action will deduct N${costToCharge.toLocaleString()} from your wallet. Proceed?`,
                onConfirm: () => {
                    setUser(prevUser => prevUser ? { ...prevUser, walletBalance: prevUser.walletBalance - costToCharge } : null);
                    performPost();
                }
            });
        } else {
            performPost();
        }
    };
    
    const handleEditRequest = (request: Request) => {
        setActiveRequest(request);
        setCurrentModal('REQUEST');
    };

    const handleDeleteRequest = (requestId: string) => {
        setConfirmation({
            title: 'Delete Request',
            message: 'Are you sure you want to permanently delete this request?',
            onConfirm: () => {
                setRequests(prev => prev.filter(r => r.id !== requestId));
                showToast('Request deleted.', 'success');
            }
        });
    };

    const handleReportRequest = (requestId: string) => {
        setConfirmation({
            title: 'Report Request',
            message: 'Are you sure you want to report this request for review?',
            onConfirm: () => {
                showToast('Thank you for your report. We will review this post shortly.', 'success');
            }
        });
    };
    
    // --- Modal Openers ---
    const openLogin = () => { setAuthAction('LOGIN'); setCurrentModal('AUTH'); };
    const openRegister = () => { setAuthAction('REGISTER'); setCurrentModal('AUTH'); };
    const openWallet = () => setCurrentModal('WALLET');
    const openProfile = () => setCurrentModal('PROFILE');

    // --- Profile Management ---
    const handleUpdateProfile = (updatedDetails: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updatedDetails };
        setUser(updatedUser);

        setRequests(prevRequests => 
            prevRequests.map(req => {
                const newReq = req.userId === user.id ? { ...req, userName: updatedUser.name } : { ...req };
                const newApplicants = newReq.applicants.map(app => 
                    app.userId === user.id ? { ...app, userName: updatedUser.name } : app
                );
                return { ...newReq, applicants: newApplicants };
            })
        );
        setCurrentModal(null);
        showToast('Profile updated successfully!', 'success');
    };

    const handleStartVerification = () => {
        if (!user) return;
        setUser({ ...user, verificationStatus: 'PENDING' });
        showToast('Verification process started. This will take a moment.', 'info');

        setTimeout(() => {
            setUser(prevUser => {
                if (!prevUser) return null;
                const updatedUser = { ...prevUser, verificationStatus: 'VERIFIED' as VerificationStatus };
                
                // Update verification status on existing posts
                setRequests(prevReqs => prevReqs.map(req => 
                    req.userId === updatedUser.id ? { ...req, userVerification: 'VERIFIED' } : req
                ));

                showToast('Your identity has been successfully verified!', 'success');
                return updatedUser;
            });
        }, 3000);
    };


    // --- Wallet and Payment Handlers ---
    const handleAddFunds = (amount: number) => {
        if (user) {
            setUser({ ...user, walletBalance: user.walletBalance + amount });
            showToast(`Successfully added N${amount.toLocaleString()} to your wallet.`, 'success');
            setCurrentModal(null);
        }
    };

    const handleUnlockRequest = (requestToUnlock: Request) => {
        if (!user) {
            setPendingUnlockRequest(requestToUnlock);
            openLogin();
            return;
        }

        const cost = Math.min(requestToUnlock.budget * 0.001, 250000);
        
        if (user.walletBalance < cost) {
            showToast(`You need N${cost.toFixed(2)} to view this. Please add funds.`, 'error');
            openWallet();
            return;
        }
        
        setConfirmation({
            title: 'Unlock Details',
            message: `This will deduct N${cost.toFixed(2)} from your wallet. Proceed?`,
            onConfirm: () => {
                setUser({ ...user, walletBalance: user.walletBalance - cost });
                setUnlockedRequestIds(prev => [...new Set([...prev, requestToUnlock.id])]);
                setViewingRequest(requestToUnlock);
                showToast('Details unlocked!', 'success');
            }
        });
    };

    const handleViewDetails = (request: Request) => {
        setViewingRequest(request);
    };

    const handleApplyToRequest = (requestId: string) => {
        if (!user) {
            showToast('Please log in to apply for a request.', 'info');
            openLogin();
            return;
        }
        
        setRequests(prevRequests => {
            const newRequests = [...prevRequests];
            const requestIndex = newRequests.findIndex(r => r.id === requestId);
            if (requestIndex === -1) return prevRequests;

            const request = newRequests[requestIndex];
            const hasApplied = request.applicants.some(app => app.userId === user.id);

            if (hasApplied) {
                showToast("You have already applied to this request.", 'info');
                return prevRequests;
            }

            const newApplicant = {
                userId: user.id,
                userName: user.name,
                appliedAt: new Date().toISOString()
            };

            newRequests[requestIndex] = {
                ...request,
                applicants: [...request.applicants, newApplicant]
            };
            
            showToast("Your application has been sent!", 'success');
            return newRequests;
        });
    };


    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header 
                user={user} 
                onLogout={handleLogout} 
                onLogin={openLogin} 
                onRegister={openRegister} 
                onOpenWallet={openWallet} 
                onOpenProfile={openProfile}
                currentFilter={filter}
                setFilter={setFilter}
            />
            <main className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Have a need? Get it done.</h1>
                    <p className="mt-4 text-lg text-slate-600">
                        Just type what you need below. Our AI will handle the details.
                    </p>
                </div>

                <RequestInput onPost={generateRequestDetails} isLoading={isLoading} />
                {error && <p className="text-center text-red-500 mt-4">{error}</p>}

                <div className="mt-16">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-slate-900">Recent Requests</h2>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <SortControl sortBy={sortBy} setSortBy={setSortBy} />
                            <Filter currentFilter={filter} setFilter={setFilter} />
                        </div>
                    </div>
                    <RequestList 
                        requests={requests} 
                        filter={filter} 
                        sortBy={sortBy}
                        currentUser={user}
                        unlockedRequestIds={unlockedRequestIds}
                        onEdit={handleEditRequest}
                        onDelete={handleDeleteRequest}
                        onUnlock={handleUnlockRequest}
                        onViewDetails={handleViewDetails}
                        onApply={handleApplyToRequest}
                        onReport={handleReportRequest}
                    />
                </div>
            </main>

            {currentModal === 'REQUEST' && activeRequest && (
                <RequestModal
                    isOpen={true}
                    onClose={() => { setCurrentModal(null); setActiveRequest(null); }}
                    requestData={activeRequest}
                    onSave={handlePostRequest}
                    urgencyOptions={URGENCY_OPTIONS}
                />
            )}
            
            {currentModal === 'AUTH' && (
                <AuthModal
                    isOpen={true}
                    onClose={() => setCurrentModal(null)}
                    onAuthSuccess={handleAuthSuccess}
                    initialAction={authAction}
                />
            )}

            {currentModal === 'WALLET' && user && (
                <WalletModal 
                    isOpen={true}
                    onClose={() => setCurrentModal(null)}
                    onAddFunds={handleAddFunds}
                    currentUser={user}
                />
            )}

             {currentModal === 'PROFILE' && user && (
                <ProfileModal 
                    isOpen={true}
                    onClose={() => setCurrentModal(null)}
                    onSave={handleUpdateProfile}
                    currentUser={user}
                    onStartVerification={handleStartVerification}
                />
            )}

            <ViewRequestModal 
                isOpen={!!viewingRequest}
                onClose={() => setViewingRequest(null)}
                request={viewingRequest}
            />

            <ConfirmationModal 
                isOpen={!!confirmation}
                onClose={() => setConfirmation(null)}
                title={confirmation?.title || ''}
                message={confirmation?.message || ''}
                onConfirm={() => {
                    confirmation?.onConfirm();
                    setConfirmation(null);
                }}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};

export default App;