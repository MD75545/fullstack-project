import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationsContext';
import { courses } from '../data/mockData';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';
import { registerUser } from '../services/api';

interface PartnerModalProps {
  onClose: () => void;
}

type JoinAsType = 'Teacher' | 'Affiliate' | 'Both';
type AffiliateType = 'Individual' | 'Institute';

const qualifications = [
    "10th", "12th", "Graduated in IT", "Graduated from Non IT", 
    "BE", "ME PG in IT", "PG from Non IT", "Other"
];

const PartnerModal: React.FC<PartnerModalProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        joinAs: 'Teacher' as JoinAsType, // FIXED: Changed from invalid value
        affiliateType: 'Individual' as AffiliateType,
        instituteName: '',
        website: '',
        city: '',
        address: '',
        qualification: '',
        otherQualification: '',
        teachingExperience: '',
        interestedCourses: [] as number[],
        resume: null as File | null,
        videoLink: '',
        videoFile: null as File | null,
    });

    const [errors, setErrors] = useState<Partial<Omit<typeof formData, 'interestedCourses'>> & { interestedCourses?: string }>({});
    const [videoError, setVideoError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const { addNotification } = useNotifications();

    const cityInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cityInputRef.current && !cityInputRef.current.contains(event.target as Node) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
            ) {
                setCitySuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'city') {
            if (value) {
                const filtered = indianDistricts.filter(d => d.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5);
                setCitySuggestions(filtered);
            } else {
                setCitySuggestions([]);
            }
        }
        
        // Clear submit error when user starts typing
        if (submitError) setSubmitError('');
    };

    const selectCity = (city: string) => {
        setFormData(prev => ({ ...prev, city }));
        setCitySuggestions([]);
    }

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleQualificationChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            qualification: value,
            otherQualification: value !== 'Other' ? '' : prev.otherQualification,
        }));
    };

    const handleCourseChange = (courseId: number) => {
        setFormData(prev => {
            const newCourses = prev.interestedCourses.includes(courseId)
                ? prev.interestedCourses.filter(id => id !== courseId)
                : [...prev.interestedCourses, courseId];
            return { ...prev, interestedCourses: newCourses };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, resume: e.target.files![0] }));
        }
    };
    
    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setVideoError('File size cannot exceed 5MB.');
                setFormData(prev => ({ ...prev, videoFile: null }));
                e.target.value = ''; // Clear the input
            } else {
                setVideoError('');
                setFormData(prev => ({ ...prev, videoFile: file }));
            }
        } else {
             setFormData(prev => ({ ...prev, videoFile: null }));
        }
    };

    const validateForm = () => {
        console.log('🔍 VALIDATION STARTED ===');
        console.log('Current joinAs:', formData.joinAs);
        console.log('Form data:', formData);
        
        const newErrors: any = {};
        
        // Basic required fields
        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
            console.log('❌ Name validation failed');
        }
        
        if (!formData.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
            console.log('❌ Mobile validation failed');
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = "Mobile number must be 10 digits";
            console.log('❌ Mobile format validation failed');
        }
        
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
            console.log('❌ Email validation failed');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
            console.log('❌ Email format validation failed');
        }
        
        // Address is required for all roles
        if (!formData.city.trim()) {
            newErrors.city = "City is required";
            console.log('❌ City validation failed');
        }
        
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
            console.log('❌ Address validation failed');
        }

        // Teacher-specific validation
        if (formData.joinAs === 'Teacher' || formData.joinAs === 'Both') {
            console.log('🔍 Checking teacher validation...');
            console.log('Qualification:', formData.qualification);
            console.log('Teaching Experience:', formData.teachingExperience);
            console.log('Interested Courses:', formData.interestedCourses);
            
            if (!formData.qualification) {
                newErrors.qualification = "Qualification is required";
                console.log('❌ Qualification validation failed');
            }
            
            if (formData.qualification === 'Other' && !formData.otherQualification.trim()) {
                newErrors.otherQualification = "Please specify your qualification";
                console.log('❌ Other qualification validation failed');
            }
            
            if (!formData.teachingExperience.trim()) {
                newErrors.teachingExperience = "Teaching experience is required";
                console.log('❌ Teaching experience validation failed');
            } else if (isNaN(Number(formData.teachingExperience))) {
                newErrors.teachingExperience = "Experience must be a number";
                console.log('❌ Teaching experience format validation failed');
            }
            
            if (formData.interestedCourses.length === 0) {
                newErrors.interestedCourses = "Please select at least one course";
                console.log('❌ Interested courses validation failed');
            }
        }

        // Affiliate-specific validation
        if (formData.joinAs === 'Affiliate' || formData.joinAs === 'Both') {
            console.log('🔍 Checking affiliate validation...');
            console.log('Affiliate Type:', formData.affiliateType);
            console.log('Institute Name:', formData.instituteName);
            
            if (formData.affiliateType === 'Institute' && !formData.instituteName.trim()) {
                newErrors.instituteName = "Institute name is required";
                console.log('❌ Institute name validation failed');
            }
        }

        console.log('📊 VALIDATION RESULT - Total errors:', Object.keys(newErrors).length);
        console.log('Specific errors:', newErrors);
        
        setErrors(newErrors);
        const isValid = Object.keys(newErrors).length === 0 && !videoError;
        console.log('✅ Form is valid:', isValid);
        return isValid;
    };

    const sendConfirmationEmail = () => {
        console.log("--- PARTNER/TEACHER EMAIL SIMULATION ---");
        console.log(`Sending confirmation email to: ${formData.email}`);
        console.log(`
        Hi ${formData.name},

        Thank you for your interest in joining Mentor Institute of Technologies as a ${formData.joinAs}.
        Our team will review your application and contact you soon to discuss the next steps.

        Best regards,
        Mentor Institute of Technologies`);
        console.log("--------------------------------");
    };

    const sendAdminNotification = () => {
        const { resume, videoFile, ...dataToSend } = formData;
        const submissionData = {
            ...dataToSend,
            resume: resume ? resume.name : 'Not provided',
            videoFile: videoFile ? videoFile.name : 'Not provided',
            interestedCourses: formData.interestedCourses.map(id => courses.find(c => c.id === id)?.title).join(', ')
        }
        console.log("--- ADMIN NOTIFICATION (JOIN US) SIMULATION ---");
        console.log(`Sending new registration data to: mentorbeed@gmail.com`);
        console.log("A new registration has been submitted:");
        console.log(submissionData);
        console.log("----------------------------------------------");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        console.log('=== 🚀 FORM SUBMISSION STARTED ===');
        console.log('Current form state:', formData);

        const isValid = validateForm();
        
        if (!isValid) {
            console.log('❌ FORM VALIDATION FAILED - Stopping submission');
            return;
        }

        console.log('✅ FORM VALIDATION PASSED - Proceeding with API call');
        
        setIsSubmitting(true);
        setSubmitError('');

        try {
            // Prepare data for Laravel API
            const apiData: any = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                password: 'defaultPassword123',
                join_as: formData.joinAs,
                affiliate_type: formData.affiliateType,
                city: formData.city,
                address: formData.address,
                firm_name: formData.instituteName || '',
            };

            // Add teacher-specific fields if applicable
            if (formData.joinAs === 'Teacher' || formData.joinAs === 'Both') {
                apiData.specialization = formData.qualification === 'Other' 
                    ? formData.otherQualification 
                    : formData.qualification;
                apiData.teaching_experience = formData.teachingExperience;
                
                // Ensure specialization is never empty
                if (!apiData.specialization) {
                    apiData.specialization = 'General Education';
                    console.log('⚠️  Setting default specialization');
                }
            }

            console.log('📤 FINAL API PAYLOAD:', apiData);
            console.log('🌐 Making API call to Laravel...');

            // Call Laravel API
            const response = await registerUser(apiData);
            
            console.log('✅ API CALL SUCCESSFUL');
            console.log('API Response:', response);

            if (response.status === 'success') {
                console.log('🎉 REGISTRATION SUCCESSFUL');
                // Success - show confirmation and close modal
                sendConfirmationEmail();
                sendAdminNotification();
                addNotification('new_partner', `New registration (${formData.joinAs}) from ${formData.name}.`);
                setIsSubmitted(true);
            } else {
                console.log('❌ REGISTRATION FAILED IN RESPONSE');
                setSubmitError(response.message || 'Registration failed. Please try again.');
            }
        } catch (error: any) {
            console.error('💥 API ERROR:', error);
            setSubmitError(error.message || 'Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const showTeacherFields = formData.joinAs === 'Teacher' || formData.joinAs === 'Both';
    const showAffiliateFields = formData.joinAs === 'Affiliate' || formData.joinAs === 'Both';

    const renderAddressFields = () => (
        <>
            <div className="relative">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                <input 
                    type="text" 
                    name="city" 
                    id="city" 
                    value={formData.city} 
                    onChange={handleChange} 
                    ref={cityInputRef} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                    required 
                    autoComplete="off" 
                    disabled={isSubmitting}
                />
                {citySuggestions.length > 0 && (
                    <div ref={suggestionsRef} className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                        {citySuggestions.map(city => (
                            <div key={city} onClick={() => selectCity(city)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                                {city}
                            </div>
                        ))}
                    </div>
                )}
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea 
                    id="address" 
                    name="address" 
                    rows={3} 
                    required 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                    disabled={isSubmitting}
                ></textarea>
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
        </>
    );

    // Course selection component
    const renderCourseSelection = () => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Interested Courses (Select at least one)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                {courses.map(course => (
                    <div key={course.id} className="flex items-center">
                        <input
                            id={`course-${course.id}`}
                            type="checkbox"
                            checked={formData.interestedCourses.includes(course.id)}
                            onChange={() => handleCourseChange(course.id)}
                            className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded"
                            disabled={isSubmitting}
                        />
                        <label htmlFor={`course-${course.id}`} className="ml-2 text-sm text-gray-700">
                            {course.title}
                        </label>
                    </div>
                ))}
            </div>
            {errors.interestedCourses && <p className="text-red-500 text-xs mt-1">{errors.interestedCourses}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    disabled={isSubmitting}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {isSubmitted ? (
                    <div className="text-center py-10">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-bold text-brand-navy">Application Received!</h2>
                        <p className="mt-2 text-gray-700">Thank you for your interest in joining us. Our team will review your application and be in touch shortly.</p>
                        <button 
                            onClick={onClose} 
                            className="mt-6 px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                <>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">Join Us</h2>
                
                {/* API Error Display */}
                {submitError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        <strong>Error:</strong> {submitError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                id="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                required 
                                disabled={isSubmitting}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input 
                                type="tel" 
                                name="mobile" 
                                id="mobile" 
                                value={formData.mobile} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                required 
                                disabled={isSubmitting}
                            />
                             {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                            required 
                            disabled={isSubmitting}
                        />
                         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Join As</label>
                        <div className="mt-2 flex items-center space-x-4 sm:space-x-6">
                            {(['Teacher', 'Affiliate', 'Both'] as JoinAsType[]).map(option => (
                                <div key={option} className="flex items-center">
                                    <input 
                                        id={`joinAs-${option}`} 
                                        name="joinAs" 
                                        type="radio" 
                                        value={option} 
                                        checked={formData.joinAs === option} 
                                        onChange={handleRadioChange} 
                                        className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300" 
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor={`joinAs-${option}`} className="ml-2 block text-sm text-gray-900">{option}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Affiliate Fields */}
                    {showAffiliateFields && (
                         <div className="space-y-4 border-t border-gray-200 pt-4">
                            <h3 className="text-md font-semibold text-gray-800">Affiliate Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Affiliate Type</label>
                                <div className="mt-2 flex items-center space-x-4 sm:space-x-6">
                                    {(['Individual', 'Institute'] as AffiliateType[]).map(option => (
                                        <div key={option} className="flex items-center">
                                            <input 
                                                id={`affiliateType-${option}`} 
                                                name="affiliateType" 
                                                type="radio" 
                                                value={option} 
                                                checked={formData.affiliateType === option} 
                                                onChange={handleRadioChange} 
                                                className="focus:ring-brand-purple h-4 w-4 text-brand-purple border-gray-300" 
                                                disabled={isSubmitting}
                                            />
                                            <label htmlFor={`affiliateType-${option}`} className="ml-2 block text-sm text-gray-900">{option}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {formData.affiliateType === 'Institute' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label htmlFor="instituteName" className="block text-sm font-medium text-gray-700">Institute Name</label>
                                        <input 
                                            type="text" 
                                            name="instituteName" 
                                            id="instituteName" 
                                            value={formData.instituteName} 
                                            onChange={handleChange} 
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                            required 
                                            disabled={isSubmitting}
                                        />
                                        {errors.instituteName && <p className="text-red-500 text-xs mt-1">{errors.instituteName}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website (Optional)</label>
                                        <input 
                                            type="url" 
                                            name="website" 
                                            id="website" 
                                            value={formData.website} 
                                            onChange={handleChange} 
                                            placeholder="https://example.com" 
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>
                            )}
                            {formData.joinAs === 'Affiliate' && renderAddressFields()}
                         </div>
                    )}

                    {/* Teacher Fields */}
                    {showTeacherFields && (
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                             <h3 className="text-md font-semibold text-gray-800">Teacher Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                                    <SearchableDropdown 
                                        options={qualifications} 
                                        value={formData.qualification} 
                                        onChange={handleQualificationChange} 
                                        id="qualification" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                    {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                                </div>
                                {formData.qualification === 'Other' ? (
                                    <div>
                                        <label htmlFor="otherQualification" className="block text-sm font-medium text-gray-700">Please Specify</label>
                                        <input 
                                            type="text" 
                                            name="otherQualification" 
                                            id="otherQualification" 
                                            value={formData.otherQualification} 
                                            onChange={handleChange} 
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                            required 
                                            disabled={isSubmitting}
                                        />
                                        {errors.otherQualification && <p className="text-red-500 text-xs mt-1">{errors.otherQualification}</p>}
                                    </div>
                                ) : <div />}
                             </div>
                            <div>
                                <label htmlFor="teachingExperience" className="block text-sm font-medium text-gray-700">Teaching Experience (in years)</label>
                                <input 
                                    type="number" 
                                    name="teachingExperience" 
                                    id="teachingExperience" 
                                    value={formData.teachingExperience} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" 
                                    required 
                                    disabled={isSubmitting}
                                />
                                {errors.teachingExperience && <p className="text-red-500 text-xs mt-1">{errors.teachingExperience}</p>}
                            </div>

                            {/* Course Selection */}
                            {renderCourseSelection()}
                            
                            {/* Address fields for Teacher and Both */}
                            {(formData.joinAs === 'Teacher' || formData.joinAs === 'Both') && renderAddressFields()}
                        </div>
                    )}
                    
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
                </>
                )}
            </div>
        </div>
    );
};

export default PartnerModal;