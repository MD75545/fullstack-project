import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTestResultDetails, getTestWithQuestions } from '../services/api';

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

interface TestResult {
  test_result_id: number;
  user_id: number;
  test_id: number;
  score_obtained: number;
  total_score: number;
  answers: Record<number, number> | string;
  submitted_at: string;
  rank: number;
  test_name: string;
  test_type: string;
  questions?: Question[];
}

const SolutionScreen: React.FC = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const [result, setResult] = useState<TestResult | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResultDetails = async () => {
            if (!resultId) {
                setError('Result ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                console.log('Fetching result details for ID:', resultId);
                
                // Fetch test result details
                const response = await getTestResultDetails(parseInt(resultId));
                console.log('Result details response:', response);
                
                if (response.status === 'success') {
                    const resultData = response.data;
                    setResult(resultData);
                    
                    // If questions are included in the result, use them
                    if (resultData.questions && resultData.questions.length > 0) {
                        console.log('Using questions from result:', resultData.questions);
                        setQuestions(resultData.questions);
                    } else {
                        // Fetch test questions separately
                        console.log('Fetching questions separately for test ID:', resultData.test_id);
                        const testResponse = await getTestWithQuestions(resultData.test_id);
                        if (testResponse.status === 'success') {
                            const questionsData = testResponse.data.questions || [];
                            console.log('Fetched questions:', questionsData);
                            setQuestions(questionsData);
                        } else {
                            throw new Error('Failed to fetch test questions');
                        }
                    }
                } else {
                    throw new Error(response.message || 'Failed to fetch result details');
                }
            } catch (err) {
                console.error('Error fetching result details:', err);
                setError(err instanceof Error ? err.message : 'Failed to load result details');
            } finally {
                setLoading(false);
            }
        };

        fetchResultDetails();
    }, [resultId]);

    // Helper function to parse options
    const parseOptions = (options: any): Array<{ id: number; text: string }> => {
        console.log('Parsing options:', options);
        
        if (Array.isArray(options)) {
            if (options.length > 0 && typeof options[0] === 'object' && options[0].id !== undefined) {
                return options;
            }
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
                if (Array.isArray(parsed)) {
                    if (parsed.length > 0 && typeof parsed[0] === 'string') {
                        return parsed.map((optionText: string, index: number) => ({
                            id: index + 1,
                            text: optionText
                        }));
                    }
                    else if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0].id !== undefined) {
                        return parsed;
                    }
                }
            } catch (e) {
                console.error('Error parsing options:', e);
            }
        }
        
        return [
            { id: 1, text: 'Option 1' },
            { id: 2, text: 'Option 2' },
            { id: 3, text: 'Option 3' },
            { id: 4, text: 'Option 4' }
        ];
    };

    // Parse user answers
    const parseUserAnswers = (): Record<number, number> => {
        if (!result) return {};
        
        try {
            if (typeof result.answers === 'string') {
                return JSON.parse(result.answers);
            }
            return result.answers as Record<number, number>;
        } catch (e) {
            console.error('Error parsing user answers:', e);
            return {};
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading solution...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="text-center py-20 bg-brand-light min-h-[calc(100vh-128px)]">
                <div className="bg-white p-8 max-w-lg mx-auto rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-brand-navy">
                        {error || 'Result not found.'}
                    </h2>
                    <p className="mt-2 text-gray-600">Result ID: {resultId}</p>
                    <Link 
                        to="/student-dashboard" 
                        className="mt-4 inline-block px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const userAnswers = parseUserAnswers();
    const attemptedCount = Object.keys(userAnswers).length;
    const notAttemptedCount = questions.length - attemptedCount;
    const correctCount = result.score_obtained;
    const incorrectCount = attemptedCount - correctCount;

    // Convert UTC to IST for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const istDate = new Date(date.getTime() + (5 * 60 + 30) * 60 * 1000);
        
        return istDate.toLocaleString('en-IN', {
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        });
    };

    return (
        <div className="bg-brand-light py-12 min-h-[calc(100vh-128px)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h1 className="text-3xl font-bold text-brand-navy mb-2">
                        Solution: {result.test_name}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        Submitted on: {formatDate(result.submitted_at)}
                    </p>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{questions.length}</p>
                            <p className="text-sm text-gray-600">Total Questions</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                            <p className="text-sm text-gray-600">Correct</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{incorrectCount}</p>
                            <p className="text-sm text-gray-600">Incorrect</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{attemptedCount}</p>
                            <p className="text-sm text-gray-600">Attempted</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{notAttemptedCount}</p>
                            <p className="text-sm text-gray-600">Not Attempted</p>
                        </div>
                    </div>

                    {/* Overall Score */}
                    <div className="mt-6 text-center">
                        <p className="text-xl font-semibold text-gray-700">
                            Overall Score: <span className="text-brand-purple">{result.score_obtained} / {result.total_score}</span>
                        </p>
                        <p className="text-lg text-gray-600">
                            Percentage: {((result.score_obtained / result.total_score) * 100).toFixed(2)}%
                        </p>
                        {result.rank && (
                            <p className="text-lg text-gray-600">
                                Rank: #{result.rank}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Questions and Answers */}
                <div className="space-y-6">
                    {questions.length > 0 ? questions.map((question, index) => {
                        const userAnswerId = userAnswers[question.question_id];
                        const isCorrect = userAnswerId === question.correct_option_id;
                        const parsedOptions = parseOptions(question.options);

                        return (
                            <div key={question.question_id} className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="font-semibold text-gray-800 text-lg mb-4">
                                    Question {index + 1}: {question.text}
                                </h3>
                                
                                <div className="space-y-3">
                                    {parsedOptions.map(option => {
                                        const isUserAnswer = option.id === userAnswerId;
                                        const isCorrectAnswer = option.id === question.correct_option_id;
                                        
                                        let optionClass = 'border-gray-300 bg-white';
                                        if (isCorrectAnswer) {
                                            optionClass = 'bg-green-100 border-green-500 text-green-900 font-semibold';
                                        } else if (isUserAnswer && !isCorrect) {
                                            optionClass = 'bg-red-100 border-red-500 text-red-900';
                                        }

                                        return (
                                            <div 
                                                key={option.id} 
                                                className={`p-4 border-2 rounded-md transition-colors flex justify-between items-center ${optionClass}`}
                                            >
                                                <span className="flex-1">{option.text}</span>
                                                <div className="text-xs font-bold uppercase ml-4">
                                                    {isCorrectAnswer && <span className="text-green-700">✓ Correct Answer</span>}
                                                    {isUserAnswer && !isCorrect && <span className="text-red-700">✗ Your Answer</span>}
                                                    {isUserAnswer && isCorrect && <span className="text-green-700">✓ Your Answer</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Answer Explanation */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                                    <p className="font-semibold text-gray-700">
                                        Your Answer: {userAnswerId ? parsedOptions.find(opt => opt.id === userAnswerId)?.text || 'Not found' : 'Not attempted'}
                                    </p>
                                    <p className="font-semibold text-green-700 mt-2">
                                        Correct Answer: {parsedOptions.find(opt => opt.id === question.correct_option_id)?.text || 'Not found'}
                                    </p>
                                    <p className={`mt-2 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                        {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                    </p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-8 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">No questions available for this test.</p>
                        </div>
                    )}
                </div>

                {/* Back Button */}
                <div className="mt-8 text-center">
                    <Link 
                        to="/student-dashboard" 
                        className="inline-block px-6 py-3 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SolutionScreen;