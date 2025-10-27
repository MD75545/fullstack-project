import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { contests } from '../data/mockData';

const ContestGuidelines: React.FC = () => {
    const { contestId } = useParams<{ contestId: string }>();
    const navigate = useNavigate();
    const contest = contests.find(t => t.id === parseInt(contestId || ''));

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isContestActive, setIsContestActive] = useState(false);

    useEffect(() => {
        if (!contest) return;

        const contestDateTime = new Date(`${contest.date}T${contest.time}:00`);
        
        const timer = setInterval(() => {
            const now = new Date();
            const difference = contestDateTime.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setIsContestActive(true);
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [contest]);

    if (!contest) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-brand-navy">Contest not found</h2>
                <Link to="/contest" className="mt-4 inline-block text-brand-purple hover:underline">Back to Contests</Link>
            </div>
        );
    }

    const handleEnterContest = () => {
        if (isContestActive && contest) {
            navigate(`/contest/${contest.id}/start`);
        }
    };
    
    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-brand-navy text-center mb-2">Contest Guidelines</h1>
                    <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">{contest.name}</h2>
                    
                    <div className="text-center bg-purple-50 p-6 rounded-lg border border-brand-purple mb-8">
                        <h3 className="text-lg font-semibold text-brand-navy mb-2">Contest Starts In</h3>
                        <div className="grid grid-cols-4 gap-2 text-center">
                            <div><span className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span><span className="block text-xs">Days</span></div>
                            <div><span className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span><span className="block text-xs">Hours</span></div>
                            <div><span className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span><span className="block text-xs">Minutes</span></div>
                            <div><span className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span><span className="block text-xs">Seconds</span></div>
                        </div>
                    </div>

                    <div className="prose max-w-none mx-auto text-gray-600 mb-8">
                        <p>Please read the following instructions carefully before the contest starts:</p>
                        <ul>
                            <li>The contest will automatically become active at the scheduled time.</li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Do not refresh the page during the contest.</li>
                            <li>The contest is timed and will auto-submit upon completion.</li>
                        </ul>
                        <p className="font-semibold">All the best!</p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button 
                           onClick={handleEnterContest}
                           disabled={!isContestActive} 
                           className="w-full sm:w-auto px-8 py-3 bg-brand-purple text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                           {isContestActive ? 'Enter Contest' : 'Waiting for Contest to Start'}
                        </button>
                        {contest.notesUrl && (
                             <a href={contest.notesUrl} download className="w-full sm:w-auto text-center px-8 py-3 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors">
                                Download Notes
                             </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestGuidelines;
