import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import ManageTeachers from './ManageTeachers';
import ManageStudents from './ManageStudents';
import ManagePartners from './ManagePartners';
import ManageTestCategories from './ManageTestCategories';
import ManageContests from './ManageContests';
import ManageDemos from './ManageDemos';
import ManageCourses from './ManageCourses';
import ManageTasks from './ManageTasks';
import { useSearch, SearchProvider } from '../../context/SearchContext';

type AdminView = 'teachers' | 'students' | 'partners' | 'testCategories' | 'contests' | 'demos' | 'courses' | 'tasks';

const TeacherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 11c-3.333 0-6 2.686-6 6v1h12v-1c0-3.314-2.667-6-6-6z" /></svg>;
const StudentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222 4 2.222V20" /></svg>;
const PartnerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>;
const CategoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13h5a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z" /></svg>;
const ContestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" /></svg>;
const DemoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>;
const CourseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
const TaskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;


const AdminDashboardInternal: React.FC = () => {
    const [view, setView] = useState<AdminView>('teachers');
    const { setSearchQuery } = useSearch();

    const handleViewChange = (newView: AdminView) => {
      setView(newView);
      setSearchQuery('');
    }
    
    const navItems = [
        { name: 'Teachers', icon: <TeacherIcon />, onClick: () => handleViewChange('teachers'), active: view === 'teachers' },
        { name: 'Students', icon: <StudentIcon />, onClick: () => handleViewChange('students'), active: view === 'students' },
        { name: 'Partners', icon: <PartnerIcon />, onClick: () => handleViewChange('partners'), active: view === 'partners' },
        { name: 'Demo Bookings', icon: <DemoIcon />, onClick: () => handleViewChange('demos'), active: view === 'demos' },
        { name: 'Manage Courses', icon: <CourseIcon />, onClick: () => handleViewChange('courses'), active: view === 'courses' },
        { name: 'Manage Tasks', icon: <TaskIcon />, onClick: () => handleViewChange('tasks'), active: view === 'tasks' },
        { name: 'Test Categories', icon: <CategoryIcon />, onClick: () => handleViewChange('testCategories'), active: view === 'testCategories' },
        { name: 'Contests', icon: <ContestIcon />, onClick: () => handleViewChange('contests'), active: view === 'contests' },
    ];
    
    const renderView = () => {
        switch(view) {
            case 'teachers':
                return <ManageTeachers />;
            case 'students':
                return <ManageStudents />;
            case 'partners':
                return <ManagePartners />;
            case 'demos':
                return <ManageDemos />;
            case 'courses':
                return <ManageCourses />;
            case 'tasks':
                return <ManageTasks />;
            case 'testCategories':
                return <ManageTestCategories />;
            case 'contests':
                return <ManageContests />;
            default:
                return null;
        }
    }
    
    const pageTitle = {
        teachers: "Manage Teachers",
        students: "Manage Students",
        partners: "Manage Partners",
        demos: "Manage Demo Bookings",
        courses: "Manage Courses",
        tasks: "Manage Tasks",
        testCategories: "Manage Test Categories",
        contests: "Manage Contests",
    }[view];

    return (
        <DashboardLayout navItems={navItems} pageTitle={pageTitle}>
            {renderView()}
        </DashboardLayout>
    );
};

const AdminDashboard: React.FC = () => (
    <SearchProvider>
        <AdminDashboardInternal />
    </SearchProvider>
);

export default AdminDashboard;