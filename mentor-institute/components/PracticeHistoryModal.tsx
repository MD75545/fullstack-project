import React from 'react';
import { useNavigate } from 'react-router-dom';

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

interface PracticeHistoryModalProps {
  testId: number;
  attempts: TestResult[];
  onClose: () => void;
}

// Format date for display (already in IST from backend)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const ProgressGraph: React.FC<{ attempts: TestResult[] }> = ({ attempts }) => {
    if (attempts.length < 2) {
        return <div className="text-center text-gray-500 py-4">Not enough data for a progress graph.</div>;
    }

    const width = 300;
    const height = 150;
    const padding = 30;

    // Sort attempts by date for proper timeline
    const sortedAttempts = [...attempts].sort((a, b) => 
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
    );

    const maxScore = Math.max(...sortedAttempts.map(a => a.total_score), 1);
    const points = sortedAttempts.map((attempt, i) => {
        const x = (i / (sortedAttempts.length - 1)) * (width - padding * 2) + padding;
        const y = height - (attempt.score_obtained / maxScore) * (height - padding * 2) - padding;
        return { x, y, score: attempt.score_obtained, total: attempt.total_score };
    });

    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Y-Axis */}
            <line x1={padding} y1={padding / 2} x2={padding} y2={height - padding} stroke="#d1d5db" strokeWidth="1" />
            <text x={padding - 10} y={padding / 2} fontSize="8" textAnchor="end" fill="#6b7280">{maxScore}</text>
            <text x={padding - 10} y={height - padding} fontSize="8" textAnchor="end" fill="#6b7280">0</text>
            {/* X-Axis */}
            <line x1={padding} y1={height - padding} x2={width - padding / 2} y2={height - padding} stroke="#d1d5db" strokeWidth="1" />

            {/* Path */}
            <path d={pathD} fill="none" stroke="#805AD5" strokeWidth="2" />

            {/* Points */}
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="3" fill="#805AD5" />
                    <title>{`Attempt ${i+1}: ${p.score}/${p.total}`}</title>
                </g>
            ))}
        </svg>
    );
};

const PracticeHistoryModal: React.FC<PracticeHistoryModalProps> = ({ 
    testId, 
    attempts, 
    onClose 
}) => {
    const navigate = useNavigate();
    
    // Sort attempts by submission date (newest first for display) and take only latest 5
    const latestFiveAttempts = [...attempts]
        .sort((a, b) => 
            new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        )
        .slice(0, 5); // Only show latest 5 attempts

    const testName = attempts[0]?.test_name || "Test";

    const calculatePercentage = (scoreObtained: number, totalScore: number) => {
        return totalScore > 0 ? ((scoreObtained / totalScore) * 100).toFixed(2) : '0.00';
    };

    const getHighestScore = (attempts: TestResult[]) => {
        return Math.max(...attempts.map(attempt => attempt.score_obtained));
    };

    const getAverageScore = (attempts: TestResult[]) => {
        const total = attempts.reduce((sum, attempt) => sum + attempt.score_obtained, 0);
        return (total / attempts.length).toFixed(1);
    };

    // Debug function to check time
    const debugTime = (attempt: TestResult) => {
        console.log('Database Time:', attempt.submitted_at);
        console.log('Formatted Display:', formatDate(attempt.submitted_at));
        console.log('---');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-brand-navy">{testName} - Attempt History</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto">
                    {/* Progress Graph Section - Shows all attempts for better visualization */}
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">Progress (All Attempts)</h4>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <ProgressGraph attempts={attempts} />
                        </div>
                    </div>
                    
                    {/* Attempts Details Section - Shows only latest 5 attempts */}
                    <div className="mt-6">
                         <h4 className="font-semibold text-lg text-gray-800 mb-2">
                             Latest 5 Attempts (Total: {attempts.length})
                         </h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attempt #</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Solution</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {latestFiveAttempts.map((attempt, index) => {
                                        // Debug time for first attempt
                                        if (index === 0) {
                                            debugTime(attempt);
                                        }
                                        
                                        return (
                                            <tr key={attempt.test_result_id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{index + 1}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(attempt.submitted_at)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    <span className={`font-semibold ${
                                                        attempt.score_obtained === attempt.total_score ? 'text-green-600' :
                                                        attempt.score_obtained >= attempt.total_score * 0.7 ? 'text-blue-600' :
                                                        'text-orange-600'
                                                    }`}>
                                                        {attempt.score_obtained} / {attempt.total_score}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {calculatePercentage(attempt.score_obtained, attempt.total_score)}%
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    #{attempt.rank || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <button 
                                                        onClick={() => navigate(`/test-results/${attempt.test_result_id}`)}
                                                        className="px-3 py-1 bg-brand-purple text-white text-xs rounded-md hover:bg-opacity-90 font-semibold transition-colors"
                                                    >
                                                        View Solution
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Show message if there are more than 5 attempts */}
                        {attempts.length > 5 && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                                <p className="text-sm text-yellow-700 text-center">
                                    Showing latest 5 of {attempts.length} total attempts. 
                                    The progress graph above shows all {attempts.length} attempts.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Summary Statistics - Based on all attempts */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-blue-800">Best Score</h5>
                            <p className="text-2xl font-bold text-blue-900">
                                {getHighestScore(attempts)} / {attempts[0]?.total_score}
                            </p>
                            <p className="text-sm text-blue-600 mt-1">
                                {calculatePercentage(getHighestScore(attempts), attempts[0]?.total_score)}%
                            </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-green-800">Average Score</h5>
                            <p className="text-2xl font-bold text-green-900">
                                {getAverageScore(attempts)} / {attempts[0]?.total_score}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                {calculatePercentage(parseFloat(getAverageScore(attempts)), attempts[0]?.total_score)}%
                            </p>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-purple-800">Total Attempts</h5>
                            <p className="text-2xl font-bold text-purple-900">
                                {attempts.length}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                            <h5 className="text-sm font-medium text-orange-800">Improvement</h5>
                            <p className="text-2xl font-bold text-orange-900">
                                {attempts.length > 1 ? 
                                    `${(getHighestScore(attempts) - attempts[attempts.length - 1].score_obtained)} points` : 
                                    'N/A'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Close Button */}
                <div className="mt-6 flex justify-end pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PracticeHistoryModal;