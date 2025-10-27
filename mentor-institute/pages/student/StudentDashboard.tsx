import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, courses, demoBookings } from '../../data/mockData';
import type { Student, Teacher, DemoBooking } from '../../types';
import PracticeResults from './PracticeResults';
import ContestResults from './ContestResults';
import StudentProfile from './StudentProfile';
import { SearchProvider, useSearch } from '../../context/SearchContext';

type StudentView = 'course' | 'practice-results' | 'contest-results' | 'profile';

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MyCourseView: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    
    const studentData = user as Student;
    const course = courses.find(c => c.id === studentData.courseId);
    const teacher = users.find(u => u.id === studentData.teacherId) as Teacher | undefined;
    
    const myScheduledDemos = demoBookings.filter(
        d => d.studentEmail === user.email && d.status === 'Scheduled'
    );
    
     useEffect(() => {
        const myUnnotifiedDemos = demoBookings.filter(
            d => d.studentEmail === user.email && d.status === 'Scheduled' && !d.studentNotified
        );

        if (myUnnotifiedDemos.length > 0) {
            const showNotification = () => {
                myUnnotifiedDemos.forEach(demo => {
                    const courseName = courses.find(c => c.id === demo.courseId)?.title;
                    new Notification('Demo Confirmed!', {
                        body: `Your demo for "${courseName}" is scheduled for ${demo.scheduledDate} at ${demo.scheduledTime}.`,
                    });
                    
                    const demoIndex = demoBookings.findIndex(d => d.id === demo.id);
                    if (demoIndex > -1) {
                        demoBookings[demoIndex].studentNotified = true;
                    }
                });
            };

            if (typeof Notification !== 'undefined') {
                if (Notification.permission === 'granted') {
                    showNotification();
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            showNotification();
                        }
                    });
                }
            }
        }
    }, [user.email]);

    return (
        <div className="space-y-6">
            {myScheduledDemos.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-brand-purple">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">My Demo Schedule</h2>
                    <div className="space-y-3">
                    {myScheduledDemos.map(demo => {
                        const demoCourse = courses.find(c => c.id === demo.courseId);
                        const demoTeacher = users.find(u => u.id === demo.teacherId);
                        return (
                             <div key={demo.id} className="p-4 bg-purple-50 rounded-lg">
                                <p><strong>Course:</strong> {demoCourse?.title}</p>
                                <p><strong>Date & Time:</strong> {new Date(demo.scheduledDate || '').toLocaleDateString()} at {demo.scheduledTime}</p>
                                <p><strong>Assigned Teacher:</strong> {demoTeacher?.name || 'To be confirmed'}</p>
                            </div>
                        )
                    })}
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Course Details</h2>
                {course ? (
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Course:</strong> {course.title}</p>
                        <p><strong>Duration:</strong> {course.duration}</p>
                        <p><strong>Level:</strong> {course.level}</p>
                    </div>
                ) : <p>You are not enrolled in any course.</p>}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-4">My Mentor</h2>
                {teacher ? (
                     <p><strong>Assigned Teacher:</strong> {teacher.name} ({teacher.email})</p>
                ) : <p>Your teacher has not been assigned yet.</p>}
            </div>

            {course?.syllabus && (
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Course Syllabus</h2>
                    <div className="space-y-4">
                        {course.syllabus.map(subject => (
                            <div key={subject.id}>
                                <h3 className="font-semibold text-lg text-gray-800">{subject.name}</h3>
                                <ul className="mt-2 ml-4 space-y-2 list-disc list-inside">
                                    {subject.topics.map(topic => (
                                        <li key={topic.id} className="flex items-center gap-3 text-gray-600">
                                            {topic.completed ? (
                                                <span className="text-green-500 flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 flex-shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 9a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                            <span className={topic.completed ? 'line-through text-gray-400' : ''}>{topic.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const StudentDashboardInternal: React.FC = () => {
    const { user } = useAuth();
    const [activeView, setActiveView] = useState<StudentView>('course');
    const { searchQuery, setSearchQuery } = useSearch();

    const handleTabChange = (view: StudentView) => {
        setActiveView(view);
        setSearchQuery('');
    };

    const renderView = () => {
        switch (activeView) {
            case 'practice-results':
                return <PracticeResults />;
            case 'contest-results':
                return <ContestResults />;
            case 'profile':
                return <StudentProfile />;
            case 'course':
            default:
                return <MyCourseView />;
        }
    };

    const TabButton: React.FC<{ view: StudentView; label: string }> = ({ view, label }) => (
        <button
            onClick={() => handleTabChange(view)}
            className={`px-4 py-3 font-semibold rounded-t-lg transition-colors focus:outline-none text-sm sm:text-base ${
                activeView === view
                    ? 'border-b-2 border-brand-purple text-brand-purple'
                    : 'text-gray-500 hover:text-brand-navy'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
                    <p className="text-lg text-gray-600 mt-1">This is your student dashboard.</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div className="border-b border-gray-200 w-full sm:w-auto">
                        <nav className="-mb-px flex space-x-2 sm:space-x-6" aria-label="Tabs">
                            <TabButton view="course" label="My Course" />
                            <TabButton view="practice-results" label="Practice Results" />
                            <TabButton view="contest-results" label="Contest Results" />
                            <TabButton view="profile" label="My Profile" />
                        </nav>
                    </div>
                    {activeView !== 'profile' && activeView !== 'course' && (
                        <div className="relative w-full sm:w-64">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon />
                            </span>
                            <input
                                type="text"
                                placeholder="Search results..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            />
                        </div>
                    )}
                </div>

                <div>{renderView()}</div>
            </div>
        </div>
    );
};

const StudentDashboard: React.FC = () => (
    <SearchProvider>
        <StudentDashboardInternal />
    </SearchProvider>
);

export default StudentDashboard;
