import React, { useState } from 'react';
import type { Student, Teacher } from '../types';
import { courses, users } from '../data/mockData';

interface AddEditStudentModalProps {
    onClose: () => void;
    onSave: (studentData: Omit<Student, 'id' | 'role'>) => void;
    student: Student | null;
}

const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({ onClose, onSave, student }) => {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        mobile: student?.mobile || '',
        courseId: student?.courseId || courses[0]?.id || 0,
        teacherId: student?.teacherId || undefined,
        password: student?.password || 'password'
    });

    const teachers = users.filter(u => u.role === 'teacher') as Teacher[];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = ['courseId', 'teacherId'].includes(name) ? parseInt(value) || undefined : value;
        setFormData(prev => ({ ...prev, [name]: numValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.courseId) {
            alert('Please fill in all required fields.');
            return;
        }
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }
        onSave({
            ...formData,
            courseId: Number(formData.courseId),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                 <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">{student ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 input-style" required />
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 input-style" />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 input-style" required />
                    </div>
                     <div>
                        <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course</label>
                        <select name="courseId" id="courseId" value={formData.courseId} onChange={handleChange} className="mt-1 input-style" required>
                             {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                             ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Assign Teacher</label>
                        <select name="teacherId" id="teacherId" value={formData.teacherId || ''} onChange={handleChange} className="mt-1 input-style">
                            <option value="">Not Assigned</option>
                             {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                             ))}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90">
                            Save
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; } .input-style:focus { ring: 1px; ring-color: #805AD5; border-color: #805AD5; }`}</style>
        </div>
    );
};

export default AddEditStudentModal;