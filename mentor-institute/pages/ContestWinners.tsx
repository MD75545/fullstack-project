import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { contests, contestWinners, users } from '../data/mockData';
import type { Student } from '../types';
import { useAuth } from '../context/AuthContext';

const TrophyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-yellow-400 inline-block mr-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11.25 2.25a.75.75 0 10-1.5 0v1.504a.75.75 0 001.5 0V2.25z" />
      <path fillRule="evenodd" d="M3.01 6.183a.75.75 0 011.108-.553l2.43 1.488a.75.75 0 010 1.109l-2.43 1.488a.75.75 0 11-.555-1.108l1.642-.99-1.642-.99a.75.75 0 01-.553-1.108zM16.99 6.183a.75.75 0 00-.553 1.108l1.642.99-1.642.99a.75.75 0 10.555 1.108l2.43-1.488a.75.75 0 000-1.109l-2.43-1.488a.75.75 0 00-1.108-.553z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 11.5a1 1 0 100-2 1 1 0 000 2zM6 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm10.5 3.5a1 1 0 100-2 1 1 0 000 2zM15.5 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM10 14a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
);


const WinnerCard: React.FC<{ winner: any; rank: number; delay: string }> = ({ winner, rank, delay }) => {
    const student = users.find(u => u.id === winner.userId) as Student;
    if (!student) return null;

    const displayName = student.displayName === 'anonymous' ? 'Anonymous' : student.name;
    const photo = student.photo || (student.gender === 'female' ? 'https://i.pravatar.cc/150?img=47' : 'https://i.pravatar.cc/150?img=68');
    
    const rankStyles = {
        1: { border: 'border-yellow-400', shadow: 'shadow-yellow-400/30', elevation: 'md:-translate-y-8', order: 'md:order-2' },
        2: { border: 'border-gray-300', shadow: 'shadow-gray-400/30', elevation: '', order: 'md:order-1' },
        3: { border: 'border-yellow-600', shadow: 'shadow-yellow-600/30', elevation: '', order: 'md:order-3' }
    };
    const style = rankStyles[rank] || { border: '', shadow: '', elevation: '', order: 'order-last' };
    
    return (
        <div className={`w-full max-w-sm md:w-1/3 p-2 ${style.order} ${style.elevation} transition-transform duration-500 animate-podium-fade-in-up`} style={{ animationDelay: delay }}>
            <div className={`bg-white/10 backdrop-blur-md rounded-xl shadow-lg ${style.shadow} border ${style.border} border-opacity-30 p-6 text-center text-white h-full flex flex-col justify-between`}>
                <div>
                     <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold ${rank === 1 ? 'bg-yellow-400 text-black' : (rank === 2 ? 'bg-gray-300 text-black' : 'bg-yellow-600 text-white')}`}>
                        #{rank}
                    </div>
                    <img src={photo} alt={displayName} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover ring-4 ring-white/20" />
                    <h3 className="text-2xl font-bold">{displayName}</h3>
                </div>
                <div className="mt-4 bg-white/5 p-3 rounded-lg">
                    <p className="text-sm opacity-80">Score</p>
                    <p className="text-xl font-semibold">{winner.scoreObtained} / {winner.totalScore}</p>
                </div>
            </div>
        </div>
    );
}

const ProfessionalConfetti: React.FC = () => {
    const colors = ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'];
    const confettiCount = 30;

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="professional-confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 15}s`,
                        opacity: Math.random() * 0.5 + 0.3,
                    }}
                />
            ))}
        </div>
    );
}

const ContestWinners: React.FC = () => {
    const { user } = useAuth();
    const { contestId } = useParams<{ contestId: string }>();
    const id = parseInt(contestId || '');
    const contest = contests.find(c => c.id === id);
    const winners = contestWinners.filter(w => w.contestId === id);
    const topWinners = winners.filter(w => w.rank <= 3).sort((a, b) => a.rank - b.rank);
    const currentUserRank = winners.find(w => w.userId === user?.user_id);

    if (!contest) {
        return <div className="text-center py-20"><h2 className="text-2xl font-bold">Contest not found</h2></div>;
    }
    
    return (
        <div className="bg-gradient-to-br from-gray-900 via-brand-navy to-gray-800 min-h-screen py-16 px-4 relative overflow-hidden">
            <ProfessionalConfetti />
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-16">
                     <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight flex items-center justify-center">
                        <TrophyIcon />
                        <span>{contest.name}</span>
                    </h1>
                     <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mt-2">Official Winners</h2>
                </div>

                {topWinners.length > 0 ? (
                     <div className="flex flex-col md:flex-row justify-center items-end gap-4">
                         {topWinners.map((winner, index) => <WinnerCard key={winner.userId} winner={winner} rank={winner.rank} delay={`${index * 150}ms`} />)}
                     </div>
                ) : (
                    <div className="text-center text-gray-300 bg-white/10 p-6 rounded-lg shadow-md max-w-md mx-auto">
                        <p>Winner information is not yet available. Please check back later.</p>
                    </div>
                )}

                {currentUserRank && (
                    <div className="mt-20 bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg max-w-lg mx-auto text-center border border-white/20">
                        <h3 className="text-xl font-bold text-white">Your Result</h3>
                        <p className="text-4xl font-bold text-brand-purple my-2">Rank #{currentUserRank.rank}</p>
                        <p className="text-gray-200 font-semibold">{currentUserRank.scoreObtained} / {currentUserRank.totalScore} Points</p>
                    </div>
                )}
                
                <div className="text-center mt-16">
                    <Link to="/contest" className="px-8 py-3 bg-white/10 text-white font-semibold rounded-md shadow-md hover:bg-white/20 transition-colors border border-white/20">
                       &larr; Back to Contests
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContestWinners;