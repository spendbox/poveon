import React, { useState } from 'react';
import { User } from '../types';
import PaystackButton from './PaystackButton';
import { PAYSTACK_PUBLIC_KEY } from '../constants';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFunds: (amount: number) => void;
    currentUser: User;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onAddFunds, currentUser }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const validateAmount = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setError('Please enter a valid, positive amount.');
            return false;
        }
        if (numericAmount < 500) {
            setError('Minimum amount to add is N500.');
            return false;
        }
        setError('');
        return true;
    }
    
    const handlePaymentSuccess = () => {
        onAddFunds(parseFloat(amount));
        setAmount('');
    }
    
    const presetAmounts = [1000, 5000, 10000, 25000];
    const numericAmount = parseFloat(amount || '0');

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">
                    Manage Your Wallet
                </h2>
                <div className="text-center bg-slate-100 p-4 rounded-lg my-6">
                    <p className="text-slate-600">Current Balance</p>
                    <p className="text-4xl font-bold text-slate-800 mt-1">N{currentUser.walletBalance.toLocaleString()}</p>
                </div>
                
                <div className="space-y-4">
                     <div>
                        <label className="font-semibold text-slate-700">Amount to Add (NGN)</label>
                        <div className="grid grid-cols-4 gap-2 my-2">
                            {presetAmounts.map(preset => (
                                <button key={preset} onClick={() => { setAmount(String(preset)); setError('')}} className={`py-2 border rounded-md font-semibold ${String(preset) === amount ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                                    {preset / 1000}k
                                </button>
                            ))}
                        </div>
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            placeholder="Or enter a custom amount (min N500)"
                            className="w-full mt-1 p-2 border border-slate-300 rounded-md"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="mt-4">
                        <PaystackButton
                            publicKey={PAYSTACK_PUBLIC_KEY}
                            email={currentUser.email}
                            amount={numericAmount * 100} // Paystack amount is in kobo
                            onSuccess={handlePaymentSuccess}
                            onClose={() => console.log('Paystack modal closed')}
                            onBeforeStart={validateAmount}
                        />
                    </div>
                </div>

                 <p className="text-center text-xs text-slate-400 mt-6">
                    Payments are securely processed by Paystack. This is a demo integration.
                </p>
            </div>
        </div>
    );
};

export default WalletModal;
