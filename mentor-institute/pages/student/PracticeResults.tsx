import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { practiceTestResults, practiceTests } from '../../data/mockData';
import PracticeHistoryModal from '../../components/PracticeHistoryModal';
import type { PracticeTestResult } from '../../types';
import { useSearch } from '../../context/SearchContext';

const PracticeResults: React.FC = () => {
    const { user } = useAuth();
    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
    const { searchQuery } = useSearch();

    const userResults = useMemo(() =>
        practiceTestResults.filter(r => r.userId === user?.id), [user?.id]);
    
    const getTestName = (testId: number) => practiceTests.find(t => t.id === testId)?.name || 'Unknown Test';

    const groupedResults = useMemo(() => {
        const groups: { [key: number]: PracticeTestResult[] } = {};
        userResults.forEach(result => {
            if (!groups[result.testId]) {
                groups[result.testId] = [];
            }
            groups[result.testId].push(result);
        });

        const allGroups = Object.values(groups).map(group => {
            const sortedGroup = [...group].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return sortedGroup;
        });

        if (!searchQuery) {
            return allGroups;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        return allGroups.filter(group => 
            getTestName(group[0].testId).toLowerCase().includes(lowercasedQuery)
        );

    }, [userResults, searchQuery]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Practice Test Results ({groupedResults.length})</h2>
                {userResults.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                           <thead className="bg-slate-100">
                               <tr>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr.No</th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attempts</th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Highest Score</th>
                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Attempt</th>
                                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                               </tr>
                           </thead>
                           <tbody className="bg-white divide-y divide-slate-200">
                                {groupedResults.length > 0 ? groupedResults.map((testGroup, index) => {
                                    const latestAttempt = testGroup[0];
                                    const highestScore = Math.max(...testGroup.map(t => t.scoreObtained));
                                    return (
                                        <tr key={latestAttempt.testId} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap font-semibold">{getTestName(latestAttempt.testId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{testGroup.length}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{highestScore} / {latestAttempt.totalScore}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(latestAttempt.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button onClick={() => setSelectedTestId(latestAttempt.testId)} className="px-4 py-2 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90 font-semibold">
                                                    View History
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">
                                            No results found for your search.
                                        </td>
                                    </tr>
                                )}
                           </tbody>
                        </table>
                    </div>
                ) : ( <p className="text-gray-500">No practice tests attempted yet.</p> )}
            </div>
            {selectedTestId && (
                <PracticeHistoryModal
                    testId={selectedTestId}
                    attempts={userResults.filter(r => r.testId === selectedTestId)}
                    onClose={() => setSelectedTestId(null)}
                />
            )}
        </>
    );
}

export default PracticeResults;
