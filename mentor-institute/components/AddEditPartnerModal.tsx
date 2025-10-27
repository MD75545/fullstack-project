import React, { useState } from 'react';
import type { Partner } from '../types';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';
import { registerUser } from '../services/api';

interface AddEditPartnerModalProps {
    onClose: () => void;
    onSave: (partnerData: Omit<Partner, 'id' | 'role' | 'earnings'>) => void;
    partner: Partner | null;
}

const AddEditPartnerModal: React.FC<AddEditPartnerModalProps> = ({ onClose, onSave, partner }) => {
    const [formData, setFormData] = useState({
        name: partner?.name || '',
        email: partner?.email || '',
        mobile: partner?.mobile || '',
        password: partner?.password || 'defaultPassword123', // Add default password
        join_as: 'partner', // Default value for Laravel
        affiliate_type: partner?.partnerType || 'Individual', // Map to Laravel field
        city: partner?.city || '',
        address: partner?.address || '',
        firm_name: partner?.firmName || '',
        specialization: '', // Add this field for teacher/both cases
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'commissionPercentage' ? parseInt(value) || 0 : value 
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            affiliate_type: value, // Update affiliate_type
            firm_name: value === 'Individual' ? '' : prev.firm_name
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.city.trim()) {
            setError('Please fill in all required fields.');
            return;
        }
        
        if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        
        if (formData.affiliate_type === 'Institute' && !formData.firm_name.trim()) {
            setError('Firm name is required for partners of type "Institute".');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Prepare data for Laravel API
            const apiData = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                password: formData.password,
                join_as: formData.join_as,
                affiliate_type: formData.affiliate_type,
                city: formData.city,
                address: formData.address,
                firm_name: formData.firm_name,
                specialization: formData.specialization,
            };

            console.log('Sending data to API:', apiData);

            // Call Laravel API
            const response = await registerUser(apiData);
            
            console.log('API Response:', response);
            
            if (response.status === 'success') {
                // Call the original onSave with formatted data
                onSave({
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile,
                    affiliateId: response.data?.partner_affiliate_id || `AFF${Date.now()}`,
                    commissionPercentage: 10, // Default from Laravel
                    password: formData.password,
                    partnerType: formData.affiliate_type,
                    firmName: formData.firm_name,
                    city: formData.city,
                    address: formData.address,
                });
                
                onClose(); // Close modal on success
            } else {
                setError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message || 'Failed to register. Please try again.');
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
                    {partner ? 'Edit Partner' : 'Add Partner'}
                </h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Partner Type</label>
                        <div className="mt-2 flex items-center space-x-6">
                            <div className="flex items-center">
                                <input 
                                    id="type-individual" 
                                    name="partnerType" 
                                    type="radio" 
                                    value="Individual" 
                                    checked={formData.affiliate_type === 'Individual'} 
                                    onChange={handleTypeChange} 
                                    className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300" 
                                    disabled={loading}
                                />
                                <label htmlFor="type-individual" className="ml-2 block text-sm text-gray-900">
                                    Individual
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    id="type-institute" 
                                    name="partnerType" 
                                    type="radio" 
                                    value="Institute" 
                                    checked={formData.affiliate_type === 'Institute'} 
                                    onChange={handleTypeChange} 
                                    className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300" 
                                    disabled={loading}
                                />
                                <label htmlFor="type-institute" className="ml-2 block text-sm text-gray-900">
                                    Institute
                                </label>
                            </div>
                        </div>
                    </div>

                    {formData.affiliate_type === 'Institute' && (
                        <div>
                            <label htmlFor="firm_name" className="block text-sm font-medium text-gray-700">
                                Firm Name
                            </label>
                            <input 
                                type="text" 
                                name="firm_name" 
                                id="firm_name" 
                                value={formData.firm_name} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                            />
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                {formData.affiliate_type === 'Institute' ? 'Contact Person Name' : 'Full Name'}
                            </label>
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
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                Mobile Number
                            </label>
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
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
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
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
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
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
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
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
                            {loading ? 'Registering...' : 'Register'}
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

export default AddEditPartnerModal;