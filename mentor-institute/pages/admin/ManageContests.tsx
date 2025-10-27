import React, { useState, useMemo } from 'react';
import { contests, contestResults, users } from '../../data/mockData';
import type { Contest, Student } from '../../types';
import { useSearch } from '../../context/SearchContext';

// Modal Component for showing registered students
const RegisteredStudentsModal: React.FC<{ contest: Contest; onClose: () => void; }> = ({ contest, onClose }) => {
    const registeredStudents = useMemo(() => {
        const studentIds = contestResults
            .filter(result => result.contestId === contest.id)
            .map(result => result.userId);
        
        return users.filter(user => user.role === 'student' && studentIds.includes(user.id)) as Student[];
    }, [contest.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h3 className="text-xl font-bold text-brand-navy">Registered Students for {contest.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                {registeredStudents.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Name</th>
                                    <th className="py-2 px-4 border-b text-left">Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registeredStudents.map(student => (
                                    <tr key={student.id}>
                                        <td className="py-2 px-4 border-b">{student.name}</td>
                                        <td className="py-2 px-4 border-b">{student.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No students have registered for this contest yet.</p>
                )}
            </div>
        </div>
    );
};


const ManageContests: React.FC = () => {
    const [viewingStudentsFor, setViewingStudentsFor] = useState<Contest | null>(null);
    const { searchQuery } = useSearch();

    const contestsWithStudentCount = useMemo(() => {
        const allContests = contests.map(contest => {
            const registeredCount = contestResults.filter(r => r.contestId === contest.id).length;
            const studentsNeeded = Math.max(0, contest.minParticipants - registeredCount);
            return {
                ...contest,
                registeredCount,
                studentsNeeded,
            };
        });
        if (!searchQuery) {
            return allContests;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return allContests.filter(c => c.name.toLowerCase().includes(lowercasedQuery));
    }, [searchQuery]);
    
    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h2 className="text-xl font-bold text-gray-800">Contests List ({contestsWithStudentCount.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Contest Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Participants (Min/Reg)</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Needed</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contestsWithStudentCount.map(contest => (
                                <tr key={contest.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 border-b border-slate-200 font-semibold">{contest.name}</td>
                                    <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">{new Date(contest.date).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 border-b border-slate-200">{contest.minParticipants} / {contest.registeredCount}</td>
                                    <td className={`py-3 px-4 border-b border-slate-200 font-bold`}>
                                        <span className={`px-2 py-1 text-xs rounded-full ${contest.studentsNeeded > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {contest.studentsNeeded > 0 ? `${contest.studentsNeeded} more` : 'Goal Met'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        <button onClick={() => setViewingStudentsFor(contest)} className="px-3 py-1 bg-brand-purple text-white text-sm rounded-md hover:bg-opacity-90 font-semibold">
                                            View Students
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contestsWithStudentCount.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No contests found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {viewingStudentsFor && (
                <RegisteredStudentsModal
                    contest={viewingStudentsFor}
                    onClose={() => setViewingStudentsFor(null)}
                />
            )}
        </>
    );
};

export default ManageContests;
