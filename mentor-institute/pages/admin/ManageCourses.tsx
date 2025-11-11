import React, { useState, useMemo, useEffect } from 'react';
import type { Course } from '../../types';
import AddCourseModal from '../../components/AddCourseModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../../services/api';

const ManageCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const { searchQuery } = useSearch();

    // Fetch courses from API
    const fetchCourses = async () => {
    try {
        setFetchLoading(true);
        setError('');
        console.log('🔄 Fetching courses from API...');
        const response = await getCourses();

        console.log('📊 Raw API response:', response);

        // FIXED: Check for data existence and either success status
        if (response.data && (response.success || response.status === 'success')) {
            const coursesData: Course[] = response.data.map((course: any) => {
    // Handle image URL - use placeholder if no image
    let imageUrl = '/api/placeholder/300/150'; // Default placeholder
    if (course.image_url) {
        imageUrl = course.image_url.startsWith('http') 
            ? course.image_url 
            : `http://localhost:8000/${course.image_url}`;
    }

    return {
        id: course.course_id,
        title: course.title || 'No Title',
        description: course.description || 'No Description',
        price: course.price || 0,
        duration: course.duration || 'Not specified',
        level: course.level || 'Not specified',
        image: imageUrl,
        icon: '',
        syllabus: [],
    };
});
            
            console.log('✅ Final courses data:', coursesData);
            console.log('✅ Courses count:', coursesData.length);
            setCourses(coursesData);
        } else {
            console.error('❌ API response not successful or no data:', response);
            setError(response.message || 'Failed to load courses');
        }
    } catch (error: any) {
        console.error('❌ Error fetching courses:', error);
        setError(error.message || 'Failed to load courses. Please try again.');
    } finally {
        setFetchLoading(false);
    }
};

    useEffect(() => {
        fetchCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        if (!searchQuery) return courses;
        const lowercasedQuery = searchQuery.toLowerCase();
        return courses.filter(course => 
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery) ||
            course.level.toLowerCase().includes(lowercasedQuery)
        );
    }, [courses, searchQuery]);

    // Debug current state
    console.log('🎯 Current courses state:', courses);
    console.log('🎯 Filtered courses:', filteredCourses);
    console.log('🎯 Fetch loading:', fetchLoading);

    const handleOpenAddModal = () => {
        setEditingCourse(null);
        setIsModalOpen(true);
        setError('');
    };

    const handleOpenEditModal = (course: Course) => {
        setEditingCourse(course);
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCourse(null);
        setError('');
    };

    const handleSaveCourse = async (courseData: any) => {
        try {
            setLoading(true);
            setError('');

            if (editingCourse) {
                const response = await updateCourse(editingCourse.id, courseData);
                if (response.success) {
                    await fetchCourses();
                    handleCloseModal();
                } else {
                    setError(response.message || 'Failed to update course');
                }
            } else {
                const response = await createCourse(courseData);
                if (response.success) {
                    await fetchCourses();
                    handleCloseModal();
                } else {
                    setError(response.message || 'Failed to create course');
                }
            }
        } catch (error: any) {
            console.error('Error saving course:', error);
            setError(error.message || `Failed to ${editingCourse ? 'update' : 'create'} course`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (course: Course) => {
        setDeletingCourse(course);
    };

    const confirmDelete = async () => {
        if (deletingCourse) {
            try {
                setLoading(true);
                const response = await deleteCourse(deletingCourse.id);
                
                if (response.success) {
                    await fetchCourses();
                    setError('');
                } else {
                    setError(response.message || 'Failed to delete course');
                }
            } catch (error: any) {
                console.error('Error deleting course:', error);
                setError(error.message || 'Failed to delete course. Please try again.');
            } finally {
                setLoading(false);
                setDeletingCourse(null);
            }
        }
    };

    if (fetchLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-center items-center h-32">
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-brand-purple" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-lg text-gray-600">Loading courses...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h2 className="text-xl font-bold text-gray-800">
                        Courses List ({filteredCourses.length})
                        {fetchLoading && <span className="ml-2 text-sm text-gray-500">(Updating...)</span>}
                    </h2>
                    <button 
                        onClick={handleOpenAddModal} 
                        className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
                        disabled={loading}
                    >
                        Add Course
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Image</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Description</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Fees</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Duration</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Level</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.length > 0 ? (
                                filteredCourses.map(course => (
                                    <tr key={course.id} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 border-b border-slate-200">
                                            <img 
                                                src={course.image} 
                                                alt={course.title} 
                                                className="w-24 h-12 object-cover rounded-md" 
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/api/placeholder/300/150';
                                                }}
                                            />
                                        </td>
                                        <td className="py-3 px-4 border-b border-slate-200 font-semibold">{course.title}</td>
                                        <td className="py-3 px-4 border-b border-slate-200 text-sm text-gray-600 hidden md:table-cell max-w-sm truncate">
                                            {course.description}
                                        </td>
                                        <td className="py-3 px-4 border-b border-slate-200">₹{course.price.toLocaleString('en-IN')}</td>
                                        <td className="py-3 px-4 border-b border-slate-200">{course.duration}</td>
                                        <td className="py-3 px-4 border-b border-slate-200">{course.level}</td>
                                        <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                                            <button 
                                                onClick={() => handleOpenEditModal(course)} 
                                                className="text-brand-purple font-medium hover:underline disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(course)} 
                                                className="text-red-500 font-medium hover:underline disabled:opacity-50"
                                                disabled={loading}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                        {courses.length === 0 ? 'No courses found. Add your first course!' : 'No courses matching your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <AddCourseModal
                    course={editingCourse}
                    onClose={handleCloseModal}
                    onSave={handleSaveCourse}
                />
            )}

            {deletingCourse && (
                <ConfirmationModal
                    title="Delete Course"
                    message={`Are you sure you want to delete "${deletingCourse.title}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingCourse(null)}
                />
            )}
        </>
    );
};

export default ManageCourses;