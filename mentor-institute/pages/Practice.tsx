import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { practiceTests, testCategories } from '../data/mockData';
import LoginModal from '../components/LoginModal';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const Practice: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

    const { user } = useAuth();
    const navigate = useNavigate();

    const filteredTests = useMemo(() => {
        return practiceTests.filter(test => {
            const matchesCategory = selectedCategory === 'all' || test.categoryId === parseInt(selectedCategory);
            const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const handleStartTestClick = (testId: number) => {
        if (user) {
            navigate(`/test/${testId}/guidelines`);
        } else {
            setSelectedTestId(testId);
            setIsLoginModalOpen(true);
        }
    };

    const onLoginSuccess = () => {
        setIsLoginModalOpen(false);
        if (selectedTestId) {
            navigate(`/test/${selectedTestId}/guidelines`);
        }
    };

    const getCategoryName = (categoryId: number): string => {
        return testCategories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    return (
        <>
        <div className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">Practice Tests</h2>
                </div>

                {/* Filters */}
                <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 gap-4 items-end">
                    <div className="relative">
                        <label htmlFor="search-test" className="block text-sm font-medium text-gray-700">Search Test</label>
                         <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                id="search-test"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="focus:ring-brand-purple focus:border-brand-purple block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                placeholder="Search by test name..."
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            id="category-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
                        >
                            <option value="all">All Categories</option>
                            {testCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Test Table */}
                <div className="mt-8 max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12 sm:w-16">Sr.No</th>
                                    <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Category</th>
                                    <th scope="col" className="relative px-2 sm:px-6 py-3"><span className="sr-only">Start Test</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTests.length > 0 ? filteredTests.map((test, index) => (
                                    <tr key={test.id} className="hover:bg-gray-50">
                                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs sm:text-sm text-gray-800 font-semibold">{test.name}</div>
                                            <div className="text-xs text-gray-500 sm:hidden mt-1">
                                                {getCategoryName(test.categoryId)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{getCategoryName(test.categoryId)}</td>
                                        <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleStartTestClick(test.id)}
                                                className="text-white bg-brand-purple hover:bg-opacity-90 font-bold py-1 px-3 sm:py-2 sm:px-4 rounded text-xs sm:text-sm"
                                            >
                                                Start
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                            No tests found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="text-center mt-12">
                    <p className="max-w-2xl mx-auto text-lg text-gray-600 italic">
                        "The only way to learn a new programming language is by writing programs in it." - Dennis Ritchie
                    </p>
                </div>
            </div>
        </div>
        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} onSuccess={onLoginSuccess} showSignUp={true} />}
        </>
    );
};

export default Practice;