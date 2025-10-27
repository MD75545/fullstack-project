import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { contests, testCategories } from '../data/mockData';
import LoginModal from '../components/LoginModal';
import type { Contest as ContestType } from '../types';

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
                    <svg className="w-full h-full text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M11.157 2.353a.75.75 0 00-1.06-.092l-4.5 3.5a.75.75 0 00-.22.547V9.75a.75.75 0 001.5 0V7.22l3.41-2.652a.75.75 0 00.12-.102z" clipRule="evenodd" /><path d="M6.375 9.75a.75.75 0 00-1.5 0v5.33c0 1.954 1.3 3.611 3.01 4.102A4.49 4.49 0 0010 20a4.49 4.49 0 002.115-.518c1.71-.49 3.01-2.148 3.01-4.102V9.75a.75.75 0 00-1.5 0v5.33a3.001 3.001 0 01-2.408 2.963 2.99 2.99 0 01-1.184 0A3.001 3.001 0 017.875 15.08V9.75z" /><path d="M13.5 9a.75.75 0 01.145.01A3.75 3.75 0 0117.25 12c0 1.512-.906 2.8-2.188 3.393a.75.75 0 11-.624-1.291A2.25 2.25 0 0015.75 12a2.25 2.25 0 00-1.93-2.223A.75.75 0 0113.5 9z" /><path d="M6.5 9a.75.75 0 00-.145.01A3.75 3.75 0 002.75 12c0 1.512.906 2.8-2.188 3.393a.75.75 0 10.624-1.291A2.25 2.25 0 014.25 12a2.25 2.25 0 011.93-2.223A.75.75 0 006.5 9z" /></svg>
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


