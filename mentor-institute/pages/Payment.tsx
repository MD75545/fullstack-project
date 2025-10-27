import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contests } from '../data/mockData';

const Payment: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const contest = contests.find(t => t.id === parseInt(contestId || ''));
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

    if (!contest) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-brand-navy">Contest not found</h2>
                <Link to="/contest" className="mt-4 inline-block text-brand-purple hover:underline">Back to Contests</Link>
            </div>
        );
    }
    
    const handlePayment = () => {
        setIsProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setIsProcessing(false);
            setIsPaid(true);
            // Redirect after a short delay to show success message
            setTimeout(() => {
                navigate(`/contest/${contest.id}/guidelines`);
            }, 1500);
        }, 2000);
    };

    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-brand-navy text-center mb-4">Payment</h1>
                    
                    <div className="bg-gray-50 p-4 rounded-md border text-center mb-6">
                        <p className="text-gray-600">You are applying for:</p>
                        <h2 className="text-xl font-semibold text-brand-purple">{contest.name}</h2>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-gray-500">Application Fee</p>
                        <p className="text-4xl font-bold text-gray-800">₹{contest.entryFee}</p>
                    </div>
                    
                    {isPaid ? (
                         <div className="text-center text-green-600 font-semibold">
                            <p>Payment Successful!</p>
                            <p>Redirecting to guidelines...</p>
                         </div>
                    ) : (
                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            className="w-full px-8 py-3 bg-brand-purple text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;