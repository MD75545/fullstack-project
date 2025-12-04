import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUpcomingContests, getCompletedContests, getTestModuleCategories, createContestPaymentOrder } from '../services/api';
import LoginModal from '../components/LoginModal';

interface Contest {
  test_id: number;
  name: string;
  category_id: number;
  type: string;
  duration_minutes: number;
  start_time: string;
  entry_fee: number;
  prize_money: number;
  min_participants: number;
  status: 'upcoming' | 'active' | 'completed';
  current_participants: number;
  category?: {
    test_category_id: number;
    name: string;
  };
}

interface TestCategory {
  test_category_id: number;
  name: string;
}

// --- Splash Screen Component ---
const TrophySplashScreen: React.FC = () => {
    const shardBaseStyle = 'absolute w-3 h-3 bg-gradient-to-br from-yellow-300 to-amber-500';
    const animations = Array.from({ length: 16 }, (_, i) => `scatter-${i + 1}`);

    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 overflow-hidden">
            <div className="text-center" style={{ animation: 'text-splash-fade 1.2s ease-out forwards' }}>
                <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Welcome to Contests</h1>
            </div>

            <div className="relative w-48 h-48 my-4">
                {/* Main Trophy that fades out */}
                <div style={{ animation: 'fade-out-trophy 1s ease-out 1s forwards' }}>
                    <svg className="w-full h-full text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M11.157 2.353a.75.75 0 00-1.06-.092l-4.5 3.5a.75.75 0 00-.22.547V9.75a.75.75 0 001.5 0V7.22l3.41-2.652a.75.75 0 00.12-.102z" clipRule="evenodd" />
                        <path d="M6.375 9.75a.75.75 0 00-1.5 0v5.33c0 1.954 1.3 3.611 3.01 4.102A4.49 4.49 0 0010 20a4.49 4.49 0 002.115-.518c1.71-.49 3.01-2.148 3.01-4.102V9.75a.75.75 0 00-1.5 0v5.33a3.001 3.001 0 01-2.408 2.963 2.99 2.99 0 01-1.184 0A3.001 3.001 0 017.875 15.08V9.75z" />
                        <path d="M13.5 9a.75.75 0 01.145.01A3.75 3.75 0 0117.25 12c0 1.512-.906 2.8-2.188 3.393a.75.75 0 11-.624-1.291A2.25 2.25 0 0015.75 12a2.25 2.25 0 00-1.93-2.223A.75.75 0 0113.5 9z" />
                        <path d="M6.5 9a.75.75 0 00-.145.01A3.75 3.75 0 002.75 12c0 1.512.906 2.8-2.188 3.393a.75.75 0 10.624-1.291A2.25 2.25 0 014.25 12a2.25 2.25 0 011.93-2.223A.75.75 0 006.5 9z" />
                    </svg>
                </div>
                {/* Shattering pieces */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {animations.map(anim => (
                        <div key={anim} className={shardBaseStyle} style={{ animation: `${anim} 1.5s ease-out 1s forwards` }}></div>
                    ))}
                </div>
            </div>

            <div className="text-center" style={{ animation: 'text-splash-fade 1.2s ease-out forwards' }}>
                <p className="text-lg text-gray-600">Your knowledge can earn you prizes</p>
            </div>
        </div>
    );
};

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="url(#gold-gradient-icon)">
        <defs>
            <linearGradient id="gold-gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
            </linearGradient>
        </defs>
        <path fillRule="evenodd" d="M11.157 2.353a.75.75 0 00-1.06-.092l-4.5 3.5a.75.75 0 00-.22.547V9.75a.75.75 0 001.5 0V7.22l3.41-2.652a.75.75 0 00.12-.102z" clipRule="evenodd" />
        <path d="M6.375 9.75a.75.75 0 00-1.5 0v5.33c0 1.954 1.3 3.611 3.01 4.102A4.49 4.49 0 0010 20a4.49 4.49 0 002.115-.518c1.71-.49 3.01-2.148 3.01-4.102V9.75a.75.75 0 00-1.5 0v5.33a3.001 3.001 0 01-2.408 2.963 2.99 2.99 0 01-1.184 0A3.001 3.001 0 017.875 15.08V9.75z" />
        <path d="M13.5 9a.75.75 0 01.145.01A3.75 3.75 0 0117.25 12c0 1.512-.906 2.8-2.188 3.393a.75.75 0 11-.624-1.291A2.25 2.25 0 0015.75 12a2.25 2.25 0 00-1.93-2.223A.75.75 0 0113.5 9z" />
        <path d="M6.5 9a.75.75 0 00-.145.01A3.75 3.75 0 002.75 12c0 1.512.906 2.8-2.188 3.393a.75.75 0 10.624-1.291A2.25 2.25 0 014.25 12a2.25 2.25 0 011.93-2.223A.75.75 0 006.5 9z" />
    </svg>
);

