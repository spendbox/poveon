import React, { useState } from 'react';
import { User, Request } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import UserCircleIcon from './icons/UserCircleIcon';

interface ProfilePageProps {
    user: User;
    requests: Request[];
    onUpdateProfile: (updatedUser: Partial<User>) => void;
    onStartVerification: () => void;
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, requests, onUpdateProfile, onStartVerification, onBack }) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'activity'>('profile');

    // Profile form state
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [phone, setPhone] = useState(user.phone || '');
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const myRequests = requests.filter(r => r.userId === user.id);
    const myApplications = requests.filter(r => r.applicants.some(app => app.userId === user.id));

    const handleSaveProfile = () => {
        if (!name.trim() || !email.trim()) {
            setError('Name and email are required.');
            return;
        }
        setError('');
        onUpdateProfile({ name, email, phone, bio, location });
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleChangePassword = () => {
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All password fields are required.');
            return;
        }

        if (currentPassword !== user.password) {
            setError('Current password is incorrect.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        onUpdateProfile({ password: newPassword });
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
    };

    const getVerificationBadge = () => {
        switch (user.verificationStatus) {
            case 'VERIFIED':
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <ShieldCheckIcon />
                        Verified
                    </div>
                );
            case 'PENDING':
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                        Verification Pending
                    </div>
                );
            case 'NOT_VERIFIED':
            default:
                return (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                        Not Verified
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 py-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Profile Header Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex items-start gap-6">
                        <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-16 h-16 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
                                {getVerificationBadge()}
                            </div>
                            <p className="text-slate-600">{user.email}</p>
                            {user.location && <p className="text-sm text-slate-500 mt-1">📍 {user.location}</p>}
                            {user.bio && <p className="text-slate-700 mt-3">{user.bio}</p>}
                            <div className="flex gap-6 mt-4 text-sm">
                                <div>
                                    <span className="font-bold text-slate-900">{myRequests.length}</span>
                                    <span className="text-slate-600 ml-1">Requests Posted</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900">{myApplications.length}</span>
                                    <span className="text-slate-600 ml-1">Applications</span>
                                </div>
                                <div>
                                    <span className="font-bold text-green-600">N{user.walletBalance.toLocaleString()}</span>
                                    <span className="text-slate-600 ml-1">Wallet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-slate-200">
                        <div className="flex gap-1 p-2">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    activeTab === 'profile'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                Profile Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    activeTab === 'security'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                Security
                            </button>
                            <button
                                onClick={() => setActiveTab('activity')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    activeTab === 'activity'
                                        ? 'bg-slate-800 text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                Activity
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Profile Settings Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            placeholder="+234 xxx xxx xxxx"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                            placeholder="City, Country"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-2">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                {error && <p className="text-red-600 text-sm">{error}</p>}
                                {success && <p className="text-green-600 text-sm">{success}</p>}

                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Change Password</h2>
                                    <p className="text-sm text-slate-600 mb-6">Keep your account secure by using a strong password.</p>

                                    <div className="space-y-4 max-w-md">
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={e => setCurrentPassword(e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                                placeholder="Enter current password"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                                placeholder="Enter new password (min 6 characters)"
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-semibold text-slate-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={e => setConfirmPassword(e.target.value)}
                                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        {error && <p className="text-red-600 text-sm">{error}</p>}
                                        {success && <p className="text-green-600 text-sm">{success}</p>}

                                        <button
                                            onClick={handleChangePassword}
                                            className="px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-900 transition-colors"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-2">Identity Verification</h3>
                                    <p className="text-sm text-slate-600 mb-4">Get a verified badge to build trust with the community.</p>

                                    {user.verificationStatus === 'VERIFIED' ? (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <ShieldCheckIcon />
                                            <span className="font-semibold">Your identity is verified</span>
                                        </div>
                                    ) : user.verificationStatus === 'PENDING' ? (
                                        <button className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold cursor-wait" disabled>
                                            Verification in Progress...
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onStartVerification}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                        >
                                            Start Verification Process
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Activity Tab */}
                        {activeTab === 'activity' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Account Statistics</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-600 mb-1">Member Since</p>
                                            <p className="text-xl font-bold text-slate-900">
                                                {user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-600 mb-1">Total Requests</p>
                                            <p className="text-xl font-bold text-slate-900">{myRequests.length}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <p className="text-sm text-slate-600 mb-1">Applications Sent</p>
                                            <p className="text-xl font-bold text-slate-900">{myApplications.length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 mb-3">Recent Requests</h3>
                                    {myRequests.length > 0 ? (
                                        <div className="space-y-3">
                                            {myRequests.slice(0, 5).map(request => (
                                                <div key={request.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                    <h4 className="font-semibold text-slate-900">{request.title}</h4>
                                                    <div className="flex justify-between items-center mt-2 text-sm">
                                                        <span className="text-slate-600">
                                                            {new Date(request.createdAt).toLocaleDateString()}
                                                        </span>
                                                        <span className="text-slate-600">
                                                            {request.applicants.length} applicant(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-500">No requests posted yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
