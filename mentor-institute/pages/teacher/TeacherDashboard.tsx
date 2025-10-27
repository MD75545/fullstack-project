import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import MyStudents from './MyStudents';
import MyAvailability from './MyAvailability';
import ManageSyllabus from './ManageSyllabus';
import { useAuth } from '../../context/AuthContext';
import { users } from '../../data/mockData';
import { useSearch, SearchProvider } from '../../context/SearchContext';

type TeacherView = 'students' | 'availability' | 'syllabus';

const StudentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>;
const AvailabilityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const SyllabusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;

const TeacherDashboardInternal: React.FC = () => {
    const [view, setView] = useState<TeacherView>('students');
    const { user } = useAuth();
    const { setSearchQuery } = useSearch();

    const studentCount = useMemo(() => {
        return users.filter(u => u.role === 'student' && 'teacherId' in u && u.teacherId === user?.id).length;
    }, [user]);
    
    const handleViewChange = (newView: TeacherView) => {
        setView(newView);
        setSearchQuery('');
    }

    const navItems = [
        { name: 'My Students', icon: <StudentIcon/>, onClick: () => handleViewChange('students'), active: view === 'students' },
        { name: 'My Availability', icon: <AvailabilityIcon/>, onClick: () => handleViewChange('availability'), active: view === 'availability' },
        { name: 'Manage Syllabus', icon: <SyllabusIcon/>, onClick: () => handleViewChange('syllabus'), active: view === 'syllabus' },
    ];
    
    const renderView = () => {
        switch(view) {
            case 'students':
                return <MyStudents />;
            case 'availability':
                return <MyAvailability />;
            case 'syllabus':
                return <ManageSyllabus />;
            default:
                return null;
        }
    }

    const pageTitle = {
        students: "My Students & Referrals",
        availability: "My Weekly Availability",
        syllabus: "Manage Course Syllabus"
    }[view];

    return (
        <DashboardLayout navItems={navItems} pageTitle={pageTitle}>
            <div className="mb-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4 border border-gray-200">
                <div className="bg-brand-purple/10 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                    <h3 className="text-gray-500 text-sm font-medium">Total Students Assigned</h3>
                    <p className="text-3xl font-bold text-gray-800">{studentCount}</p>
                </div>
            </div>
            {renderView()}
        </DashboardLayout>
    );
};

const TeacherDashboard: React.FC = () => (
    <SearchProvider>
        <TeacherDashboardInternal />
    </SearchProvider>
);

export default TeacherDashboard;