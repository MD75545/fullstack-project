

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courses, testimonials } from '../data/mockData';
import PartnerModal from '../components/PartnerModal';
import BookDemoModal from '../components/BookDemoModal';
import { useAuth } from '../context/AuthContext';
import type { Course, Teacher, Partner } from '../types';

// Icons for the "What We Do" section
const InternshipIcon = () => (
    <div className="bg-brand-purple bg-opacity-20 p-3 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    </div>
);
const WorkshopIcon = () => (
    <div className="bg-brand-purple bg-opacity-20 p-3 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    </div>
);
const LiveProjectsIcon = () => (
    <div className="bg-brand-purple bg-opacity-20 p-3 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
    </div>
);
// Icons for Join Us Section
const TeacherIconJoin = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const AffiliateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);
const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
);

const Home: React.FC = () => {
    const [selectedCourseForDemo, setSelectedCourseForDemo] = useState<Course | null>(null);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
    const { user } = useAuth();
    const [copiedCourseId, setCopiedCourseId] = useState<number | null>(null);
    const [canShare, setCanShare] = useState(false);


    useEffect(() => {
        if (navigator.share) {
            setCanShare(true);
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        
        let intervalId: number | undefined;
        if (isMobile) {
            intervalId = window.setInterval(() => {
                setCurrentTestimonialIndex(prevIndex => (prevIndex + 1) % testimonials.length);
            }, 5000); // 5 seconds
        }
        
        window.scrollTo(0, 0);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('section-animate');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('.section-to-animate');
        sections.forEach((section) => observer.observe(section as Element));

        return () => {
            window.removeEventListener('resize', handleResize);
             if (intervalId) {
                clearInterval(intervalId);
            }
            sections.forEach((section) => {
                if (section) {
                    observer.unobserve(section as Element);
                }
            });
        };
    }, [isMobile]);

    const openDemoModal = (course: Course) => {
        setSelectedCourseForDemo(course);
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

    const whatWeDoItems = [
        {
            icon: <InternshipIcon />,
            title: "100% Internship",
            description: "Gain practical experience and kickstart your career with our guaranteed internship program in top tech companies."
        },
        {
            icon: <WorkshopIcon />,
            title: "Workshops and Seminar in institutes",
            description: "We conduct hands-on workshops and insightful seminars at various institutes to spread practical, industry-relevant knowledge."
        },
        {
            icon: <LiveProjectsIcon />,
            title: "Live projects and community support",
            description: "Work on real-world projects, build a strong portfolio, and get continuous support from our active community of learners and mentors."
        }
    ];

    return (
        <>
            <div className="bg-white">
                {/* Hero Section */}
                <div className="relative bg-brand-navy">
                    <div className="absolute inset-0">
                        <img className="w-full h-full object-cover" src="https://picsum.photos/1600/800?random=hero" alt="Students learning" />
                        <div className="absolute inset-0 bg-brand-navy opacity-70" aria-hidden="true" />
                    </div>
                    <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl section-to-animate">Unlock Your Potential in Tech</h1>
                        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300 section-to-animate" style={{ animationDelay: '100ms' }}>
                            Join Mentor Institute and gain the hands-on skills you need to succeed in the ever-evolving world of technology.
                        </p>
                        <div className="mt-8 flex justify-center space-x-4 section-to-animate" style={{ animationDelay: '200ms' }}>
                            <Link to="/courses" className="inline-block bg-brand-purple text-white px-8 py-3 rounded-md text-base font-medium hover:bg-opacity-90 transition animate-pulse-subtle">
                                Explore Courses
                            </Link>
                            <Link to="/contact" className="inline-block bg-white text-brand-navy px-8 py-3 rounded-md text-base font-medium hover:bg-gray-200 transition">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Featured Courses Section */}
                <div className="py-16 bg-brand-light section-to-animate">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">Our Popular Courses</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                                Dive into our comprehensive courses designed by industry experts.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                                    <img className="h-48 w-full object-cover" src={course.image} alt={course.title} />
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="flex-shrink-0">{course.icon}</div>
                                            <h3 className="text-lg font-bold text-brand-navy">{course.title}</h3>
                                        </div>
                                        <p className="text-gray-600 flex-grow text-sm">{course.description.substring(0, 100)}...</p>
                                        <div className="mt-6">
                                            <button onClick={() => openDemoModal(course)} className="w-full text-sm bg-brand-purple text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition duration-300">
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
                         <div className="mt-10 text-center">
                            <Link to="/courses" className="text-brand-purple font-semibold hover:underline">
                                View All Courses &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* What We Do Section */}
                <div className="py-16 bg-white section-to-animate" style={{ animationDelay: '200ms' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">What We Do</h2>
                            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                                We are dedicated to providing a complete ecosystem for learning and growth.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-8 md:grid-cols-3">
                            {whatWeDoItems.map((item) => (
                                <div key={item.title} className="text-center p-6">
                                    <div className="flex items-center justify-center h-16 w-16 mx-auto">
                                        {item.icon}
                                    </div>
                                    <h3 className="mt-5 text-lg font-semibold text-brand-navy">{item.title}</h3>
                                    <p className="mt-2 text-base text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Join Us Section */}
                <div className="bg-brand-purple section-to-animate" style={{ animationDelay: '400ms' }}>
                    <div className="max-w-7xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            Partner with Us
                        </h2>
                        <p className="mt-4 text-lg leading-6 text-indigo-200 max-w-3xl mx-auto">
                            Whether you're an industry expert ready to teach or a partner eager to grow, we have an opportunity for you. Join our mission to empower the next generation of tech leaders.
                        </p>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 text-left">
                            {/* Teacher Benefits */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                        <TeacherIconJoin />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Become a Teacher</h3>
                                </div>
                                <ul className="space-y-3 text-indigo-100 list-inside">
                                    <li><span className="font-semibold text-white">Mentor & Inspire:</span> Guide aspiring developers and make a lasting impact on their careers.</li>
                                    <li><span className="font-semibold text-white">Flexible Schedule:</span> Enjoy the freedom to teach on your own terms, with remote opportunities.</li>
                                    <li><span className="font-semibold text-white">Competitive Pay:</span> Get rewarded for your knowledge and contribution to student success.</li>
                                </ul>
                            </div>

                            {/* Affiliate Benefits */}
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                                        <AffiliateIcon />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Become an Affiliate</h3>
                                </div>
                                <ul className="space-y-3 text-indigo-100 list-inside">
                                    <li><span className="font-semibold text-white">Earn Generous Commissions:</span> Benefit from a competitive revenue-sharing model for every referral.</li>
                                    <li><span className="font-semibold text-white">Promote Quality Courses:</span> Align your brand with our industry-recognized, in-demand tech courses.</li>
                                    <li><span className="font-semibold text-white">Marketing Support:</span> Access promotional materials and a dashboard to track your success.</li>
                                </ul>
                            </div>
                        </div>

                        <button onClick={() => setIsPartnerModalOpen(true)} className="mt-12 w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-brand-purple bg-white hover:bg-indigo-50 sm:w-auto transform hover:scale-105 transition-transform">
                            Join Us Now
                        </button>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="py-16 bg-brand-light section-to-animate overflow-hidden" style={{ animationDelay: '300ms' }}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">What Our Students Say</h2>
                        </div>
                    </div>
                    {isMobile ? (
                        <div className="mt-12 px-4">
                            <div className="relative w-full max-w-md mx-auto h-64">
                                {testimonials.map((testimonial, index) => (
                                    <div
                                        key={`${testimonial.name}-${index}`}
                                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentTestimonialIndex ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <div className="bg-white p-6 rounded-lg shadow-md h-full w-full flex flex-col">
                                            <p className="text-gray-600 italic flex-grow">"{testimonial.quote}"</p>
                                            <div className="mt-4 flex items-center">
                                                <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                                    <img className="h-full w-full object-cover" src={testimonial.image} alt={testimonial.name} />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="font-semibold text-brand-navy">{testimonial.name}</p>
                                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-12 scrolling-wrapper" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                            <div className="animate-scroll flex gap-8">
                                {[...testimonials, ...testimonials].map((testimonial, index) => (
                                    <div key={`${testimonial.name}-${index}`} className="bg-white p-6 rounded-lg shadow-md w-[90vw] max-w-[400px] md:w-[400px] flex-shrink-0 group transition-transform duration-300 hover:scale-105 hover:shadow-xl flex flex-col">
                                        <p className="text-gray-600 italic flex-grow">"{testimonial.quote}"</p>
                                        <div className="mt-4 flex items-center">
                                            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                                                <img className="h-full w-full object-cover transform transition-transform duration-300 group-hover:scale-110" src={testimonial.image} alt={testimonial.name} />
                                            </div>
                                            <div className="ml-4">
                                                <p className="font-semibold text-brand-navy transition-colors group-hover:text-brand-purple">{testimonial.name}</p>
                                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {selectedCourseForDemo && <BookDemoModal course={selectedCourseForDemo} onClose={() => setSelectedCourseForDemo(null)} affiliateId={null} />}
            {isPartnerModalOpen && <PartnerModal onClose={() => setIsPartnerModalOpen(false)} />}
        </>
    );
};

export default Home;