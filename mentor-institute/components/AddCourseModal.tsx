import React, { useState, useEffect } from 'react';
import type { Course } from '../types';

interface AddCourseModalProps {
    onClose: () => void;
    onSave: (courseData: any) => void;
    course: Course | null;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ onClose, onSave, course }) => {
    const [formData, setFormData] = useState({
        title: course?.title || '',
        description: course?.description || '',
        price: course?.price?.toString() || '',
        duration: course?.duration || '',
        level: course?.level || 'Beginner to Advanced',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(course?.image || null);
    const [errors, setErrors] = useState<Partial<typeof formData> & { image?: string }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                price: course.price?.toString() || '',
                duration: course.duration || '',
                level: course.level || 'Beginner to Advanced',
            });
            setImagePreview(course.image || null);
        }
    }, [course]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
                return;
            }
            
            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'Image must be smaller than 2MB' }));
                return;
            }

            setImageFile(file);
            setErrors(prev => ({ ...prev, image: undefined }));
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            // Clear image file if user removes selection
            setImageFile(null);
            setImagePreview(course?.image || null); // Reset to current image if editing
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        // Clear the file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };
    
    const validate = () => {
        const newErrors: Partial<typeof formData> & { image?: string } = {};
        if (!formData.title.trim()) newErrors.title = "Course name is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        if (!formData.price.trim() || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            newErrors.price = "A valid price is required.";
        }
        if (!formData.duration.trim()) newErrors.duration = "Duration is required.";
        
        // REMOVED: Image validation - image is now optional
        // No validation for image - it's optional

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
        const courseData = {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            duration: formData.duration,
            level: formData.level,
            image: imageFile, // This should be the File object
        };

        console.log('Submitting course data:', courseData);
        console.log('Image file:', imageFile);

        await onSave(courseData);
    } catch (error) {
        console.error('Error saving course:', error);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
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
                    {course ? 'Edit Course' : 'Add New Course'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Name *</label>
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className="mt-1 input-style" 
                            required 
                            disabled={loading}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea 
                            name="description" 
                            id="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows={4} 
                            className="mt-1 input-style" 
                            required 
                            disabled={loading}
                        />
                         {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Fees (INR) *</label>
                            <input 
                                type="number" 
                                name="price" 
                                id="price" 
                                value={formData.price} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                                min="0"
                            />
                             {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration *</label>
                            <input 
                                type="text" 
                                name="duration" 
                                id="duration" 
                                placeholder="e.g., 6 Months" 
                                value={formData.duration} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                            />
                             {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level *</label>
                        <select 
                            name="level" 
                            id="level" 
                            value={formData.level} 
                            onChange={handleChange} 
                            className="mt-1 input-style"
                            disabled={loading}
                        >
                            <option value="Beginner to Advanced">Beginner to Advanced</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                            Course Image (Optional)
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Recommended dimensions: 600x300 pixels. Max size: 2MB</p>
                        <input 
                            type="file" 
                            name="image" 
                            id="image" 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:bg-opacity-10 file:text-brand-purple hover:file:bg-opacity-20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" 
                            // REMOVED: required={!course} - image is now optional
                            disabled={loading}
                        />
                         {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        
                        {/* Image Preview with Remove Option */}
                        {imagePreview && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="w-48 h-24 object-cover rounded-md border" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        ×
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Click the × to remove this image
                                </p>
                            </div>
                        )}
                        
                        {/* Show current image info when editing */}
                        {course && !imageFile && course.image && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                                <img src={course.image} alt="Current" className="w-48 h-24 object-cover rounded-md border" />
                                <p className="text-xs text-gray-500 mt-1">
                                    Upload a new image to replace the current one, or leave empty to keep it
                                </p>
                            </div>
                        )}
                        
                        {/* Show message when no image is set */}
                        {!imagePreview && !course?.image && (
                            <p className="text-xs text-gray-500 mt-2">
                                No image selected. A default placeholder will be used.
                            </p>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 disabled:opacity-50 transition-colors flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {course ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                course ? 'Update Course' : 'Create Course'
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
            `}</style>
        </div>
    );
};

export default AddCourseModal;