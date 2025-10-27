import React, { useState, useEffect, useRef } from 'react';
import type { Course } from '../types';
import { indianDistricts } from '../data/indianDistricts';
import SearchableDropdown from './SearchableDropdown';
import { useNotifications } from '../context/NotificationsContext';
import { demoBookings } from '../data/mockData';

interface BookDemoModalProps {
  course: Course;
  onClose: () => void;
  affiliateId: string | null;
}

const qualifications = [
    "10th", "12th", "Graduated in IT", "Graduated from Non IT", 
    "BE", "ME PG in IT", "PG from Non IT", "Other"
];

const BookDemoModal: React.FC<BookDemoModalProps> = ({ course, onClose, affiliateId }) => {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        date: '',
        time: '',
        city: '',
        qualification: '',
        otherQualification: ''
    });

    const [errors, setErrors] = useState<Partial<typeof formData>>({});
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { addNotification } = useNotifications();
    
    const cityInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                // Fix: Corrected typo from cityInputnRef to cityInputRef
                cityInputRef.current && !cityInputRef.current.contains(event.target as Node) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
            ) {
                setCitySuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if(name === 'city') {
            if(value) {
                const filtered = indianDistricts.filter(d => d.toLowerCase().startsWith(value.toLowerCase())).slice(0, 5);
                setCitySuggestions(filtered);
            } else {
                setCitySuggestions([]);
            }
        }
    };
    
    const handleQualificationChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            qualification: value,
            otherQualification: value !== 'Other' ? '' : prev.otherQualification,
        }));
    };

    const selectCity = (city: string) => {
        setFormData(prev => ({ ...prev, city }));
        setCitySuggestions([]);
    }

    const validateForm = () => {
        const newErrors: Partial<typeof formData> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
        else if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be 10 digits";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        if (!formData.date) newErrors.date = "Preferred date is required";
        if (!formData.time) newErrors.time = "Preferred time is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.qualification) newErrors.qualification = "Qualification is required";
        if (formData.qualification === 'Other' && !formData.otherQualification.trim()) {
            newErrors.otherQualification = "Please specify your qualification";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const saveDataForAdmin = (data: typeof formData) => {
        const finalQualification = data.qualification === 'Other' ? data.otherQualification : data.qualification;
        const submissionData = {
            Name: data.name,
            Mobile: data.mobile,
            Email: data.email,
            Course: course.title,
            Date: data.date,
            Time: data.time,
            City: data.city,
            Qualification: finalQualification,
        };
        // In a real application, this would be an API call to a secure backend.
        console.log("--- ADMIN DATA SIMULATION ---");
        console.log("Simulating saving data to a secure CSV file accessible only by the admin.");
        console.log(submissionData);
        console.log("-----------------------------");
    };

    const sendConfirmationEmail = (data: typeof formData) => {
        // In a real application, this would be handled by a backend email service.
        console.log("--- USER EMAIL SIMULATION ---");
        console.log(`Sending confirmation email to: ${data.email}`);
        console.log(`Subject: Your Demo for "${course.title}" is Booked!`);
        console.log(`
        Hi ${data.name},

        Congratulations! Your Demo for the "${course.title}" course has been successfully booked for ${data.date} at ${data.time}.
        It could be the start of something great. Our team will contact you soon for confirmation.

        Best regards,
        Mentor Institute of Technologies`);
        console.log("---------------------------");
    };
    
    const sendAdminNotificationEmail = (data: typeof formData) => {
        const finalQualification = data.qualification === 'Other' ? data.otherQualification : data.qualification;
        const submissionData = {
            Name: data.name,
            Mobile: data.mobile,
            Email: data.email,
            Course: course.title,
            Date: data.date,
            Time: data.time,
            City: data.city,
            Qualification: finalQualification,
        };
        // In a real application, a backend service would email a CSV/data to the admin.
        console.log("--- ADMIN NOTIFICATION SIMULATION ---");
        console.log(`Sending new demo booking notification to: mentorbeed@gmail.com`);
        console.log(`Subject: New Demo Booking for "${course.title}"`);
        console.log("The central CSV has been updated (simulated) with the following data:");
        console.log(submissionData);
        console.log("-------------------------------------");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateForm()) {
            const newDemoBooking = {
                id: Date.now(),
                studentName: formData.name,
                studentEmail: formData.email,
                studentMobile: formData.mobile,
                courseId: course.id,
                referredByAffiliateId: affiliateId || undefined,
                bookingDate: formData.date,
                bookingTime: formData.time,
                status: 'Pending' as const,
                commissionPaid: false,
            };
            // Mutate the mock data array to simulate a DB write
            demoBookings.unshift(newDemoBooking);
            console.log("--- DEMO BOOKING (SIMULATED) ---");
            console.log("New demo booking saved:", newDemoBooking);
            console.log("-----------------------------------------");

            // Simulate backend operations
            saveDataForAdmin(formData);
            sendConfirmationEmail(formData);
            sendAdminNotificationEmail(formData);
            addNotification('new_demo', `New demo for ${course.title} by ${formData.name}.`);
            setIsSubmitted(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {isSubmitted ? (
                    <div className="text-center py-10">
                        <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="mt-4 text-2xl font-bold text-brand-navy">Congratulations!</h2>
                        <p className="mt-2 text-gray-700">Your Demo has been booked successfully, It could be the start of something great. Our team will contact you soon for confirmation.</p>
                        <p className="mt-2 text-xs text-gray-500">[A confirmation email has been sent to you (simulated). Admin has been notified and data has been saved for review.]</p>
                        <button onClick={onClose} className="mt-6 px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors">
                            Close
                        </button>
                    </div>
                ) : (
                <>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">Book a Free Demo</h2>
                {affiliateId && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded-md mb-4 text-sm">
                        <p>Referred by affiliate: <strong className="font-bold">{affiliateId}</strong></p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input type="tel" name="mobile" id="mobile" value={formData.mobile} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                             {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700">Selected Course</label>
                        <input type="text" name="course" id="course" value={course.title} readOnly disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                         {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                            <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                             {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Preferred Time</label>
                            <input type="time" name="time" id="time" value={formData.time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                             {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} ref={cityInputRef} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required autoComplete="off" />
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
                         <label htmlFor="qualification" className="block text-sm font-medium text-gray-700">Qualification</label>
                         <SearchableDropdown options={qualifications} value={formData.qualification} onChange={handleQualificationChange} id="qualification" required />
                         {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
                    </div>
                    {formData.qualification === 'Other' && (
                        <div>
                            <label htmlFor="otherQualification" className="block text-sm font-medium text-gray-700">Please Specify Qualification</label>
                            <input type="text" name="otherQualification" id="otherQualification" value={formData.otherQualification} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" required />
                            {errors.otherQualification && <p className="text-red-500 text-xs mt-1">{errors.otherQualification}</p>}
                        </div>
                    )}
                    <div className="pt-4">
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy">
                            Submit Request
                        </button>
                    </div>
                </form>
                </>
                )}
            </div>
        </div>
    );
};

export default BookDemoModal;