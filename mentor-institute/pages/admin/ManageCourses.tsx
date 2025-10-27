import React, { useState, useMemo } from 'react';
import { courses as initialCourses } from '../../data/mockData';
import type { Course } from '../../types';
import AddCourseModal from '../../components/AddCourseModal';
import { useSearch } from '../../context/SearchContext';

const ManageCourses: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>(initialCourses);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { searchQuery } = useSearch();

    const filteredCourses = useMemo(() => {
        if (!searchQuery) {
            return courses;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return courses.filter(course => 
            course.title.toLowerCase().includes(lowercasedQuery) ||
            course.description.toLowerCase().includes(lowercasedQuery)
        );
    }, [courses, searchQuery]);

    const handleSaveCourse = (newCourseData: Omit<Course, 'id' | 'icon' | 'syllabus'>) => {
        const newCourse: Course = {
            ...newCourseData,
            id: Date.now(),
            icon: initialCourses.length > 0 ? initialCourses[0].icon : <></>,
            syllabus: [],
        };
        setCourses(prev => [...prev, newCourse]);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                    <h2 className="text-xl font-bold text-gray-800">Courses List ({filteredCourses.length})</h2>
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Course</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Image</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Description</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Fees</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCourses.map(course => (
                                <tr key={course.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        <img src={course.image} alt={course.title} className="w-24 h-12 object-cover rounded-md" />
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200 font-semibold">{course.title}</td>
                                    <td className="py-3 px-4 border-b border-slate-200 text-sm text-gray-600 hidden md:table-cell max-w-sm truncate">
                                        {course.description}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">₹{course.price.toLocaleString('en-IN')}</td>
                                    <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                                        <button className="text-brand-purple font-medium hover:underline">Edit</button>
                                        <button className="text-red-500 font-medium hover:underline">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {filteredCourses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        No courses found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && (
                <AddCourseModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCourse}
                />
            )}
        </>
    );
};

export default ManageCourses;
