import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { practiceTestResults, contestResults, questions, practiceTests, contests } from '../data/mockData';

const SolutionScreen: React.FC = () => {
    const { resultType, resultId } = useParams<{ resultType: 'practice' | 'contest'; resultId: string }>();

    const result = useMemo(() => {
        const id = parseInt(resultId || '');
        if (resultType === 'practice') {
            return practiceTestResults.find(r => r.id === id);
        }
        return contestResults.find(r => r.id === id);
    }, [resultType, resultId]);

    // Fix: Used a type guard to safely access either 'testId' or 'contestId'.
    const testId = result ? ('testId' in result ? result.testId : result.contestId) : null;
    const testQuestions = useMemo(() => questions.filter(q => q.testId === testId), [testId]);
    
    if (!result || !testId || testQuestions.length === 0) {
        const backLink = resultType === 'practice' ? '/practice' : '/contest';
        return (
            <div className="text-center py-20 bg-brand-light min-h-[calc(100vh-128px)]">
                <div className="bg-white p-8 max-w-lg mx-auto rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-navy">Result not found.</h2>
                    <Link to={backLink} className="mt-4 inline-block text-brand-purple hover:underline">Go Back</Link>
                </div>
            </div>
        );
    }
    
    const testName = resultType === 'practice' 
        ? practiceTests.find(t => t.id === testId)?.name
        : contests.find(c => c.id === testId)?.name;

    const userAnswers = result.answers;
    const attemptedCount = Object.keys(userAnswers).length;
    const notAttemptedCount = testQuestions.length - attemptedCount;

    return (
        <div className="bg-brand-light py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-brand-navy mb-2">Solution for: {testName}</h1>
                <p className="text-lg text-gray-600 mb-6">Review your answers below.</p>

                <div className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-brand-navy">{testQuestions.length}</p>
                        <p className="text-sm text-gray-500">Total Questions</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{result.scoreObtained}</p>
                        <p className="text-sm text-gray-500">Correct</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{attemptedCount}</p>
                        <p className="text-sm text-gray-500">Attempted</p>
                    </div>
                     <div>
                        <p className="text-2xl font-bold text-yellow-600">{notAttemptedCount}</p>
                        <p className="text-sm text-gray-500">Not Attempted</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {testQuestions.map((q, index) => {
                        const userAnswerId = userAnswers[q.id];
                        const isCorrect = userAnswerId === q.correctOptionId;

                        return (
                            <div key={q.id} className="bg-white p-6 rounded-lg shadow-md">
                                 <h3 className="font-semibold text-gray-800 text-lg">Question {index + 1}: {q.text}</h3>
                                 <div className="space-y-3 mt-4">
                                    {q.options.map(opt => {
                                        const isUserAnswer = opt.id === userAnswerId;
                                        const isCorrectAnswer = opt.id === q.correctOptionId;
                                        
                                        let optionClass = 'border-gray-300';
                                        if (isCorrectAnswer) {
                                            optionClass = 'bg-green-100 border-green-500 text-green-900 font-semibold';
                                        } else if (isUserAnswer && !isCorrect) {
                                            optionClass = 'bg-red-100 border-red-500 text-red-900';
                                        }

                                        return (
                                            <div key={opt.id} className={`p-3 border rounded-md transition-colors flex justify-between items-center ${optionClass}`}>
                                                <span>{opt.text}</span>
                                                <div className="text-xs font-bold uppercase">
                                                    {isCorrectAnswer && <span>✓ Correct</span>}
                                                    {isUserAnswer && !isCorrect && <span>✗ Your Answer</span>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                 </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default SolutionScreen;