import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, courses as initialCourses } from '../../data/mockData';
import type { Course, Subject, Topic } from '../../types';
import { useSearch } from '../../context/SearchContext';

// Modal Component
interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-navy">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            {children}
        </div>
    </div>
);

const ManageSyllabus: React.FC = () => {
    const { user } = useAuth();
    const { searchQuery } = useSearch();
    const [courses, setCourses] = useState<Course[]>(initialCourses);

    const [addSubjectModal, setAddSubjectModal] = useState<{ isOpen: boolean, courseId: number | null }>({ isOpen: false, courseId: null });
    const [addTopicModal, setAddTopicModal] = useState<{ isOpen: boolean, courseId: number | null, subject: Subject | null }>({ isOpen: false, courseId: null, subject: null });
    
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newTopicName, setNewTopicName] = useState('');

    const teacherCourses = useMemo(() => {
        const studentCourses = users
            .filter(u => u.role === 'student' && 'teacherId' in u && u.teacherId === user?.id)
            .map(s => (s as any).courseId);
        const uniqueCourseIds = [...new Set(studentCourses)];
        const assignedCourses = courses.filter(c => uniqueCourseIds.includes(c.id));

        if (!searchQuery) {
            return assignedCourses;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return assignedCourses.filter(c => c.title.toLowerCase().includes(lowercasedQuery));
    }, [user, courses, searchQuery]);

    const handleToggleTopic = (courseId: number, subjectId: number, topicId: number) => {
        setCourses(prevCourses =>
            prevCourses.map(course =>
                course.id === courseId
                    ? {
                        ...course,
                        syllabus: course.syllabus?.map(subject =>
                            subject.id === subjectId
                                ? {
                                    ...subject,
                                    topics: subject.topics.map(topic =>
                                        topic.id === topicId ? { ...topic, completed: !topic.completed } : topic
                                    ),
                                }
                                : subject
                        ),
                    }
                    : course
            )
        );
    };
    
    const handleAddSubjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubjectName.trim() || !addSubjectModal.courseId) return;
        
        setCourses(prevCourses => prevCourses.map(course => {
            if (course.id === addSubjectModal.courseId) {
                const newSyllabus: Subject = {
                    id: Date.now(),
                    name: newSubjectName,
                    topics: [],
                };
                return { ...course, syllabus: [...(course.syllabus || []), newSyllabus] };
            }
            return course;
        }));
        
        setNewSubjectName('');
        setAddSubjectModal({ isOpen: false, courseId: null });
    };
    
    const handleAddTopicSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicName.trim() || !addTopicModal.courseId || !addTopicModal.subject) return;
        
        const { courseId, subject: targetSubject } = addTopicModal;

        setCourses(prevCourses => prevCourses.map(c => {
            if (c.id === courseId) {
                return {
                    ...c,
                    syllabus: c.syllabus?.map(s => {
                        if (s.id === targetSubject.id) {
                            const newTopicItem: Topic = {
                                id: Date.now(),
                                name: newTopicName,
                                completed: false
                            };
                            return { ...s, topics: [...s.topics, newTopicItem] };
                        }
                        return s;
                    })
                };
            }
            return c;
        }));
        
        setNewTopicName('');
        setAddTopicModal({ isOpen: false, courseId: null, subject: null });
    };

    if (teacherCourses.length === 0) {
        return <div className="bg-white p-6 rounded-xl shadow-lg text-center text-gray-500">
            {searchQuery ? 'No courses found matching your search.' : 'You are not assigned to any courses with a syllabus.'}
            </div>;
    }

    return (
        <>
            <div className="space-y-6">
                {teacherCourses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-xl shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                            <h3 className="text-xl font-bold text-gray-800">Syllabus for: {course.title}</h3>
                            <button onClick={() => setAddSubjectModal({ isOpen: true, courseId: course.id })} className="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Subject</button>
                        </div>
                        <div className="space-y-4">
                            {course.syllabus?.map(subject => (
                                <div key={subject.id} className="border border-slate-200 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-lg text-gray-800">{subject.name}</h4>
                                        <button onClick={() => setAddTopicModal({ isOpen: true, courseId: course.id, subject })} className="px-3 py-1 bg-brand-purple text-white text-xs rounded-md hover:bg-opacity-90 font-semibold">Add Topic</button>
                                    </div>
                                    <ul className="mt-2 space-y-2">
                                        {subject.topics.map(topic => (
                                            <li key={topic.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                                <span>{topic.name}</span>
                                                <label htmlFor={`toggle-${topic.id}`} className="flex items-center cursor-pointer">
                                                    <div className="relative">
                                                        <input type="checkbox" id={`toggle-${topic.id}`} className="sr-only" checked={topic.completed} onChange={() => handleToggleTopic(course.id, subject.id, topic.id)} />
                                                        <div className={`block w-14 h-8 rounded-full ${topic.completed ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${topic.completed ? 'transform translate-x-6' : ''}`}></div>
                                                    </div>
                                                </label>
                                            </li>
                                        ))}
                                        {subject.topics.length === 0 && <p className="text-sm text-gray-500 p-2">No topics added yet.</p>}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {addSubjectModal.isOpen && (
                <Modal onClose={() => setAddSubjectModal({ isOpen: false, courseId: null })} title="Add New Subject">
                    <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700">Subject Name</label>
                            <input 
                                type="text" 
                                id="subjectName"
                                value={newSubjectName} 
                                onChange={(e) => setNewSubjectName(e.target.value)} 
                                placeholder="e.g., Advanced JavaScript"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="text-right">
                             <button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90">Submit</button>
                        </div>
                    </form>
                </Modal>
            )}

            {addTopicModal.isOpen && addTopicModal.subject && (
                <Modal onClose={() => setAddTopicModal({ isOpen: false, courseId: null, subject: null })} title={`Add Topic to "${addTopicModal.subject.name}"`}>
                    <form onSubmit={handleAddTopicSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="topicName" className="block text-sm font-medium text-gray-700">Topic Name</label>
                            <input 
                                type="text" 
                                id="topicName"
                                value={newTopicName} 
                                onChange={(e) => setNewTopicName(e.target.value)} 
                                placeholder="e.g., Promises and Async/Await"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="px-4 py-2 bg-brand-navy text-white rounded-md hover:bg-opacity-90">Submit</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export default ManageSyllabus;
