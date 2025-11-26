import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTestWithQuestions, submitTestResult } from '../services/api';

interface Question {
  question_id: number;
  test_id: number;
  text: string;
  options: Array<{
    id: number;
    text: string;
  }>;
  correct_option_id: number;
}

interface Test {
  test_id: number;
  name: string;
  category_id: number;
  type: string;
  duration_minutes: number;
  start_time?: string;
  entry_fee?: number;
  prize_money?: number;
  min_participants?: number;
  category?: {
    test_category_id: number;
    name: string;
  };
  questions: Question[];
}

// --- Reusable Components for Result Screen ---

const Confetti: React.FC = () => {
    const colors = ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'];
    const confettiCount = 50;
    
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 5}s`,
                        width: `${Math.floor(Math.random() * 6) + 8}px`,
                        height: `${Math.floor(Math.random() * 4) + 6}px`,
                        transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                />
            ))}
        </div>
    );
};

const TestResultScreen: React.FC<{ 
  score: { obtained: number; total: number }; 
  onBack: () => void; 
  message: string; 
  testName: string;
}> = ({ score, onBack, message, testName }) => {
    const percentage = score.total > 0 ? (score.obtained / score.total) * 100 : 0;
    const passed = percentage >= 50;

    const SuccessIcon = () => (
        <svg className="mx-auto h-16 w-16 text-green-500 animate-result-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );

    const FailureIcon = () => (
         <svg className="mx-auto h-16 w-16 text-red-500 animate-result-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
    );

    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] flex items-center justify-center py-12 relative overflow-hidden">
            {passed && <Confetti />}
            <div className="relative max-w-md mx-auto px-4 text-center bg-white p-10 rounded-lg shadow-lg z-10">
                {passed ? <SuccessIcon /> : <FailureIcon />}
                <h1 className="text-3xl font-bold text-brand-navy mt-4">{passed ? "Congratulations!" : "Completed!"}</h1>
                <p className="text-gray-600 mt-2">{testName}</p>
                <p className="text-gray-600 text-sm mt-1">{passed ? `You passed the test!` : `Better luck next time!`}</p>
                
                <div className="mt-6 animate-score-pop">
                    <p className="text-gray-600 text-lg">You Scored</p>
                    <p className="text-5xl font-bold text-brand-purple my-2">{score.obtained} / {score.total}</p>
                    <p className="text-lg font-semibold text-gray-700">({percentage.toFixed(2)}%)</p>
                </div>

                <button onClick={onBack} className="mt-8 px-8 py-3 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90">
                    {message}
                </button>
            </div>
        </div>
    );
};

// Confirmation Modal Component
const ConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-brand-navy">Confirm Submission</h3>
            <p className="my-4 text-gray-600">Are you sure you want to submit the test?</p>
            <div className="flex justify-center gap-4">
                <button onClick={onCancel} className="px-6 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90">Submit</button>
            </div>
        </div>
    </div>
);

const TestScreen: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState<{ obtained: number; total: number } | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);

    // Replace the parseOptions function with this corrected version:
const parseOptions = (options: any): Array<{ id: number; text: string }> => {
    console.log('Parsing options:', options);
    
    if (Array.isArray(options)) {
        // If it's already an array of objects with id and text
        if (options.length > 0 && typeof options[0] === 'object' && options[0].id !== undefined) {
            return options;
        }
        // If it's an array of strings, convert to objects with id and text
        else if (options.length > 0 && typeof options[0] === 'string') {
            return options.map((optionText: string, index: number) => ({
                id: index + 1,
                text: optionText
            }));
        }
    }
    
    if (typeof options === 'string') {
        try {
            const parsed = JSON.parse(options);
            console.log('Parsed JSON options:', parsed);
            
            if (Array.isArray(parsed)) {
                // If it's an array of strings, convert to objects
                if (parsed.length > 0 && typeof parsed[0] === 'string') {
                    return parsed.map((optionText: string, index: number) => ({
                        id: index + 1,
                        text: optionText
                    }));
                }
                // If it's already an array of objects, return as is
                else if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].id !== undefined) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error('Error parsing options:', e);
        }
    }
    
    // Return default options if parsing fails
    return [
        { id: 1, text: 'Option 1' },
        { id: 2, text: 'Option 2' },
        { id: 3, text: 'Option 3' },
        { id: 4, text: 'Option 4' }
    ];
};

    // Fetch test data from API
    useEffect(() => {
        const fetchTestData = async () => {
            if (!testId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await getTestWithQuestions(parseInt(testId));
                console.log('Full test response:', response);
                
                if (response.status === 'success') {
                    const testData = response.data;
                    
                    // Parse questions and their options
                    const parsedQuestions = testData.questions.map((question: any) => {
                        const parsedOptions = parseOptions(question.options);
                        console.log(`Question ${question.question_id} options:`, parsedOptions);
                        
                        return {
                            ...question,
                            options: parsedOptions
                        };
                    });

                    console.log('All parsed questions:', parsedQuestions);
                    
                    setTest(testData);
                    setQuestions(parsedQuestions);
                    setTimeLeft(testData.duration_minutes * 60);
                } else {
                    throw new Error(response.message || 'Failed to fetch test');
                }

            } catch (err) {
                console.error('Error fetching test data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load test');
            } finally {
                setLoading(false);
            }
        };

        fetchTestData();
    }, [testId]);

    const confirmSubmit = async () => {
        if (isSubmitted || !user || !test) return;

        try {
            setIsSubmitting(true);

            const resultData = {
                user_id: user.user_id,
                test_id: test.test_id,
                answers: answers
            };

            const response = await submitTestResult(resultData);
            
            if (response.status === 'success') {
                setScore({ 
                    obtained: response.data.score_obtained, 
                    total: response.data.total_score 
                });
                setIsSubmitted(true);
            } else {
                throw new Error(response.message || 'Failed to submit test');
            }

        } catch (err) {
            console.error('Error submitting test:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit test');
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmSubmitRef = useRef(confirmSubmit);
    useEffect(() => {
        confirmSubmitRef.current = confirmSubmit;
    });

    // Timer effect
    useEffect(() => {
        if (!test || isSubmitted || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    confirmSubmitRef.current();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [test, isSubmitted, timeLeft]);

    // Track visited questions
    useEffect(() => {
        setVisited(prev => new Set(prev).add(currentQuestionIndex));
    }, [currentQuestionIndex]);

    if (loading) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading test...</p>
                </div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="text-center py-20 bg-brand-light min-h-[calc(100vh-128px)]">
                <div className="bg-white p-8 max-w-lg mx-auto rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-navy">
                        {error || 'Test not found.'}
                    </h2>
                    <Link to="/practice" className="mt-4 inline-block text-brand-purple hover:underline">
                        Back to Practice Tests
                    </Link>
                </div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="text-center py-20 bg-brand-light min-h-[calc(100vh-128px)]">
                <div className="bg-white p-8 max-w-lg mx-auto rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-navy">No Questions Available</h2>
                    <p className="mt-2 text-gray-600">This test doesn't have any questions yet.</p>
                    <Link to="/practice" className="mt-4 inline-block text-brand-purple hover:underline">
                        Back to Practice Tests
                    </Link>
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const questionsLeft = questions.length - answeredCount;

    // Get current question options - with fallback
    const currentQuestionOptions = currentQuestion?.options || [];

    const handleAnswerSelect = (questionId: number, optionId: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleQuestionJump = (index: number) => {
        setCurrentQuestionIndex(index);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handleSubmit = () => {
        setIsSubmitting(true);
    };
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (isSubmitted && score) {
        return (
            <TestResultScreen
                score={score}
                onBack={() => navigate('/practice')}
                message="Back to Practice Tests"
                testName={test.name}
            />
        );
    }

    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-4 mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-brand-navy">{test.name}</h1>
                        <div className="flex items-center gap-4">
                             <div className={`flex items-center gap-2 font-semibold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formatTime(timeLeft)}</span>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-brand-navy">{questionsLeft} Questions Left</p>
                            </div>
                        </div>
                    </div>

                    {/* Question Palette */}
                    <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-50 rounded-md">
                        {questions.map((q, index) => {
                            const isCurrent = index === currentQuestionIndex;
                            const hasAnswered = answers[q.question_id] !== undefined;
                            const hasVisited = visited.has(index);
                            
                            let bgColor = 'bg-gray-200 hover:bg-gray-300';
                            if (hasAnswered) bgColor = 'bg-green-500 hover:bg-green-600 text-white';
                            else if (hasVisited) bgColor = 'bg-yellow-400 hover:bg-yellow-500 text-white';
                            if (isCurrent) bgColor = 'bg-brand-purple text-white ring-2 ring-offset-2 ring-brand-purple';

                            return (
                                <button 
                                    key={q.question_id} 
                                    onClick={() => handleQuestionJump(index)} 
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${bgColor}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Question Area */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Question {currentQuestionIndex + 1}: {currentQuestion.text}
                        </h2>
                        
                        {currentQuestionOptions.length > 0 ? (
                            <div className="space-y-3">
                                {currentQuestionOptions.map(option => (
                                    <label 
                                        key={option.id} 
                                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-purple-50 transition-colors"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestion.question_id}`}
                                            value={option.id}
                                            checked={answers[currentQuestion.question_id] === option.id}
                                            onChange={() => handleAnswerSelect(currentQuestion.question_id, option.id)}
                                            className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300"
                                        />
                                        <span className="ml-3 text-gray-700">{option.text}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No options available for this question.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Navigation */}
                    <div className="mt-8 flex justify-between">
                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className={`px-6 py-2 font-semibold rounded-md ${
                                currentQuestionIndex === 0 
                                    ? 'bg-gray-300 cursor-not-allowed' 
                                    : 'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                        >
                            Previous
                        </button>
                        
                        {currentQuestionIndex === questions.length - 1 ? (
                            <button 
                                onClick={handleSubmit} 
                                className="px-8 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 transition-colors"
                            >
                                Submit Test
                            </button>
                        ) : (
                            <button 
                                onClick={handleNext} 
                                className="px-8 py-3 bg-brand-purple text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isSubmitting && (
                <ConfirmationModal 
                    onConfirm={confirmSubmit} 
                    onCancel={() => setIsSubmitting(false)} 
                />
            )}
        </div>
    );
};

export default TestScreen;