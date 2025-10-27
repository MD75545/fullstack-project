import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courses } from '../data/mockData';
import type { Course, Partner, Teacher } from '../types';
import BookDemoModal from '../components/BookDemoModal';
import { useAuth } from '../context/AuthContext';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
);


const Courses: React.FC = () => {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const courseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
    const affiliateRef = searchParams.get('ref');
    const [copiedCourseId, setCopiedCourseId] = useState<number | null>(null);
    const [canShare, setCanShare] = useState(false);


    useEffect(() => {
        if (navigator.share) {
            setCanShare(true);
        }

        const courseId = searchParams.get('courseId');
        if (courseId) {
            const id = parseInt(courseId, 10);
            // Use a timeout to ensure the element has been rendered and is available in the DOM
            setTimeout(() => {
                const element = courseRefs.current[id];
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('highlight-course');
                    setTimeout(() => {
                        element.classList.remove('highlight-course');
                    }, 3000); // Highlight for 3 seconds
                }
            }, 100);
        } else {
            window.scrollTo(0, 0);
        }
    }, [searchParams]);

    const openDemoModal = (course: Course) => {
        setSelectedCourse(course);
    };

    const closeModal = () => {
        setSelectedCourse(null);
    };
    
    const copyToClipboard = (link: string, courseId: number) => {
        navigator.clipboard.writeText(link);
        setCopiedCourseId(courseId);
        setTimeout(() => setCopiedCourseId(null), 2000);
    };

    const handleShare = async (course: Course, url: string) => {
        const shareData = {
            title: `Check out: ${course.title}`,
            text: `I thought you might be interested in the "${course.title}" course from Mentor Institute!`,
            url: url,
        };

        try {
            // Attempt to fetch and share the course image
            const response = await fetch(course.image);
            if (!response.ok) throw new Error('Image fetch failed');
            
            const blob = await response.blob();
            if (blob.type.startsWith('image/')) {
                const file = new File([blob], `${course.title.replace(/\s/g, '-')}.jpg`, { type: blob.type });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ ...shareData, files: [file] });
                    return; 
                }
            }
        } catch (error) {
            console.warn("Could not share image, sharing text only.", error);
        }
        
        // Fallback to sharing text and URL only
        try {
            await navigator.share(shareData);
        } catch (shareError) {
             console.error('Error sharing:', shareError);
        }
    };


    const canBeAffiliate = user && (user.role === 'partner' || (user.role === 'teacher' && (user as Teacher).affiliateId));
    const affiliateId = canBeAffiliate ? (user as Partner | Teacher).affiliateId : undefined;

  return (
    <>
        <div className="bg-brand-light">
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-8 md:grid-cols-2">
                        {courses.map((course) => (
                            <div 
                                key={course.id} 
                                // Fix: A ref callback should not return a value. Using a block body ensures an implicit undefined return.
                                ref={el => { courseRefs.current[course.id] = el; }}
                                className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-all duration-500"
                            >
                                <img className="h-64 w-full object-cover" src={course.image} alt={course.title} />
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="flex-shrink-0">{course.icon}</div>
                                        <h2 className="text-2xl font-bold text-brand-navy">{course.title}</h2>
                                    </div>
                                    <p className="text-gray-600 flex-grow">{course.description}</p>
                                    <div className="mt-6 flex justify-between items-center text-sm font-medium text-gray-500">
                                        <span>Duration: <span className="font-bold text-brand-navy">{course.duration}</span></span>
                                        <span>Level: <span className="font-bold text-brand-navy">{course.level}</span></span>
                                    </div>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => openDemoModal(course)}
                                            className="w-full bg-brand-purple text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300"
                                        >
                                            Book a Free Demo
                                        </button>
                                        
                                        {canBeAffiliate && affiliateId && (() => {
                                            const affiliateLink = `${window.location.origin}${window.location.pathname}#/courses?courseId=${course.id}&ref=${affiliateId}`;
                                            return (
                                                <div className="mt-4 border-t border-gray-200 pt-4">
                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Your Affiliate Link</label>
                                                    <div className="bg-gray-100 p-1.5 rounded-md flex items-center justify-between text-sm">
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={affiliateLink}
                                                            className="bg-transparent text-gray-700 w-full outline-none text-xs flex-1 px-2"
                                                            aria-label="Affiliate Link"
                                                        />
                                                        <div className="flex items-center ml-2 space-x-1 flex-shrink-0">
                                                            <button
                                                                onClick={() => copyToClipboard(affiliateLink, course.id)}
                                                                className="px-2 py-1.5 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-20 text-xs flex items-center justify-center gap-1"
                                                                aria-label="Copy link"
                                                            >
                                                                {copiedCourseId === course.id ? 'Copied!' : <><CopyIcon /> Copy</>}
                                                            </button>
                                                            {canShare && (
                                                                <button
                                                                    onClick={() => handleShare(course, affiliateLink)}
                                                                    title="Share link"
                                                                    className="p-1.5 bg-brand-navy text-white rounded-md hover:bg-opacity-90 transition-colors"
                                                                    aria-label="Share link"
                                                                >
                                                                    <ShareIcon />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        {selectedCourse && <BookDemoModal course={selectedCourse} onClose={closeModal} affiliateId={affiliateRef} />}
    </>
  );
};

export default Courses;