import React, { useState, useEffect } from 'react';
import { User, FilterType } from '../types';
import UserCircleIcon from './icons/UserCircleIcon';
import HamburgerIcon from './icons/HamburgerIcon';
import XIcon from './icons/XIcon';
import VerifiedBadge from './VerifiedBadge';

interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onLogin: () => void;
    onRegister: () => void;
    onOpenWallet: () => void;
    onOpenProfile: () => void;
    currentFilter: FilterType;
    setFilter: (filter: FilterType) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onLogin, onRegister, onOpenWallet, onOpenProfile, currentFilter, setFilter }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        // Prevent body scroll when mobile menu is open
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    }, [isMenuOpen]);

    const handleMobileLinkClick = (filter: FilterType) => {
        setFilter(filter);
        setIsMenuOpen(false);
    };

    const handleMobileActionClick = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    }
    
    const NavLink: React.FC<{ children: React.ReactNode; filter: FilterType }> = ({ children, filter }) => {
        const isActive = currentFilter === filter;
        return (
            <button
                onClick={() => setFilter(filter)}
                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive ? 'text-slate-900 bg-slate-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                {children}
            </button>
        );
    };
    
    return (
        <>
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div
                            className="text-2xl font-bold text-slate-900 cursor-pointer"
                            onClick={() => setFilter('ALL')}
                        >
                            Poveon
                        </div>
                        
                        {/* --- Desktop Navigation --- */}
                        <nav className="hidden md:flex items-center gap-2">
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2">
                                        <NavLink filter="MY_REQUESTS">My Requests</NavLink>
                                        <NavLink filter="MY_APPLICATIONS">My Applications</NavLink>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <div className="text-right">
                                            <div className="text-sm text-slate-600 flex items-center gap-1.5 justify-end">
                                                Welcome, {user.name}
                                                <VerifiedBadge status={user.verificationStatus} size="sm" />
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Wallet: <span className="font-semibold text-slate-700">N{user.walletBalance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onOpenWallet}
                                            className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                                        >
                                            Add Funds
                                        </button>
                                        <button
                                            onClick={onOpenProfile}
                                            title="Profile"
                                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                        >
                                            <UserCircleIcon />
                                            <span>Profile</span>
                                        </button>
                                        <button
                                            onClick={onLogout}
                                            className="px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onLogin}
                                        className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={onRegister}
                                        className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md transition-colors"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            )}
                        </nav>

                        {/* --- Mobile Hamburger Button --- */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                                {isMenuOpen ? <XIcon /> : <HamburgerIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Mobile Menu --- */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4 animate-slide-in">
                    <nav className="flex flex-col gap-4 text-lg">
                        {user ? (
                            <>
                                <div className="p-4 mb-4 border-b border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">{user.name}</h3>
                                        <VerifiedBadge status={user.verificationStatus} size="sm" />
                                    </div>
                                    <p className="text-sm text-slate-500">Wallet: N{user.walletBalance.toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleMobileLinkClick('MY_REQUESTS')} className="text-left p-3 rounded-md hover:bg-slate-100">My Requests</button>
                                <button onClick={() => handleMobileLinkClick('MY_APPLICATIONS')} className="text-left p-3 rounded-md hover:bg-slate-100">My Applications</button>
                                <button onClick={() => handleMobileActionClick(onOpenProfile)} className="text-left p-3 rounded-md hover:bg-slate-100">Profile</button>
                                <button onClick={() => handleMobileActionClick(onOpenWallet)} className="w-full text-center p-3 rounded-md bg-slate-100 hover:bg-slate-200 font-semibold">Add Funds</button>
                                <button onClick={() => handleMobileActionClick(onLogout)} className="w-full text-center p-3 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-semibold mt-8">Logout</button>
                            </>
                        ) : (
                             <>
                                <button onClick={() => handleMobileActionClick(onLogin)} className="text-left p-3 rounded-md hover:bg-slate-100">Log In</button>
                                <button onClick={() => handleMobileActionClick(onRegister)} className="w-full text-center p-3 rounded-md bg-slate-800 text-white hover:bg-slate-900 font-semibold">Sign Up</button>
                            </>
                        )}
                    </nav>
                </div>
            )}
             <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.2s ease-out forwards; }
            `}</style>
        </>
    );
};

export default Header;