import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { User, Request, UrgencyLevel, ModalType, FilterType, AuthAction, Toast, SortType } from './types';
import { URGENCY_OPTIONS } from './constants';
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
import SortControl from './components/SortControl';
import ProfileModal from './components/ProfileModal';
import { authService, userService, requestService, applicationService, transactionService, realtimeService } from './services/supabase.service';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [filter, setFilter] = useState<FilterType>('ALL');
    const [sortBy, setSortBy] = useState<SortType>('NEWEST');
    const [currentModal, setCurrentModal] = useState<ModalType>(null);
    const [authAction, setAuthAction] = useState<AuthAction>('REGISTER');

    const [activeRequest, setActiveRequest] = useState<Partial<Request> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [unlockedRequestIds, setUnlockedRequestIds] = useState<string[]>([]);
    const [pendingUnlockRequest, setPendingUnlockRequest] = useState<Request | null>(null);
    const [viewingRequest, setViewingRequest] = useState<Request | null>(null);

    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; } | null>(null);

    // --- Initialize Auth State and Load Data ---
    useEffect(() => {
        // Check for existing session
        const initializeAuth = async () => {
            try {
                const session = await authService.getSession();
                if (session?.user) {
                    // User is logged in, load their profile
                    const profile = await userService.getUserProfile(session.user.id);
                    if (profile) {
                        setUser(profile);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            }
        };

        initializeAuth();

        // Listen to auth changes (for persistent sessions)
        const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const profile = await userService.getUserProfile(session.user.id);
                if (profile) {
                    setUser(profile);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    // --- Load Requests from Supabase ---
    useEffect(() => {
        const loadRequests = async () => {
            try {
                setIsLoadingRequests(true);
                const allRequests = await requestService.getAllRequests();
                setRequests(allRequests);
            } catch (error) {
                console.error('Error loading requests:', error);
                showToast('Failed to load requests.', 'error');
            } finally {
                setIsLoadingRequests(false);
            }
        };

        loadRequests();

        // Subscribe to real-time updates
        const channel = realtimeService.subscribeToRequests(async (payload) => {
            console.log('Real-time update:', payload);
            // Reload requests when there's a change
            const allRequests = await requestService.getAllRequests();
            setRequests(allRequests);
        });

        return () => {
            realtimeService.unsubscribe(channel);
        };
    }, []);

    // --- Refresh user data when needed ---
    const refreshUser = async () => {
        if (!user) return;
        try {
            const updatedProfile = await userService.getUserProfile(user.id);
            if (updatedProfile) {
                setUser(updatedProfile);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

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
            await authService.signOut();
            setUser(null);
            setFilter('ALL');
            showToast('You have been logged out.');
        } catch (error) {
            console.error('Logout error:', error);
            showToast('Error logging out.', 'error');
        }
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
            if (!process.env.API_KEY) {
                throw new Error("API key is missing.");
            }
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
                    // Update existing request
                    await requestService.updateRequest(requestToPost.id!, {
                        title: requestToPost.title!,
                        description: requestToPost.description!,
                        category: requestToPost.category!,
                        budget: requestToPost.budget!,
                        urgency: requestToPost.urgency!,
                        whatsapp: requestToPost.whatsapp,
                        email: requestToPost.email,
                    });
                    showToast('Request updated successfully!', 'success');
                } else {
                    // Create new request
                    await requestService.createRequest({
                        userId: user.id,
                        title: requestToPost.title!,
                        description: requestToPost.description!,
                        category: requestToPost.category!,
                        budget: requestToPost.budget!,
                        urgency: requestToPost.urgency || UrgencyLevel.GENERAL,
                        rawInput: requestToPost.rawInput,
                        whatsapp: requestToPost.whatsapp,
                        email: requestToPost.email,
                    });
                    showToast('Request posted successfully!', 'success');
                }

                // Reload requests
                const allRequests = await requestService.getAllRequests();
                setRequests(allRequests);

                setCurrentModal(null);
                setActiveRequest(null);
            } catch (error) {
                console.error('Error posting request:', error);
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
                        // Deduct funds and create transaction
                        await transactionService.deductFunds(
                            user.id,
                            costToCharge,
                            `Post request with ${urgencyOption?.label} urgency`
                        );
                        // Refresh user to get updated balance
                        await refreshUser();
                        // Post the request
                        await performPost();
                    } catch (error) {
                        console.error('Payment error:', error);
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
                    await requestService.deleteRequest(requestId);
                    // Reload requests
                    const allRequests = await requestService.getAllRequests();
                    setRequests(allRequests);
                    showToast('Request deleted.', 'success');
                } catch (error) {
                    console.error('Error deleting request:', error);
                    showToast('Failed to delete request.', 'error');
                }
            }
        });
    };

    const handleReportRequest = (requestId: string) => {
        setConfirmation({
            title: 'Report Request',
            message: 'Are you sure you want to report this request for review?',
            onConfirm: () => {
                // TODO: Implement report functionality in backend
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
    const handleUpdateProfile = async (updatedDetails: Partial<User>) => {
        if (!user) return;

        try {
            await userService.updateUserProfile(user.id, {
                name: updatedDetails.name,
            });

            // Refresh user profile
            await refreshUser();

            // Reload requests to show updated user names
            const allRequests = await requestService.getAllRequests();
            setRequests(allRequests);

            setCurrentModal(null);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showToast('Failed to update profile.', 'error');
        }
    };

    const handleStartVerification = async () => {
        if (!user) return;

        try {
            await userService.startVerification(user.id);
            showToast('Verification process started. This will take a moment.', 'info');

            // Simulate verification process (in production, this would be manual review)
            setTimeout(async () => {
                try {
                    await userService.completeVerification(user.id);
                    await refreshUser();
                    showToast('Your identity has been successfully verified!', 'success');

                    // Reload requests to show updated verification status
                    const allRequests = await requestService.getAllRequests();
                    setRequests(allRequests);
                } catch (error) {
                    console.error('Error completing verification:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('Error starting verification:', error);
            showToast('Failed to start verification.', 'error');
        }
    };

    // --- Wallet and Payment Handlers ---
    const handleAddFunds = async (amount: number) => {
        if (!user) return;

        try {
            await transactionService.addFunds(user.id, amount, `WALLET_TOPUP_${Date.now()}`);
            await refreshUser();
            showToast(`Successfully added N${amount.toLocaleString()} to your wallet.`, 'success');
            setCurrentModal(null);
        } catch (error) {
            console.error('Error adding funds:', error);
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
                    await transactionService.deductFunds(
                        user.id,
                        cost,
                        `Unlock request: ${requestToUnlock.title}`
                    );
                    await refreshUser();
                    setUnlockedRequestIds(prev => [...new Set([...prev, requestToUnlock.id])]);
                    setViewingRequest(requestToUnlock);
                    showToast('Details unlocked!', 'success');
                } catch (error) {
                    console.error('Error unlocking request:', error);
                    showToast('Failed to unlock request.', 'error');
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

        try {
            // Check if already applied
            const hasApplied = await applicationService.hasUserApplied(requestId, user.id);

            if (hasApplied) {
                showToast("You have already applied to this request.", 'info');
                return;
            }

            // Apply to request
            await applicationService.applyToRequest(requestId, user.id);

            // Reload requests to show updated applicants
            const allRequests = await requestService.getAllRequests();
            setRequests(allRequests);

            showToast("Your application has been sent!", 'success');
        } catch (error) {
            console.error('Error applying to request:', error);
            showToast('Failed to apply to request.', 'error');
        }
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

                    {isLoadingRequests ? (
                        <div className="text-center py-12">
                            <p className="text-slate-600">Loading requests...</p>
                        </div>
                    ) : (
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
                    )}
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
