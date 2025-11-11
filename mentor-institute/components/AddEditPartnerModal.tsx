import React, { useState } from 'react';
import type { Partner } from '../types';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';
import { registerUser, updatePartner } from '../services/api';

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
        password: partner?.password || 'defaultPassword123',
        join_as: 'Affiliate',
        affiliate_type: partner?.partnerType || 'Individual',
        city: partner?.city || '',
        address: partner?.address || '',
        firm_name: partner?.firmName || '',
        specialization: '',
        affiliateId: partner?.affiliateId || '',
        commissionPercentage: partner?.commissionPercentage || 10,
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
            affiliate_type: value,
            firm_name: value === 'Individual' ? '' : prev.firm_name // ✅ Clear firm_name when switching to Individual
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
        
        // ✅ FIXED: Only require firm_name for Institute type
        if (formData.affiliate_type === 'Institute' && !formData.firm_name.trim()) {
            setError('Firm name is required for partners of type "Institute".');
            return;
        }

        // Validate affiliate ID format
        if (formData.affiliateId && !/^[A-Za-z0-9_-]+$/.test(formData.affiliateId)) {
            setError('Affiliate ID can only contain letters, numbers, hyphens, and underscores.');
            return;
        }

        // Validate commission percentage
        if (formData.commissionPercentage < 0 || formData.commissionPercentage > 100) {
            setError('Commission percentage must be between 0 and 100.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (partner) {
                // EDIT MODE: Update existing partner
                console.log('Updating partner with user_id:', partner.id);
                
                const updateData = {
                    name: formData.name,
                    email: formData.email,
                    mobile: formData.mobile || '',
                    city: formData.city,
                    address: formData.address || '',
                    affiliateId: formData.affiliateId,
                    commissionPercentage: formData.commissionPercentage,
                    partnerType: formData.affiliate_type,
                    firmName: formData.firm_name,
                };

                console.log('Sending update data:', updateData);

                // Use user_id for the update (partner.id should be user_id)
                const response = await updatePartner(partner.id, updateData);

                console.log('Update API Response:', response);

                if (response.success) {
                    // Call the original onSave with formatted data
                    const partnerData = {
                        name: formData.name,
                        email: formData.email,
                        mobile: formData.mobile,
                        affiliateId: formData.affiliateId,
                        commissionPercentage: formData.commissionPercentage,
                        password: formData.password, // Keep existing password
                        partnerType: formData.affiliate_type,
                        firmName: formData.firm_name,
                        city: formData.city,
                        address: formData.address,
                    };

                    onSave(partnerData);
                    onClose(); // Close modal on success
                } else {
                    setError(response.message || 'Update failed. Please try again.');
                }
            } else {
                // ADD MODE: Create new partner
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
                    affiliateId: formData.affiliateId, // Include affiliateId for new partners
                    commissionPercentage: formData.commissionPercentage, // Include commission for new partners
                };

                console.log('Sending partner data to API:', apiData);

                const response = await registerUser(apiData);
                
                console.log('API Response:', response);
                
                if (response.status === 'success') {
                    // Call the original onSave with formatted data
                    onSave({
                        name: formData.name,
                        email: formData.email,
                        mobile: formData.mobile,
                        affiliateId: response.data?.partner_affiliate_id || formData.affiliateId || `AFF${Date.now()}`,
                        commissionPercentage: formData.commissionPercentage || 10,
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
            }
        } catch (error: any) {
            console.error('Partner operation error:', error);
            
            // Handle specific error messages
            if (error.message.includes('email already exists') || error.message.includes('duplicate email')) {
                setError('This email address is already registered. Please use a different email.');
            } else if (error.message.includes('affiliate_id') && error.message.includes('duplicate')) {
                setError('This Affiliate ID is already in use. Please choose a different one.');
            } else if (error.message.includes('network error') || error.message.includes('Failed to fetch')) {
                setError('Network error: Cannot connect to server. Please check your connection and try again.');
            } else {
                setError(error.message || `Failed to ${partner ? 'update' : 'register'} partner. Please try again.`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Generate a suggested affiliate ID based on name
    const generateAffiliateId = () => {
        if (formData.name && !formData.affiliateId && !partner) {
            const baseId = formData.name
                .toUpperCase()
                .replace(/[^A-Z]/g, '')
                .substring(0, 6);
            const randomNum = Math.floor(100 + Math.random() * 900);
            return `${baseId}${randomNum}`;
        }
        return formData.affiliateId;
    };

    // Auto-generate affiliate ID when name changes for new partners
    React.useEffect(() => {
        if (!partner && formData.name && !formData.affiliateId) {
            const suggestedId = generateAffiliateId();
            setFormData(prev => ({ ...prev, affiliateId: suggestedId }));
        }
    }, [formData.name, partner]);

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
                                Firm Name *
                            </label>
                            <input 
                                type="text" 
                                name="firm_name" 
                                id="firm_name" 
                                value={formData.firm_name} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required={formData.affiliate_type === 'Institute'} // ✅ Only required for Institute
                                disabled={loading}
                                placeholder="Enter firm or institute name"
                            />
                        </div>
                    )}

                    {/* Affiliate ID and Commission for both Add and Edit */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="affiliateId" className="block text-sm font-medium text-gray-700">
                                Affiliate ID *
                            </label>
                            <input 
                                type="text" 
                                name="affiliateId" 
                                id="affiliateId" 
                                value={formData.affiliateId} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading || !!partner} // Disable editing for existing partners
                                placeholder="e.g., AFF123456"
                                pattern="[A-Za-z0-9_-]+"
                                title="Only letters, numbers, hyphens, and underscores are allowed"
                            />
                            {!partner && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Auto-generated based on name. You can customize it.
                                </p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="commissionPercentage" className="block text-sm font-medium text-gray-700">
                                Commission % *
                            </label>
                            <input 
                                type="number" 
                                name="commissionPercentage" 
                                id="commissionPercentage" 
                                value={formData.commissionPercentage} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                min="0" 
                                max="100" 
                                step="0.5"
                                required
                                disabled={loading}
                                placeholder="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must be between 0 and 100
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                {formData.affiliate_type === 'Institute' ? 'Contact Person Name *' : 'Full Name *'}
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
                                placeholder={formData.affiliate_type === 'Institute' ? 'Contact person name' : 'Full name'}
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
                                placeholder="10-digit mobile number"
                                pattern="[0-9]{10}"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email *
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
                            placeholder="partner@example.com"
                        />
                    </div>
                    
                    {/* Only show password field for new partners */}
                    {!partner && (
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
                                Default password is provided. Partner can change it later.
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
                            placeholder="Full address with street, area, etc."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {partner ? 'Updating...' : 'Registering...'}
                                </span>
                            ) : (
                                partner ? 'Update Partner' : 'Register Partner'
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

export default AddEditPartnerModal;