const CountdownBadge: React.FC<{ date: string; time: string }> = ({ date, time }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [status, setStatus] = useState<'active' | 'upcoming' | 'started' | 'completed'>('upcoming');

    useEffect(() => {
        let timer: number;
        const calculate = () => {
            const contestDateTime = new Date(`${date}T${time}:00`);
            const now = new Date();
            const difference = contestDateTime.getTime() - now.getTime();
            
            if (now > contestDateTime) {
                 setTimeLeft('Completed');
                 setStatus('completed');
                 if(timer) clearInterval(timer);
                 return;
            }

            if (difference <= 0) {
                setTimeLeft('Live');
                setStatus('started');
                if (timer) clearInterval(timer);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else if (minutes > 0) {
                setTimeLeft(`${minutes}m left`);
            } else {
                setTimeLeft('Starting soon');
            }
             setStatus('upcoming');
        };

        calculate();
        timer = window.setInterval(calculate, 60000); // Update every minute

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [date, time]);

    const badgeClass = {
        upcoming: 'bg-blue-100 text-blue-800',
        started: 'bg-red-100 text-red-800 animate-pulse',
        completed: 'bg-gray-200 text-gray-700',
    }[status];

    return (
        <span className={`px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-semibold rounded-full ${badgeClass}`}>
            {timeLeft}
        </span>
    );
};


const Contest: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<ContestType | null>(null);
    const [action, setAction] = useState<'apply' | 'winners' | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const pageLoadTimer = setTimeout(() => {
            setShowSplash(false);
        }, 2500); // Should be slightly longer than animation duration

        window.scrollTo(0, 0);

        return () => clearTimeout(pageLoadTimer);
    }, []);

    const filteredContests = useMemo(() => {
        const sortedContests = [...contests].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}:00`);
            const dateB = new Date(`${b.date}T${b.time}:00`);
            return dateB.getTime() - dateA.getTime();
        });

        return sortedContests.filter(contest => {
            const matchesCategory = selectedCategory === 'all' || contest.categoryId === parseInt(selectedCategory);
            const matchesSearch = contest.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);
    
    const handleActionClick = (contest: ContestType, type: 'apply' | 'winners') => {
        if (user) {
            if (type === 'apply') {
                navigate(`/contest/${contest.id}/payment`);
            } else {
                navigate(`/contest/${contest.id}/winners`);
            }
        } else {
            setSelectedContest(contest);
            setAction(type);
            setIsLoginModalOpen(true);
        }
    };
    
    const onLoginSuccess = () => {
        setIsLoginModalOpen(false);
        if (selectedContest && action) {
            if (action === 'apply') {
                navigate(`/contest/${selectedContest.id}/payment`);
            } else {
                 navigate(`/contest/${selectedContest.id}/winners`);
            }
        }
    };

    const getCategoryName = (categoryId: number): string => {
        return testCategories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    const formatTime = (timeString: string) => {
        const [hour, minute] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hour), parseInt(minute));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (showSplash) {
        return <TrophySplashScreen />;
    }

    return (
        <>
            <div className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gradient-gold tracking-wider">Upcoming Contests</h2>
                    </div>

                    {/* Filters */}
                    <div className="mt-12 max-w-5xl mx-auto grid grid-cols-2 gap-4 items-end">
                        <div className="relative">
                            <label htmlFor="search-contest" className="block text-sm font-medium text-gray-700">Search Contest</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                                <input type="text" id="search-contest" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="focus:ring-brand-purple focus:border-brand-purple block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2" placeholder="Search by contest name..." />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md">
                                <option value="all">All Categories</option>
                                {testCategories.map(cat => ( <option key={cat.id} value={cat.id}>{cat.name}</option> ))}
                            </select>
                        </div>
                    </div>

                    {/* Contests Table */}
                    <div className="mt-8 max-w-5xl mx-auto shadow-2xl rounded-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th scope="col" className="px-2 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contest Name</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Time</th>
                                        <th scope="col" className="px-2 py-3 sm:px-6 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative px-2 py-3 sm:px-6 sm:py-4"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredContests.map((contest) => {
                                        const isCompleted = new Date() > new Date(`${contest.date}T${contest.time}:00`);
                                        return (
                                        <tr key={contest.id} className="hover:bg-purple-50/50 transition-colors">
                                            <td className="px-2 py-4 sm:px-6 bg-purple-50">
                                               <div className="text-lg sm:text-2xl font-calligraphy text-gradient-gold font-bold">{contest.name}</div>
                                               <div className="text-xs text-gray-500 md:hidden mt-1 font-semibold">
                                                   {getCategoryName(contest.categoryId)}
                                               </div>
                                               <div className="text-xs text-gray-500 md:hidden mt-1">
                                                   {contest.totalQuestions} Questions | {contest.duration} mins
                                               </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                                                <div>{getCategoryName(contest.categoryId)}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    {contest.totalQuestions} Qs | {contest.duration} mins
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">{formatDate(contest.date)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700 hidden md:table-cell">{formatTime(contest.time)}</td>
                                            <td className="px-2 py-4 sm:px-6 text-sm text-gray-700">
                                                <div><CountdownBadge date={contest.date} time={contest.time} /></div>
                                                <div className="text-[11px] text-gray-500 mt-1 md:hidden">
                                                    <div>{formatDate(contest.date)}</div>
                                                    <div className="text-[10px]">{formatTime(contest.time)}</div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 sm:px-6 text-right text-sm font-medium">
                                                <div className="relative inline-block text-center">
                                                    <div className="absolute -top-3 right-0 origin-bottom animate-sway">
                                                        <TrophyIcon />
                                                    </div>
                                                    <p className="text-[11px] sm:text-sm text-gray-800 font-bold mb-1">
                                                        Prize: ₹{contest.prizeMoney.toLocaleString('en-IN')}
                                                    </p>
                                                    {isCompleted ? (
                                                        <button onClick={() => handleActionClick(contest, 'winners')} className="text-white bg-brand-navy hover:bg-opacity-90 font-bold py-1 px-3 sm:py-2 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition-transform text-xs sm:text-base">
                                                            Winner List
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleActionClick(contest, 'apply')} className="text-white bg-brand-purple hover:bg-opacity-90 font-bold py-1 px-3 sm:py-2 sm:px-5 rounded-lg shadow-md transform hover:scale-105 transition-transform text-xs sm:text-base">
                                                            Apply
                                                        </button>
                                                    )}
                                                     <div className="mt-1.5 text-center">
                                                        <p className="text-[10px] text-green-600 font-semibold">
                                                            Entry Fee: ₹{contest.entryFee}
                                                        </p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">
                                                            Min: {contest.minParticipants} participants
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )})}
                                    {filteredContests.length === 0 && (
                                        <tr><td colSpan={7} className="text-center py-8 text-gray-500">No contests found.</td></tr>
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