import React, { useState } from 'react';
import { User } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedDetails: Partial<User>) => void;
    currentUser: User;
    onStartVerification: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onSave, currentUser, onStartVerification }) => {
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim() || !email.trim()) {
            setError('Name and email cannot be empty.');
            return;
        }
        setError('');
        onSave({ name, email });
    };

    const getVerificationContent = () => {
        switch (currentUser.verificationStatus) {
            case 'VERIFIED':
                return (
                    <div className="flex items-center gap-2 text-green-600">
                        <ShieldCheckIcon />
                        <span className="font-semibold">Identity Verified</span>
                    </div>
                );
            case 'PENDING':
                return (
                     <button className="w-full py-2.5 mt-2 text-white bg-yellow-500 rounded-md font-semibold cursor-wait" disabled>
                        Verification in Progress...
                    </button>
                );
            case 'NOT_VERIFIED':
            default:
                return (
                    <button onClick={onStartVerification} className="w-full py-2.5 mt-2 text-white bg-blue-600 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                        Start Verification
                    </button>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">
                    Manage Profile
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-slate-700">Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full mt-1 p-2 border border-slate-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full mt-1 p-2 border border-slate-300 rounded-md"
                        />
                    </div>
                     <div>
                        <label className="font-semibold text-slate-700">Password</label>
                        <p className="text-sm text-slate-500 mt-1">Password changes are not available in this demo.</p>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <label className="font-semibold text-slate-700">Identity Verification (Optional)</label>
                    <p className="text-sm text-slate-500 mt-1 mb-2">Get a verified badge on your profile to build trust with others.</p>
                    {getVerificationContent()}
                </div>

                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
