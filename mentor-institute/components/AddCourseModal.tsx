import React, { useState } from 'react';
import type { Course } from '../types';

interface AddCourseModalProps {
    onClose: () => void;
    onSave: (courseData: Omit<Course, 'id' | 'icon' | 'syllabus'>) => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        level: 'Beginner to Advanced',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<typeof formData> & { image?: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
        if (!imageFile) newErrors.image = "Course image is required.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                duration: formData.duration,
                level: formData.level,
                image: imagePreview!, // We know it's not null due to validation
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">Add New Course</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Name</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 input-style" required />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 input-style" required />
                         {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Fees (INR)</label>
                            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 input-style" required />
                             {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration</label>
                            <input type="text" name="duration" id="duration" placeholder="e.g., 6 Months" value={formData.duration} onChange={handleChange} className="mt-1 input-style" required />
                             {errors.duration && <p className="text-red-500 text-xs mt-1">{errors.duration}</p>}
                        </div>
                    </div>
                     <div>
                        <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level</label>
                        <select name="level" id="level" value={formData.level} onChange={handleChange} className="mt-1 input-style">
                            <option>Beginner to Advanced</option>
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Course Image</label>
                        <p className="text-xs text-gray-500 mb-2">Recommended dimensions: 600x300 pixels.</p>
                        <input type="file" name="image" id="image" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-purple file:bg-opacity-10 file:text-brand-purple hover:file:bg-opacity-20 cursor-pointer" required />
                         {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-4 w-48 h-24 object-cover rounded-md" />}
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90">
                            Save Course
                        </button>
                    </div>
                </form>
            </div>
            <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; } .input-style:focus { ring: 1px; ring-color: #805AD5; border-color: #805AD5; }`}</style>
        </div>
    );
};

export default AddCourseModal;
