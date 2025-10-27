import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { contestResults, contests } from '../../data/mockData';
import { useSearch } from '../../context/SearchContext';

const ContestResults: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { searchQuery } = useSearch();

    const getContestName = (contestId: number) => contests.find(c => c.id === contestId)?.name || 'Unknown Contest';
    
    const filteredUserResults = useMemo(() => {
        const allResults = contestResults.filter(r => r.userId === user?.id);
        if (!searchQuery) {
            return allResults;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allResults.filter(result => 
            getContestName(result.contestId).toLowerCase().includes(lowercasedQuery)
        );
    }, [user?.id, searchQuery]);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Contest Results ({filteredUserResults.length})</h2>
            {contestResults.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr.No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contest Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredUserResults.length > 0 ? filteredUserResults.map((result, index) => (
                                <tr key={result.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{getContestName(result.contestId)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(result.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{result.scoreObtained} / {result.totalScore}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-brand-purple">#{result.rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => navigate(`/solution/contest/${result.id}`)} className="px-4 py-2 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90 font-semibold">
                                            View Solution
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No results found for your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (<p className="text-gray-500">No contests attempted yet.</p>)}
        </div>
    );
};

export default ContestResults;
