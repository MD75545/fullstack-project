import React, { useState, useEffect } from 'react';
import type { Student } from '../types';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';
import { registerStudent, updateStudent, getStudentOptions } from '../services/api';

interface AddEditStudentModalProps {
    onClose: () => void;
    onSave: (studentData: Omit<Student, 'id' | 'role'>) => void;
    student: Student | null;
}

interface StudentOptions {
    teachers: Array<{ user_id: number; name: string; specialization: string }>;
    courses: Array<{ course_id: number; title: string; duration: string; level: string; price: number }>;
    affiliates: Array<{ affiliate_id: string; firm_name: string }>;
}

const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({ onClose, onSave, student }) => {
    const [formData, setFormData] = useState({
        name: student?.name || '',
        email: student?.email || '',
        mobile: student?.mobile || '',
        password: student?.password || 'defaultPassword123',
        city: student?.city || '',
        address: student?.address || '',
        course_id: student?.courseId || 0,
        teacher_id: student?.teacherId || undefined,
        referred_by_affiliate_id: student?.referredByAffiliateId || '',
        display_name_preference: student?.displayNamePreference || 'real_name',
        gender: student?.gender || '',
    });

    const [options, setOptions] = useState<StudentOptions>({
        teachers: [],
        courses: [],
        affiliates: []
    });

    const [loading, setLoading] = useState(false);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch options on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            setOptionsLoading(true);
            try {
                console.log('📋 Fetching student form options...');
                const response = await getStudentOptions();
                console.log('📋 Options API Response:', response);
                
                // ✅ FIXED: Check for response.status instead of response.success
                if (response.status === 'success' && response.data) {
                    setOptions({
                        teachers: response.data.teachers || [],
                        courses: response.data.courses || [],
                        affiliates: response.data.affiliates || []
                    });
                    console.log('✅ Options loaded:', {
                        teachers: response.data.teachers?.length || 0,
                        courses: response.data.courses?.length || 0,
                        affiliates: response.data.affiliates?.length || 0
                    });
                } else {
                    const errorMsg = response.message || 'Failed to load form options';
                    setError(errorMsg);
                    console.error('❌ Options load failed:', errorMsg);
                }
            } catch (error: any) {
                console.error('❌ Error fetching options:', error);
                setError('Failed to load form options: ' + error.message);
            } finally {
                setOptionsLoading(false);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value 
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.city.trim() || !formData.course_id) {
            setError('Please fill in all required fields.');
            return;
        }
        
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        // Validate course selection
        if (!formData.course_id || formData.course_id === 0) {
            setError('Please select a course.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (student) {
                // EDIT MODE: Update existing student
                console.log('🔄 Updating student with user_id:', student.id);
                
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile || '',
                    city: formData.city,
                    address: formData.address || '',
                    course_id: parseInt(formData.course_id.toString()),
                    teacher_id: formData.teacher_id ? parseInt(formData.teacher_id.toString()) : null,
                    referred_by_affiliate_id: formData.referred_by_affiliate_id || null,
                    display_name_preference: formData.display_name_preference,
                    gender: formData.gender || null,
                };

                console.log('📤 Sending update data:', updateData);

                const response = await updateStudent(student.id, updateData);

                console.log('✅ Update API Response:', response);

                if (response.success) {
                    // Call the original onSave with formatted data
                    const studentData = {
                        name: formData.name,
                        email: formData.email,
                        mobile: formData.mobile,
                        password: formData.password,
                        city: formData.city,
                        address: formData.address,
                        courseId: parseInt(formData.course_id.toString()),
                        teacherId: formData.teacher_id ? parseInt(formData.teacher_id.toString()) : undefined,
                        referredByAffiliateId: formData.referred_by_affiliate_id || undefined,
                        displayNamePreference: formData.display_name_preference,
                        gender: formData.gender || undefined,
                    };

                    onSave(studentData);
                    onClose(); // Close modal on success
                } else {
                    setError(response.message || 'Update failed. Please try again.');
                }
            } else {
                // ADD MODE: Create new student
                const apiData = {
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    password: formData.password,
                    city: formData.city,
                    address: formData.address,
                    course_id: parseInt(formData.course_id.toString()),
                    teacher_id: formData.teacher_id ? parseInt(formData.teacher_id.toString()) : null,
                    referred_by_affiliate_id: formData.referred_by_affiliate_id || null,
                    display_name_preference: formData.display_name_preference,
                    gender: formData.gender || null,
                };

                console.log('📤 Sending student data to API:', apiData);

                const response = await registerStudent(apiData);
                
                console.log('✅ API Response:', response);
                
                if (response.status === 'success') {
                    // Call the original onSave with formatted data
                    onSave({
                        name: formData.name,
                        email: formData.email,
                        mobile: formData.mobile,
                        password: formData.password,
                        city: formData.city,
                        address: formData.address,
                        courseId: parseInt(formData.course_id.toString()),
                        teacherId: formData.teacher_id ? parseInt(formData.teacher_id.toString()) : undefined,
                        referredByAffiliateId: formData.referred_by_affiliate_id || undefined,
                        displayNamePreference: formData.display_name_preference,
                        gender: formData.gender || undefined,
                    });
                    
                    onClose(); // Close modal on success
                } else {
                    setError(response.message || 'Registration failed. Please try again.');
                }
            }
        } catch (error: any) {
            console.error('❌ Student operation error:', error);
            
            // Handle specific error messages
            if (error.message.includes('email already exists') || error.message.includes('duplicate email')) {
                setError('This email address is already registered. Please use a different email.');
            } else if (error.message.includes('mobile') && error.message.includes('duplicate')) {
                setError('This mobile number is already registered. Please use a different number.');
            } else if (error.message.includes('network error') || error.message.includes('Failed to fetch')) {
                setError('Network error: Cannot connect to server. Please check your connection and try again.');
            } else {
                setError(error.message || `Failed to ${student ? 'update' : 'register'} student. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" 
                    aria-label="Close modal"
                    disabled={loading || optionsLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-2xl font-bold text-brand-navy mb-4">
                    {student ? 'Edit Student' : 'Add Student'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {(optionsLoading) && (
                    <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading form options...
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                                placeholder="Student full name"
                            />
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                            <input 
                                type="tel" 
                                name="mobile" 
                                id="mobile" 
                                value={formData.mobile} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required
                                disabled={loading}
                                placeholder="10-digit mobile number"
                                pattern="[0-9]{10}"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="mt-1 input-style" 
                            required 
                            disabled={loading}
                            placeholder="student@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                            <select 
                                name="gender" 
                                id="gender" 
                                value={formData.gender} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                disabled={loading}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="display_name_preference" className="block text-sm font-medium text-gray-700">Display Name</label>
                            <select 
                                name="display_name_preference" 
                                id="display_name_preference" 
                                value={formData.display_name_preference} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                disabled={loading}
                            >
                                <option value="real_name">Real Name</option>
                                <option value="nickname">Nickname</option>
                                <option value="anonymous">Anonymous</option>
                            </select>
                        </div>
                    </div>

                    {/* Course Selection Dropdown */}
                    <div>
                        <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">Course *</label>
                        <select 
                            name="course_id" 
                            id="course_id" 
                            value={formData.course_id} 
                            onChange={handleChange} 
                            className="mt-1 input-style" 
                            required 
                            disabled={loading || optionsLoading}
                        >
                            <option value="0">Select Course</option>
                            {options.courses.map(course => (
                                <option key={course.course_id} value={course.course_id}>
                                    {course.title} - {course.level} ({course.duration})
                                </option>
                            ))}
                        </select>
                        {optionsLoading && options.courses.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">Loading courses...</p>
                        )}
                        {!optionsLoading && options.courses.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">No courses available. Please add courses first.</p>
                        )}
                    </div>

                    {/* Teacher Selection Dropdown */}
                    <div>
                        <label htmlFor="teacher_id" className="block text-sm font-medium text-gray-700">Assign Teacher</label>
                        <select 
                            name="teacher_id" 
                            id="teacher_id" 
                            value={formData.teacher_id || ''} 
                            onChange={handleChange} 
                            className="mt-1 input-style" 
                            disabled={loading || optionsLoading}
                        >
                            <option value="">Not Assigned</option>
                            {options.teachers.map(teacher => (
                                <option key={teacher.user_id} value={teacher.user_id}>
                                    {teacher.name} {teacher.specialization ? `- ${teacher.specialization}` : ''}
                                </option>
                            ))}
                        </select>
                        {optionsLoading && options.teachers.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">Loading teachers...</p>
                        )}
                        {!optionsLoading && options.teachers.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">No teachers available</p>
                        )}
                    </div>

                    {/* Affiliate Selection Dropdown */}
                    <div>
                        <label htmlFor="referred_by_affiliate_id" className="block text-sm font-medium text-gray-700">Referred By Affiliate</label>
                        <select 
                            name="referred_by_affiliate_id" 
                            id="referred_by_affiliate_id" 
                            value={formData.referred_by_affiliate_id} 
                            onChange={handleChange} 
                            className="mt-1 input-style" 
                            disabled={loading || optionsLoading}
                        >
                            <option value="">Not Referred</option>
                            {options.affiliates.map(affiliate => (
                                <option key={affiliate.affiliate_id} value={affiliate.affiliate_id}>
                                    {affiliate.firm_name || 'Individual'} - {affiliate.affiliate_id}
                                </option>
                            ))}
                        </select>
                        {optionsLoading && options.affiliates.length === 0 && (
                            <p className="text-xs text-gray-500 mt-1">Loading affiliates...</p>
                        )}
                    </div>
                    
                    {/* Only show password field for new students */}
                    {!student && (
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password *
                            </label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                value={formData.password} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                                placeholder="Minimum 8 characters"
                                minLength={8}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Default password is provided. Student can change it later.
                            </p>
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City *
                        </label>
                        <SearchableDropdown
                            id="city"
                            options={indianDistricts}
                            value={formData.city}
                            onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                            required={true}
                            disabled={loading}
                            placeholder="Select city"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address *
                        </label>
                        <textarea 
                            name="address" 
                            id="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            rows={3} 
                            className="mt-1 input-style" 
                            required
                            disabled={loading}
                            placeholder="Full address with street, area, etc."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
                            disabled={loading || optionsLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                            disabled={loading || optionsLoading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {student ? 'Updating...' : 'Registering...'}
                                </span>
                            ) : (
                                student ? 'Update Student' : 'Register Student'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            
            <style>{`
                .input-style { 
                    display: block; 
                    width: 100%; 
                    padding: 0.5rem 0.75rem; 
                    border: 1px solid #D1D5DB; 
                    border-radius: 0.375rem; 
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); 
                    outline: none; 
                    transition: border-color 0.2s, box-shadow 0.2s;
                } 
                .input-style:focus { 
                    ring: 2px; 
                    ring-color: #805AD5; 
                    border-color: #805AD5; 
                    box-shadow: 0 0 0 3px rgb(128 90 213 / 0.1);
                }
                .input-style:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
                    opacity: 0.7;
                }
                .input-style:invalid {
                    border-color: #ef4444;
                }
            `}</style>
        </div>
    );
};

export default AddEditStudentModal;