import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getTestById } from '../services/api';

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
}

const TestGuidelines: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const [test, setTest] = useState<Test | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) return;

            try {
                setLoading(true);
                setError(null);
                
                const response = await getTestById(parseInt(testId));
                
                if (response.status === 'success') {
                    setTest(response.data);
                } else {
                    throw new Error(response.message || 'Failed to fetch test');
                }
                
            } catch (err) {
                console.error('Error fetching test:', err);
                setError(err instanceof Error ? err.message : 'Failed to load test');
            } finally {
                setLoading(false);
            }
        };

        fetchTest();
    }, [testId]);

    const handleStartTest = () => {
        if (test) {
            navigate(`/test/${test.test_id}/start`);
        }
    };

    if (loading) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading test guidelines...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-brand-navy">Test not found</h2>
                        <p className="mt-2 text-gray-600">{error || 'The test you are looking for does not exist.'}</p>
                        <Link to="/practice" className="mt-4 inline-block text-brand-purple hover:underline">
                            Back to Practice Tests
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-light min-h-[calc(100vh-128px)] py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-brand-navy text-center mb-2">Test Guidelines</h1>
                    <h2 className="text-xl font-semibold text-gray-700 text-center mb-6">{test.name}</h2>

                    <div className="prose max-w-none mx-auto text-gray-600">
                        <p>Please read the following instructions carefully before starting the test:</p>
                        <ul>
                            <li>This is a timed test. The timer will start as soon as you click the "Start Test" button.</li>
                            <li>Total duration: <strong>{test.duration_minutes} minutes</strong></li>
                            <li>Ensure you have a stable internet connection.</li>
                            <li>Do not refresh the page during the test, as your progress may be lost.</li>
                            <li>Once you submit an answer, you cannot go back and change it.</li>
                            <li>The test will be automatically submitted when the time runs out.</li>
                        </ul>
                        <p className="font-semibold">All the best!</p>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            onClick={handleStartTest}
                            className="px-8 py-3 bg-brand-purple text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors"
                        >
                            Start Test
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestGuidelines;