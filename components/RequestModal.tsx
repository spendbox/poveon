import React, { useState, useEffect } from 'react';
import { Request, UrgencyOption, UrgencyLevel, User } from '../types';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (request: Partial<Request>) => void;
    requestData: Partial<Request>;
    urgencyOptions: UrgencyOption[];
    currentUser: User | null;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSave, requestData, urgencyOptions, currentUser }) => {
    const [request, setRequest] = useState(requestData);
    const [selectedUrgency, setSelectedUrgency] = useState<UrgencyLevel>(requestData.urgency || UrgencyLevel.GENERAL);
    const [error, setError] = useState('');

    useEffect(() => {
        setRequest(requestData);
        setSelectedUrgency(requestData.urgency || UrgencyLevel.GENERAL);
    }, [requestData]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRequest(prev => ({ ...prev, [name]: name === 'budget' ? Number(value) : value }));
    };

    const handleSave = () => {
        if (!request.whatsapp?.trim() && !request.email?.trim()) {
            setError('Please provide at least one contact method (WhatsApp or Email).');
            return;
        }
        setError('');
        onSave({ ...request, urgency: selectedUrgency });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">{request.id ? 'Edit Request' : 'Confirm Your Request'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">&times;</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="font-semibold text-slate-700">Title</label>
                        <input type="text" name="title" value={request.title || ''} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Category</label>
                        <input type="text" name="category" value={request.category || ''} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Budget (NGN)</label>
                        <input type="number" name="budget" value={request.budget || 0} onChange={handleChange} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Description</label>
                        <textarea name="description" value={request.description || ''} onChange={handleChange} rows={5} className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div>
                        <label className="font-semibold text-slate-700">Contact Details</label>
                         <p className="text-sm text-slate-500 mb-2">Provide at least one contact method.</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">WhatsApp Number (Optional)</label>
                                <input type="tel" name="whatsapp" value={request.whatsapp || ''} onChange={handleChange} placeholder="+2348012345678" className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Email Address (Optional)</label>
                                <input type="email" name="email" value={request.email || ''} onChange={handleChange} placeholder="you@example.com" className="w-full mt-1 p-2 border border-slate-300 rounded-md"/>
                            </div>
                        </div>
                    </div>
                </div>

                {currentUser && (
                    <div className="mt-8">
                        <h3 className="font-semibold text-slate-700 mb-2">Urgency Level</h3>
                        <div className="grid sm:grid-cols-3 gap-3">
                            {urgencyOptions.map(option => (
                                <div key={option.level} onClick={() => setSelectedUrgency(option.level)}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedUrgency === option.level ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-400'}`}>
                                    <h4 className="font-bold">{option.label}</h4>
                                    <p className="text-sm text-slate-500 mt-1">{option.description}</p>
                                    <p className="text-lg font-semibold mt-2">N{option.cost.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!currentUser && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Sign in to post this request.</span> You'll be able to select urgency level and payment options after logging in.
                        </p>
                    </div>
                )}

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="px-6 py-2 font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md">{request.id ? 'Save Changes' : 'Confirm & Post'}</button>
                </div>
            </div>
        </div>
    );
};

export default RequestModal;