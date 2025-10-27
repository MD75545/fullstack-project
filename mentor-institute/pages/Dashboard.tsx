import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';
import PartnerDashboard from './partner/PartnerDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    if (!user) {
        return <p className="text-center p-10">Loading user data...</p>
    }

    switch(user.role) {
        case 'superadmin':
            return <AdminDashboard />;
        case 'teacher':
            return <TeacherDashboard />;
        case 'student':
            return <StudentDashboard />;
        case 'partner':
            return <PartnerDashboard />;
        default:
            return <p className="text-center p-10">Unknown user role.</p>;
    }
};

export default Dashboard;