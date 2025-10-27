import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { PracticeTestResult } from '../types';
import { practiceTests } from '../data/mockData';

const ProgressGraph: React.FC<{ attempts: PracticeTestResult[] }> = ({ attempts }) => {
    if (attempts.length < 2) {
        return <div className="text-center text-gray-500 py-4">Not enough data for a progress graph.</div>;
    }

    const width = 300;
    const height = 150;
    const padding = 30;

    const maxScore = Math.max(...attempts.map(a => a.totalScore), 1);
    const points = attempts.map((attempt, i) => {
        const x = (i / (attempts.length - 1)) * (width - padding * 2) + padding;
        const y = height - (attempt.scoreObtained / maxScore) * (height - padding * 2) - padding;
        return { x, y, score: attempt.scoreObtained, total: attempt.totalScore };
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

const PracticeHistoryModal: React.FC<{
    testId: number;
    attempts: PracticeTestResult[];
    onClose: () => void;
}> = ({ testId, attempts, onClose }) => {
    const navigate = useNavigate();
    const testName = practiceTests.find(t => t.id === testId)?.name || "Test";
    const sortedAttempts = [...attempts].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-brand-navy">{testName} - Attempt History</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="overflow-y-auto">
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800 mb-2">Progress</h4>
                        <div className="p-4 bg-gray-50 rounded-md">
                            <ProgressGraph attempts={sortedAttempts} />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                         <h4 className="font-semibold text-lg text-gray-800 mb-2">Details</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Solution</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedAttempts.slice().reverse().map(attempt => (
                                        <tr key={attempt.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(attempt.date)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">{attempt.scoreObtained} / {attempt.totalScore}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <button onClick={() => navigate(`/solution/practice/${attempt.id}`)} className="text-brand-purple hover:underline text-sm font-semibold">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticeHistoryModal;
