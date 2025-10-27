import React, { useState, useEffect } from 'react';
import type { Teacher } from '../types';
import { courses } from '../data/mockData';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';
import { registerUser } from '../services/api'; // Import your API function

interface AddEditTeacherModalProps {
    onClose: () => void;
    onSave: (teacherData: Omit<Teacher, 'id' | 'role' | 'earnings'>) => void;
    teacher: Teacher | null;
}

const AddEditTeacherModal: React.FC<AddEditTeacherModalProps> = ({ onClose, onSave, teacher }) => {
    const [formData, setFormData] = useState({
        name: teacher?.name || '',
        email: teacher?.email || '',
        mobile: teacher?.mobile || '',
        specialization: teacher?.specialization || (courses.length > 0 ? courses[0].title : ''),
        affiliateId: teacher?.affiliateId || '',
        commissionPercentage: teacher?.commissionPercentage || 0,
        password: teacher?.password || 'defaultPassword123', // Default password
        city: teacher?.city || '',
        address: teacher?.address || ''
    });

    const [isAffiliate, setIsAffiliate] = useState(!!teacher?.affiliateId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAffiliate) {
            setFormData(prev => ({ ...prev, affiliateId: '', commissionPercentage: 0 }));
        } else if (isAffiliate && !formData.affiliateId && !teacher?.affiliateId) {
            // If toggled on for a new teacher, generate a default ID
            setFormData(prev => ({ ...prev, affiliateId: `REF_TEACH_${Date.now().toString().slice(-4)}` }));
        }
    }, [isAffiliate, teacher]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'commissionPercentage' ? parseInt(value) || 0 : value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.specialization.trim() || !formData.city.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        if (isAffiliate && !formData.affiliateId.trim()) {
            setError('Affiliate ID is required when "Is also an affiliate" is checked.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare data for Laravel API
            // In AddEditTeacherModal.jsx - fix the join_as value
            const apiData = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile || '',
                password: formData.password,
                join_as: isAffiliate ? 'Both' : 'Teacher', // This is correct
                affiliate_type: 'Individual',
                city: formData.city,
                address: formData.address || '',
                firm_name: '',
                specialization: formData.specialization, // Make sure this is always sent
            };

            console.log('Sending teacher data to API:', apiData);

            // Call Laravel API
            const response = await registerUser(apiData);

            console.log('API Response:', response);

            if (response.status === 'success') {
                // Call the original onSave with formatted data
                const teacherData = {
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    specialization: formData.specialization,
                    affiliateId: isAffiliate ? formData.affiliateId : '',
                    commissionPercentage: isAffiliate ? formData.commissionPercentage : 0,
                    password: formData.password,
                    city: formData.city,
                    address: formData.address,
                };

                onSave(teacherData);
                onClose(); // Close modal on success
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Teacher registration error:', error);
            setError(error.message || 'Failed to register teacher. Please try again.');
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
                    disabled={loading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold text-brand-navy mb-4">
                    {teacher ? 'Edit Teacher' : 'Add Teacher'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 input-style"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                id="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="mt-1 input-style"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                        <select
                            name="specialization"
                            id="specialization"
                            value={formData.specialization}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                            disabled={loading}
                        >
                            {courses.map(course => (
                                <option key={course.id} value={course.title}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <SearchableDropdown
                            id="city"
                            options={indianDistricts}
                            value={formData.city}
                            onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                            required={true}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            name="address"
                            id="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 input-style"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="mt-1 input-style"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="relative flex items-start pt-2">
                        <div className="flex items-center h-5">
                            <input
                                id="isAffiliate"
                                name="isAffiliate"
                                type="checkbox"
                                checked={isAffiliate}
                                onChange={(e) => setIsAffiliate(e.target.checked)}
                                className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300 rounded"
                                disabled={loading}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="isAffiliate" className="font-medium text-gray-700">Is also an affiliate?</label>
                        </div>
                    </div>

                    {isAffiliate && (
                        <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                            <div>
                                <label htmlFor="affiliateId" className="block text-sm font-medium text-gray-700">Affiliate ID</label>
                                <input
                                    type="text"
                                    name="affiliateId"
                                    id="affiliateId"
                                    value={formData.affiliateId}
                                    onChange={handleChange}
                                    placeholder="e.g., REF_TEACH_123"
                                    className="mt-1 input-style"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div>
                                <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700">Commission %</label>
                                <input
                                    type="number"
                                    name="commissionPercentage"
                                    id="commissionPercentage"
                                    value={formData.commissionPercentage}
                                    onChange={handleChange}
                                    className="mt-1 input-style"
                                    min="0"
                                    max="100"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Registering...' : 'Save'}
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
                } 
                .input-style:focus { 
                    ring: 1px; 
                    ring-color: #805AD5; 
                    border-color: #805AD5; 
                }
                .input-style:disabled {
                    background-color: #f3f4f6;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

export default AddEditTeacherModal;