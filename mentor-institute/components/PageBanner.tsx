import React from 'react';
import { useLocation } from 'react-router-dom';
import { galleryItems, practiceTests, contests } from '../data/mockData';

const PageBanner: React.FC = () => {
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;

        // No banner on home, login, or dashboard
        if (path === '/' || path.startsWith('/login') || path.startsWith('/dashboard')) {
            return null;
        }

        const pathSegments = path.split('/').filter(Boolean);

        if (path.startsWith('/about')) return 'About Us';
        if (path.startsWith('/courses')) return 'Our Courses';

        if (path.startsWith('/gallery/')) {
            const id = parseInt(pathSegments[1] || '', 10);
            if (!isNaN(id)) {
                const item = galleryItems.find(i => i.id === id);
                if (item) return item.title;
            }
            return 'Workshop Details';
        }
        if (path.startsWith('/gallery')) return 'Workshops & Events';

        if (path.startsWith('/practice')) return 'Practice Tests';
        
        if (path.startsWith('/contest/')) {
            const id = parseInt(pathSegments[1] || '', 10);
            if (!isNaN(id)) {
                const contest = contests.find(c => c.id === id);
                if (contest) return contest.name;
            }
            return 'Contest';
        }
        if (path.startsWith('/contest')) return 'Contests';

        if (path.startsWith('/contact')) return 'Contact Us';
        if (path.startsWith('/search')) return 'Search Results';
        
        if (path.startsWith('/test/')) {
            const testId = parseInt(pathSegments[1] || '', 10);
            if (!isNaN(testId)) {
                const test = practiceTests.find(t => t.id === testId);
                if (test) return test.name;
            }
            return 'Test';
        }

        return null;
    };

    const title = getPageTitle();

    if (!title) {
        return null;
    }

    return (
        <div className="bg-brand-navy text-white shadow-md">
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
            </div>
        </div>
    );
};

export default PageBanner;
