import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getContestDetails, createContestPaymentOrder, verifyPayment } from '../services/api';

interface ContestDetails {
  test_id: number;
  name: string;
  entry_fee: number;
  prize_money: number;
  start_time: string;
  duration_minutes: number;
  min_participants: number;
  current_participants: number;
  status: string;
}

const Payment: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [contest, setContest] = useState<ContestDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string>('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        const loadContestDetails = async () => {
            try {
                setLoading(true);
                const response = await getContestDetails(parseInt(contestId || '0'));
                
                if (response.status === 'success' || response.success === true) {
                    setContest(response.data);
                } else {
                    throw new Error(response.message || 'Failed to load contest details');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load contest');
                console.error('Error loading contest:', err);
            } finally {
                setLoading(false);
            }
        };

        if (contestId && user) {
            loadContestDetails();
        } else if (!user) {
            navigate('/login');
        }
    }, [contestId, user, navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!contestId || !user) {
            setError('Please login to continue');
            return;
        }

        try {
            setProcessing(true);
            setError('');

            // Create payment order
            const orderResponse = await createContestPaymentOrder(parseInt(contestId), user.user_id);
            
            if (orderResponse.status !== 'success') {
                throw new Error(orderResponse.message || 'Failed to create payment order');
            }

            const orderData = orderResponse.data;
            setPaymentData(orderData);

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay script');
            }

            // Configure Razorpay options
            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // Amount in paise
                currency: orderData.currency,
                name: 'Mentor Institute',
                description: `Contest Entry: ${orderData.contest_name}`,
                order_id: orderData.order_id,
                handler: async function (response: any) {
                    // Payment successful
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            payment_id: orderData.payment_id
                        };

                        const verifyResponse = await verifyPayment(verifyData);
                        
                        if (verifyResponse.status === 'success') {
                            setPaymentSuccess(true);
                            // Redirect to contest guidelines after 2 seconds
                            setTimeout(() => {
                                navigate(`/contest/${contestId}/guidelines`);
                            }, 2000);
                        } else {
                            throw new Error('Payment verification failed: ' + verifyResponse.message);
                        }
                    } catch (err) {
                        setError(err instanceof Error ? err.message : 'Payment verification failed');
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.mobile || ''
                },
                notes: orderData.notes,
                theme: {
                    color: '#6d28d9' // Brand purple color
                },
                modal: {
                    ondismiss: function() {
                        setProcessing(false);
                    }
                }
            };

            // Open Razorpay checkout
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response: any) {
                setError('Payment failed. Please try again. Error: ' + response.error.description);
                setProcessing(false);
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
            setProcessing(false);
            console.error('Payment error:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-brand-navy mb-4">Contest not found</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button 
                            onClick={() => navigate('/contest')}
                            className="px-6 py-2 bg-brand-purple text-white rounded hover:bg-opacity-90"
                        >
                            Back to Contests
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-brand-navy mb-2">Payment for Contest</h1>
                        <h2 className="text-xl text-gray-600">{contest.name}</h2>
                    </div>

                    {error && !paymentSuccess && (
                        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {paymentSuccess ? (
                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                                <p className="text-gray-600 mb-4">You are now registered for the contest.</p>
                                <p className="text-sm text-gray-500">Redirecting to contest guidelines...</p>
                            </div>
                            <button
                                onClick={() => navigate(`/contest/${contestId}/guidelines`)}
                                className="px-6 py-2 bg-brand-purple text-white rounded hover:bg-opacity-90"
                            >
                                Go to Guidelines
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gray-50 p-6 rounded-lg border mb-8">
                                <div className="text-center mb-6">
                                    <p className="text-gray-500 mb-2">Contest Entry Fee</p>
                                    <div className="text-5xl font-bold text-brand-purple">₹{contest.entry_fee}</div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600">Contest Name</span>
                                        <span className="font-semibold">{contest.name}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600">Prize Money</span>
                                        <span className="font-semibold text-green-600">
                                            ₹{contest.prize_money?.toLocaleString('en-IN') || '0'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600">Start Time</span>
                                        <span className="font-semibold">{formatDate(contest.start_time)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="font-semibold">{contest.duration_minutes} minutes</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-600">Participants</span>
                                        <span className="font-semibold">
                                            {contest.current_participants || 0} / {contest.min_participants} registered
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    onClick={handlePayment}
                                    disabled={processing || paymentSuccess}
                                    className={`px-8 py-3 text-white font-bold rounded-lg shadow-md transform hover:scale-105 transition-transform ${
                                        processing 
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    }`}
                                >
                                    {processing ? 'Processing...' : `Pay ₹${contest.entry_fee}`}
                                </button>
                                
                                <div className="mt-6 space-y-4 text-sm text-gray-600">
                                    <p>✅ Secure payment powered by Razorpay</p>
                                    <p>🔒 Your payment details are encrypted and secure</p>
                                    <p>💳 Test card: 4111 1111 1111 1111 | Any future expiry | Any CVV</p>
                                </div>
                                
                                <button
                                    onClick={() => navigate(-1)}
                                    className="mt-8 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                >
                                    Back
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Payment;