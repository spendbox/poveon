import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Request, UrgencyLevel, ModalType, FilterType, AuthAction, Toast, SortType, VerificationStatus } from './types';
import { URGENCY_OPTIONS } from './constants';
import Header from './components/Header';
import RequestInput from './components/RequestInput';
import Filter from './components/Filter';
import SearchBar from './components/SearchBar';
import RequestList from './components/RequestList';
import RequestModal from './components/RequestModal';
import AuthModal from './components/AuthModal';
import WalletModal from './components/WalletModal';
import ViewRequestModal from './components/ViewRequestModal';
import ConfirmationModal from './components/ConfirmationModal';
import ToastContainer from './components/ToastContainer';
import SortControl from './components/SortControl';
import ProfilePage from './components/ProfilePage';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import {
    getAllRequests,
    createRequest as dbCreateRequest,
    updateRequest as dbUpdateRequest,
    deleteRequest as dbDeleteRequest,
    applyToRequest as dbApplyToRequest,
    unlockRequest as dbUnlockRequest,
    getUnlockedRequests,
    updateUserProfile,
    updateWalletBalance,
} from './lib/database';

const App: React.FC = () => {
    const { user, loading: authLoading, signUp, signIn, signOut, updatePassword, setUser } = useSupabaseAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [sortBy, setSortBy] = useState<SortType>('NEWEST');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home');
    const [currentModal, setCurrentModal] = useState<ModalType>(null);
    const [authAction, setAuthAction] = useState<AuthAction>('REGISTER');

    const [activeRequest, setActiveRequest] = useState<Partial<Request> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [unlockedRequestIds, setUnlockedRequestIds] = useState<string[]>([]);
    const [pendingUnlockRequest, setPendingUnlockRequest] = useState<Request | null>(null);
    const [viewingRequest, setViewingRequest] = useState<Request | null>(null);

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

    // Load requests and unlocked IDs from Supabase
    useEffect(() => {
        const loadData = async () => {
            try {
                const [allRequests, unlockedIds] = await Promise.all([
                    getAllRequests(),
                    user ? getUnlockedRequests(user.id) : Promise.resolve([])
                ]);
                setRequests(allRequests);
                setUnlockedRequestIds(unlockedIds);
            } catch (err) {
                console.error('Error loading data:', err);
                showToast('Failed to load requests. Please refresh the page.', 'error');
            } finally {
                setRequestsLoading(false);
            }
        };

        if (!authLoading) {
            loadData();
        }
    }, [authLoading, user]);

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
    const handleLogout = async () => {
        try {
            await signOut();
            setFilter('ALL');
            showToast('You have been logged out.');
        } catch (err) {
            console.error('Error logging out:', err);
            showToast('Failed to log out. Please try again.', 'error');
        }
    };

    const handleAuthSuccess = () => {
        setCurrentModal(null);
        if (user) {
            showToast(`Welcome, ${user.name}!`, 'success');
        }
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

    const handlePostRequest = async (requestToPost: Partial<Request>) => {
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

        const performPost = async () => {
            try {
                if (isUpdate) {
                    await dbUpdateRequest(requestToPost.id!, requestToPost);
                    setRequests(prev => prev.map(r => r.id === requestToPost.id ? { ...r, ...requestToPost } as Request : r));
                    showToast('Request updated successfully!', 'success');
                } else {
                    const newRequest = await dbCreateRequest(user.id, {
                        ...requestToPost,
                        urgency: requestToPost.urgency || UrgencyLevel.GENERAL,
                    });
                    setRequests(prev => [newRequest, ...prev]);
                    showToast('Request posted successfully!', 'success');
                }
                setCurrentModal(null);
                setActiveRequest(null);
            } catch (err) {
                console.error('Error posting request:', err);
                showToast('Failed to post request. Please try again.', 'error');
            }
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
                onConfirm: async () => {
                    try {
                        const newBalance = user.walletBalance - costToCharge;
                        await updateWalletBalance(user.id, newBalance);
                        setUser({ ...user, walletBalance: newBalance });
                        await performPost();
                    } catch (err) {
                        console.error('Error updating wallet:', err);
                        showToast('Payment failed. Please try again.', 'error');
                    }
                }
            });
        } else {
            await performPost();
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
            onConfirm: async () => {
                try {
                    await dbDeleteRequest(requestId);
                    setRequests(prev => prev.filter(r => r.id !== requestId));
                    showToast('Request deleted.', 'success');
                } catch (err) {
                    console.error('Error deleting request:', err);
                    showToast('Failed to delete request. Please try again.', 'error');
                }
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
    const openProfile = () => setCurrentPage('profile');

    // --- Profile Management ---
    const handleUpdateProfile = async (updatedDetails: Partial<User>) => {
        if (!user) return;
        try {
            await updateUserProfile(user.id, updatedDetails);
            const updatedUser = { ...user, ...updatedDetails };
            setUser(updatedUser);

            // Update requests with new user info
            setRequests(prevRequests =>
                prevRequests.map(req => {
                    const newReq = req.userId === user.id ? { ...req, userName: updatedUser.name } : { ...req };
                    const newApplicants = newReq.applicants.map(app =>
                        app.userId === user.id ? { ...app, userName: updatedUser.name } : app
                    );
                    return { ...newReq, applicants: newApplicants };
                })
            );
            showToast('Profile updated successfully!', 'success');
        } catch (err) {
            console.error('Error updating profile:', err);
            showToast('Failed to update profile. Please try again.', 'error');
        }
    };

    const handleStartVerification = async () => {
        if (!user) return;
        setUser({ ...user, verificationStatus: 'PENDING' });
        showToast('Verification process started. This will take a moment.', 'info');

        setTimeout(async () => {
            try {
                await updateUserProfile(user.id, { verificationStatus: 'VERIFIED' });
                const updatedUser = { ...user, verificationStatus: 'VERIFIED' as VerificationStatus };
                setUser(updatedUser);

                // Update verification status on existing posts
                setRequests(prevReqs => prevReqs.map(req =>
                    req.userId === updatedUser.id ? { ...req, userVerification: 'VERIFIED' } : req
                ));

                showToast('Your identity has been successfully verified!', 'success');
            } catch (err) {
                console.error('Error updating verification:', err);
                showToast('Verification failed. Please try again.', 'error');
            }
        }, 3000);
    };


    // --- Wallet and Payment Handlers ---
    const handleAddFunds = async (amount: number) => {
        if (!user) return;
        try {
            const newBalance = user.walletBalance + amount;
            await updateWalletBalance(user.id, newBalance);
            setUser({ ...user, walletBalance: newBalance });
            showToast(`Successfully added N${amount.toLocaleString()} to your wallet.`, 'success');
            setCurrentModal(null);
        } catch (err) {
            console.error('Error adding funds:', err);
            showToast('Failed to add funds. Please try again.', 'error');
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
            onConfirm: async () => {
                try {
                    const newBalance = user.walletBalance - cost;
                    await updateWalletBalance(user.id, newBalance);
                    await dbUnlockRequest(user.id, requestToUnlock.id);
                    setUser({ ...user, walletBalance: newBalance });
                    setUnlockedRequestIds(prev => [...new Set([...prev, requestToUnlock.id])]);
                    setViewingRequest(requestToUnlock);
                    showToast('Details unlocked!', 'success');
                } catch (err) {
                    console.error('Error unlocking request:', err);
                    showToast('Failed to unlock request. Please try again.', 'error');
                }
            }
        });
    };

    const handleViewDetails = (request: Request) => {
        setViewingRequest(request);
    };

    const handleApplyToRequest = async (requestId: string) => {
        if (!user) {
            showToast('Please log in to apply for a request.', 'info');
            openLogin();
            return;
        }

        const request = requests.find(r => r.id === requestId);
        if (!request) return;

        const hasApplied = request.applicants.some(app => app.userId === user.id);
        if (hasApplied) {
            showToast("You have already applied to this request.", 'info');
            return;
        }

        try {
            await dbApplyToRequest(user.id, requestId);

            const newApplicant = {
                userId: user.id,
                userName: user.name,
                appliedAt: new Date().toISOString()
            };

            setRequests(prevRequests =>
                prevRequests.map(r =>
                    r.id === requestId
                        ? { ...r, applicants: [...r.applicants, newApplicant] }
                        : r
                )
            );

            showToast("Your application has been sent!", 'success');
        } catch (err) {
            console.error('Error applying to request:', err);
            showToast('Failed to apply. Please try again.', 'error');
        }
    };


    // Show loading state while auth is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show profile page if on profile route
    if (currentPage === 'profile' && user) {
        return (
            <ProfilePage
                user={user}
                requests={requests}
                onUpdateProfile={handleUpdateProfile}
                onUpdatePassword={updatePassword}
                onStartVerification={handleStartVerification}
                onBack={() => setCurrentPage('home')}
            />
        );
    }

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
                    <div className="mb-6">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search by title, description, category, or user..."
                        />
                    </div>
                    <RequestList
                        requests={requests}
                        filter={filter}
                        sortBy={sortBy}
                        searchQuery={searchQuery}
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
                    signUp={signUp}
                    signIn={signIn}
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

            <ViewRequestModal
                isOpen={!!viewingRequest}
                onClose={() => setViewingRequest(null)}
                request={viewingRequest}
                isOwner={viewingRequest ? user?.id === viewingRequest.userId : false}
                isUnlocked={viewingRequest ? unlockedRequestIds.includes(viewingRequest.id) : false}
                onUnlock={() => viewingRequest && handleUnlockRequest(viewingRequest)}
                currentUser={user}
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