import React, { useState } from 'react';

interface PaystackButtonProps {
    publicKey: string;
    email: string;
    amount: number; // in kobo
    onSuccess: () => void;
    onClose: () => void;
    onBeforeStart: () => boolean;
}

const PaystackButton: React.FC<PaystackButtonProps> = ({ email, amount, onSuccess, onClose, onBeforeStart }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = () => {
        if (!onBeforeStart()) {
            return;
        }

        setIsLoading(true);

        // Simulate Paystack API call and modal
        console.log(`
            --- MOCK PAYSTACK TRANSACTION ---
            Email: ${email}
            Amount: N${(amount / 100).toLocaleString()} (${amount} kobo)
            --------------------------------
        `);

        setTimeout(() => {
            // Simulate a successful payment
            setIsLoading(false);
            onSuccess();
        }, 2500);
    };

    const isDisabled = amount <= 0;

    return (
        <button 
            onClick={handlePayment} 
            disabled={isDisabled || isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 text-white bg-slate-800 rounded-md font-semibold hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                </>
            ) : (
                `Pay N${(amount / 100).toLocaleString()} with Paystack`
            )}
        </button>
    );
};

export default PaystackButton;
