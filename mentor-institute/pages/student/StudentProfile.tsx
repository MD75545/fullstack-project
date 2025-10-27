import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Student } from '../../types';

const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const studentData = user as Student;

    const [profile, setProfile] = useState({
        photo: studentData.photo || '',
        displayName: studentData.displayName || 'real_name',
        gender: studentData.gender || 'other',
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(studentData.photo || null);
    const [isSaved, setIsSaved] = useState(false);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
                // In a real app, you would upload this file and get a URL
                // For simulation, we'll just use the base64 string
                setProfile(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save the profile to a backend.
        // For this demo, we'll just log it and show a success message.
        console.log("Saving profile (simulated):", profile);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                    <div className="mt-2 flex items-center gap-4">
                        <span className="inline-block h-20 w-20 rounded-full overflow-hidden bg-gray-100">
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile Preview" className="h-full w-full object-cover" />
                            ) : (
                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            )}
                        </span>
                        <input
                          type="file"
                          id="photo-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoChange}
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        >
                          Change
                        </label>
                    </div>
                </div>

                {/* Display Name Preference */}
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name on Leaderboards</label>
                    <select
                        id="displayName"
                        name="displayName"
                        value={profile.displayName}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
                    >
                        <option value="real_name">Show my real name</option>
                        <option value="anonymous">Show as Anonymous</option>
                    </select>
                </div>

                {/* Gender Selection */}
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                     <p className="text-xs text-gray-500 mb-1">Used for displaying a default avatar if no photo is uploaded.</p>
                    <select
                        id="gender"
                        name="gender"
                        value={profile.gender}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm rounded-md"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Prefer not to say</option>
                    </select>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4 border-t">
                     {isSaved && <p className="text-sm text-green-600">Profile saved successfully!</p>}
                    <button type="submit" className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors">
                        Save Profile
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StudentProfile;