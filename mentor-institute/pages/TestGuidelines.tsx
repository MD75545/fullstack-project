import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { practiceTests } from '../data/mockData';

const TestGuidelines: React.FC = () => {
    const { testId } = useParams<{ testId: string }>();
    const navigate = useNavigate();
    const test = practiceTests.find(t => t.id === parseInt(testId || ''));

    if (!test) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-brand-navy">Test not found</h2>
                <Link to="/practice" className="mt-4 inline-block text-brand-purple hover:underline">Back to Practice Tests</Link>
            </div>
        );
    }

    const handleStartTest = () => {
        navigate(`/test/${test.id}/start`);
    };

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
