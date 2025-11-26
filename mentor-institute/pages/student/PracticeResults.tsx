import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserTestResults } from '../../services/api';
import PracticeHistoryModal from '../../components/PracticeHistoryModal';
import { useSearch } from '../../context/SearchContext';

interface TestResult {
  test_result_id: number;
  user_id: number;
  test_id: number;
  score_obtained: number;
  total_score: number;
  answers: any;
  submitted_at: string;
  rank: number;
  test_name: string;
  test_type: string;
}

const PracticeResults: React.FC = () => {
    const { user } = useAuth();
    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { searchQuery } = useSearch();

    // Fetch user test results from API
    useEffect(() => {
        const fetchTestResults = async () => {
            if (!user) return;

            try {
                setLoading(true);
                setError(null);
                
                const response = await getUserTestResults(user.user_id);
                console.log('Test results response:', response);
                
                if (response.status === 'success') {
                    // Filter for practice tests only
                    const practiceResults = response.data
                        .filter((result: TestResult) => result.test_type === 'practice')
                        .sort((a: TestResult, b: TestResult) => 
                            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
                        );
                    
                    setTestResults(practiceResults);
                } else {
                    throw new Error(response.message || 'Failed to fetch test results');
                }
            } catch (err) {
                console.error('Error fetching test results:', err);
                setError(err instanceof Error ? err.message : 'Failed to load test results');
            } finally {
                setLoading(false);
            }
        };

        fetchTestResults();
    }, [user]);

    // Group results by test_id and get latest attempt for each test
    const groupedResults = React.useMemo(() => {
        const groups: { [key: number]: TestResult[] } = {};
        
        // Group all attempts by test_id
        testResults.forEach(result => {
            if (!groups[result.test_id]) {
                groups[result.test_id] = [];
            }
            groups[result.test_id].push(result);
        });

        // For each test, get only the latest attempt and include all attempts for the modal
        const testGroups = Object.entries(groups).map(([testId, attempts]) => {
            const sortedAttempts = [...attempts].sort((a, b) => 
                new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
            );
            return {
                testId: parseInt(testId),
                latestAttempt: sortedAttempts[0], // Most recent attempt for this test
                allAttempts: sortedAttempts, // All attempts for this test (for modal)
                testName: sortedAttempts[0]?.test_name || 'Unknown Test',
                attemptCount: sortedAttempts.length
            };
        });

        // Sort test groups by most recent attempt date (show all tests, not just top 5)
        const sortedTestGroups = testGroups.sort((a, b) => 
            new Date(b.latestAttempt.submitted_at).getTime() - new Date(a.latestAttempt.submitted_at).getTime()
        );

        return sortedTestGroups;
    }, [testResults]);

    // Filter results based on search query
    const filteredResults = React.useMemo(() => {
        if (!searchQuery) {
            return groupedResults;
        }

        const lowercasedQuery = searchQuery.toLowerCase();
        return groupedResults.filter(group => 
            group.testName.toLowerCase().includes(lowercasedQuery)
        );
    }, [groupedResults, searchQuery]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        // Convert UTC to IST (UTC+5:30)
        const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);
        
        return istDate.toLocaleDateString('en-IN', {
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        });
    };

    const getHighestScore = (attempts: TestResult[]) => {
        return Math.max(...attempts.map(attempt => attempt.score_obtained));
    };

    // Calculate total unique tests attempted
    const totalUniqueTests = React.useMemo(() => {
        const uniqueTestIds = new Set(testResults.map(result => result.test_id));
        return uniqueTestIds.size;
    }, [testResults]);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Practice Test Results</h2>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading test results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Practice Test Results</h2>
                <div className="text-center py-8 text-red-500">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        My Practice Test Results ({filteredResults.length})
                    </h2>
                    {totalUniqueTests > 0 && (
                        <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {totalUniqueTests} test{totalUniqueTests !== 1 ? 's' : ''} attempted
                        </div>
                    )}
                </div>
                
                {testResults.length > 0 ? (
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
                                {filteredResults.length > 0 ? filteredResults.map((testGroup, index) => {
                                    const { latestAttempt, allAttempts, testName, attemptCount } = testGroup;
                                    const highestScore = getHighestScore(allAttempts);
                                    
                                    return (
                                        <tr key={latestAttempt.test_id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-900">{testName}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Test ID: {latestAttempt.test_id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    attemptCount >= 5 ? 'bg-green-100 text-green-800' : 
                                                    attemptCount >= 3 ? 'bg-blue-100 text-blue-800' : 
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`font-bold ${
                                                        highestScore === latestAttempt.total_score ? 'text-green-600' :
                                                        highestScore >= latestAttempt.total_score * 0.7 ? 'text-blue-600' :
                                                        'text-orange-600'
                                                    }`}>
                                                        {highestScore} / {latestAttempt.total_score}
                                                    </span>
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({Math.round((highestScore / latestAttempt.total_score) * 100)}%)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(latestAttempt.submitted_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button 
                                                    onClick={() => setSelectedTestId(latestAttempt.test_id)} 
                                                    className="px-4 py-2 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90 font-semibold transition-colors"
                                                >
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
                ) : ( 
                    <div className="text-center py-8">
                        <p className="text-gray-500">No practice tests attempted yet.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Start practicing to see your results here!
                        </p>
                    </div>
                )}
            </div>

            {/* Practice History Modal */}
            {selectedTestId && (
                <PracticeHistoryModal
                    testId={selectedTestId}
                    attempts={testResults.filter(r => r.test_id === selectedTestId)}
                    onClose={() => setSelectedTestId(null)}
                />
            )}
        </>
    );
}

export default PracticeResults;