const CountdownBadge: React.FC<{ startTime: string; status: string }> = ({ startTime, status }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    
    useEffect(() => {
        if (status === 'completed') {
            setTimeLeft('Completed');
            return;
        }
        
        if (status === 'active') {
            setTimeLeft('Live Now');
            return;
        }
        
        const timer = setInterval(() => {
            const now = new Date();
            const contestStart = new Date(startTime);
            const difference = contestStart.getTime() - now.getTime();
            
            if (difference <= 0) {
                setTimeLeft('Starting soon');
                clearInterval(timer);
                return;
            }
            
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        }, 60000);
        
        // Initial calculation
        const now = new Date();
        const contestStart = new Date(startTime);
        const difference = contestStart.getTime() - now.getTime();
        
        if (difference <= 0) {
            setTimeLeft('Starting soon');
        } else {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            
            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        }
        
        return () => clearInterval(timer);
    }, [startTime, status]);
    
    const badgeClass = {
        completed: 'bg-gray-200 text-gray-700',
        active: 'bg-red-100 text-red-800 animate-pulse',
        upcoming: 'bg-blue-100 text-blue-800'
    }[status as keyof typeof badgeClass] || 'bg-blue-100 text-blue-800';
    
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
            {timeLeft}
        </span>
    );
};

const Contest: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'register' | 'winners' | null>(null);
    const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
    const [completedContests, setCompletedContests] = useState<Contest[]>([]);
    const [categories, setCategories] = useState<TestCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [isProcessingPayment, setIsProcessingPayment] = useState<number | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const pageLoadTimer = setTimeout(() => {
            setShowSplash(false);
        }, 2500);

        window.scrollTo(0, 0);

        return () => clearTimeout(pageLoadTimer);
    }, []);

    // Fetch contests and categories from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch categories
                const categoriesResponse = await getTestModuleCategories();
                if (categoriesResponse.status === 'success' || categoriesResponse.success === true) {
                    setCategories(categoriesResponse.data || []);
                }

                // Fetch upcoming contests
                const upcomingResponse = await getUpcomingContests();
                if (upcomingResponse.status === 'success' || upcomingResponse.success === true) {
                    setUpcomingContests(upcomingResponse.data || []);
                } else {
                    throw new Error(upcomingResponse.message || 'Failed to fetch upcoming contests');
                }

                // Fetch completed contests
                const completedResponse = await getCompletedContests();
                if (completedResponse.status === 'success' || completedResponse.success === true) {
                    setCompletedContests(completedResponse.data || []);
                } else {
                    throw new Error(completedResponse.message || 'Failed to fetch completed contests');
                }

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load contests');
            } finally {
                setLoading(false);
            }
        };

        if (!showSplash) {
            fetchData();
        }
    }, [showSplash]);

    const filteredContests = useMemo(() => {
        const source = activeTab === 'upcoming' ? upcomingContests : completedContests;
        
        return source.filter(contest => {
            const matchesCategory = selectedCategory === 'all' || 
                                  contest.category_id === parseInt(selectedCategory);
            const matchesSearch = contest.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory, activeTab, upcomingContests, completedContests]);

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

    const handlePaidContestRegistration = async (contestId: number) => {
        if (!user) {
            setSelectedContestId(contestId);
            setActionType('register');
            setIsLoginModalOpen(true);
            return;
        }

        try {
            setIsProcessingPayment(contestId);
            
            // Create payment order
            const orderResponse = await createContestPaymentOrder(contestId, user.user_id);
            
            if (orderResponse.status !== 'success') {
                throw new Error(orderResponse.message || 'Failed to create payment order');
            }

            const orderData = orderResponse.data;

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
                handler: async function (response) {
                    // Payment successful
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            payment_id: orderData.payment_id
                        };

                        // Import verifyPayment function
                        const { verifyPayment } = await import('../services/api');
                        const verifyResponse = await verifyPayment(verifyData);
                        
                        if (verifyResponse.status === 'success') {
                            // Show success message and navigate to guidelines
                            alert('Payment successful! You are now registered for the contest.');
                            navigate(`/contest/${contestId}/guidelines`);
                        } else {
                            alert('Payment verification failed: ' + verifyResponse.message);
                        }
                    } catch (err) {
                        alert('Payment verification error: ' + (err as Error).message);
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
                }
            };

            // Open Razorpay checkout
            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response: any) {
                alert('Payment failed. Please try again. Error: ' + response.error.description);
            });

        } catch (err) {
            console.error('Payment error:', err);
            alert((err as Error).message);
        } finally {
            setIsProcessingPayment(null);
        }
    };

    const handleActionClick = (contestId: number, action: 'register' | 'winners') => {
        if (!user) {
            setSelectedContestId(contestId);
            setActionType(action);
            setIsLoginModalOpen(true);
            return;
        }

        if (action === 'register') {
            const contest = upcomingContests.find(c => c.test_id === contestId);
            if (contest) {
                if (contest.entry_fee > 0) {
                    // Handle paid contest with Razorpay
                    handlePaidContestRegistration(contestId);
                } else {
                    // Navigate directly to guidelines for free contests
                    navigate(`/contest/${contestId}/guidelines`);
                }
            }
        } else {
            navigate(`/contest/${contestId}/winners`);
        }
    };

    const onLoginSuccess = () => {
        setIsLoginModalOpen(false);
        if (selectedContestId && actionType) {
            if (actionType === 'register') {
                const contest = upcomingContests.find(c => c.test_id === selectedContestId);
                if (contest?.entry_fee > 0) {
                    handlePaidContestRegistration(selectedContestId);
                } else {
                    navigate(`/contest/${selectedContestId}/guidelines`);
                }
            } else {
                navigate(`/contest/${selectedContestId}/winners`);
            }
        }
    };

    const getCategoryName = (categoryId: number): string => {
        const category = categories.find(c => c.test_category_id === categoryId);
        return category?.name || 'Unknown Category';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (showSplash) {
        return <TrophySplashScreen />;
    }

    if (loading) {
        return (
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">Contests</h2>
                    </div>
                    <div className="mt-12 text-center">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">Contests</h2>
                    </div>
                    <div className="mt-12 text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>{error}</p>
                            <button 
                                onClick={() => window.location.reload()}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gradient-gold tracking-wider">
                            {activeTab === 'upcoming' ? 'Upcoming Contests' : 'Past Contests'}
                        </h2>
                        <p className="mt-4 text-lg text-gray-600">
                            {activeTab === 'upcoming' 
                                ? 'Test your skills and win exciting prizes' 
                                : 'View results of past competitions'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="mt-8 flex justify-center">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('upcoming')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'upcoming'
                                            ? 'border-brand-purple text-brand-purple'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Upcoming Contests
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {upcomingContests.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('completed')}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                        activeTab === 'completed'
                                            ? 'border-brand-purple text-brand-purple'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    Past Contests
                                    <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                        {completedContests.length}
                                    </span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="relative">
                            <label htmlFor="search-contest" className="block text-sm font-medium text-gray-700">Search Contest</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                                <input
                                    type="text"
                                    id="search-contest"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="focus:ring-brand-purple focus:border-brand-purple block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                    placeholder="Search by contest name..."
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                id="category-select"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.test_category_id} value={cat.test_category_id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Contests Table */}
                    <div className="mt-8 max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest Name</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date & Time</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContests.length > 0 ? filteredContests.map((contest) => (
                                        <tr key={contest.test_id} className="hover:bg-purple-50/50 transition-colors">
                                            <td className="px-6 py-4 bg-purple-50">
                                                <div className="text-lg sm:text-2xl font-calligraphy text-gradient-gold font-bold">{contest.name}</div>
                                                <div className="text-xs text-gray-500 md:hidden mt-1 font-semibold">
                                                    {getCategoryName(contest.category_id)}
                                                </div>
                                                <div className="text-xs text-gray-500 md:hidden mt-1">
                                                    {contest.duration_minutes} mins | Min: {contest.min_participants} participants
                                                </div>
                                                <div className="text-xs text-gray-500 md:hidden mt-1">
                                                    {formatDate(contest.start_time)} at {formatTime(contest.start_time)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                                <div>{getCategoryName(contest.category_id)}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {contest.duration_minutes} mins | Min: {contest.min_participants} participants
                                                </div>
                                                <div className="text-xs text-green-600 font-semibold mt-1">
                                                    Prize: ₹{contest.prize_money?.toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                                                <div>{formatDate(contest.start_time)}</div>
                                                <div className="text-xs text-gray-600">{formatTime(contest.start_time)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <CountdownBadge startTime={contest.start_time} status={contest.status} />
                                                    <div className="text-xs text-gray-500">
                                                        {contest.current_participants || 0} / {contest.min_participants} registered
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block text-center">
                                                    <div className="absolute -top-3 right-0 origin-bottom animate-sway">
                                                        <TrophyIcon />
                                                    </div>
                                                    {activeTab === 'upcoming' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleActionClick(contest.test_id, 'register')}
                                                                disabled={isProcessingPayment === contest.test_id}
                                                                className={`text-white font-bold py-2 px-4 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                    contest.entry_fee > 0 
                                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                                                        : 'bg-brand-purple hover:bg-opacity-90'
                                                                }`}
                                                            >
                                                                {isProcessingPayment === contest.test_id 
                                                                    ? 'Processing...' 
                                                                    : contest.entry_fee > 0 
                                                                        ? `Pay ₹${contest.entry_fee}`
                                                                        : 'Register Free'}
                                                            </button>
                                                            <div className="mt-1.5 text-center">
                                                                {contest.entry_fee > 0 ? (
                                                                    <p className="text-[10px] text-purple-600 font-semibold">
                                                                        Entry Fee: ₹{contest.entry_fee}
                                                                    </p>
                                                                ) : (
                                                                    <p className="text-[10px] text-green-600 font-semibold">
                                                                        Free Entry
                                                                    </p>
                                                                )}
                                                                <p className="text-[10px] text-gray-500 mt-0.5">
                                                                    Prize: ₹{contest.prize_money?.toLocaleString('en-IN')}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleActionClick(contest.test_id, 'winners')}
                                                                className="text-white bg-brand-navy hover:bg-opacity-90 font-bold py-2 px-4 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition-transform"
                                                            >
                                                                Winner List
                                                            </button>
                                                            <div className="mt-1.5 text-center">
                                                                <p className="text-[10px] text-gray-500">
                                                                    Completed on {formatDate(contest.start_time)}
                                                                </p>
                                                                <p className="text-[10px] text-green-600 font-semibold mt-0.5">
                                                                    Prize: ₹{contest.prize_money?.toLocaleString('en-IN')}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center py-8 text-gray-500">
                                                {activeTab === 'upcoming' 
                                                    ? 'No upcoming contests available at the moment.'
                                                    : 'No completed contests found.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="text-center mt-12">
                        <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 italic">
                            "The ultimate victory in competition is derived from the inner satisfaction of knowing that you have done your best and that you have gotten the most out of what you had to give." - Howard Cosell
                        </p>
                    </div>

                    {/* Contest Rules Section */}
                    <div className="mt-12 max-w-5xl mx-auto bg-gray-50 p-6 sm:p-8 rounded-lg border border-gray-200">
                        <h3 className="text-2xl font-bold text-brand-navy text-center mb-6">Rules of the Contest</h3>
                        <ol className="list-decimal list-inside space-y-3 text-sm sm:text-base text-gray-700">
                            <li>Participants must be 18 years of age or older to enter.</li>
                            <li>Each participant must register with a valid email address and mobile number.</li>
                            <li>One entry per person. Multiple entries from the same person will be disqualified.</li>
                            <li>The contest will start exactly at the specified time. Late entries will not be permitted.</li>
                            <li>Any form of plagiarism or cheating will result in immediate disqualification.</li>
                            <li>The decision of the judges will be final and binding.</li>
                            <li>Prizes are non-transferable and cannot be exchanged for cash.</li>
                            <li>If the minimum number of participants is not met, the contest will be postponed to a future date. All registered participants will be notified.</li>
                            <li>By participating, you agree to our terms and conditions and privacy policy.</li>
                        </ol>
                    </div>
                </div>
            </div>
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onSuccess={onLoginSuccess} showSignUp={true} />}
        </>
    );
};

export default Contest;