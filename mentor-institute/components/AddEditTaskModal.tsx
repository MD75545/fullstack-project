import React, { useState, useEffect } from 'react';
import type { Task, Teacher } from '../types';
import { getTaskTeachers, createTask, updateTask } from '../services/api';

interface AddEditTaskModalProps {
    onClose: () => void;
    onSave: (taskData: any) => void;
    task: Task | null;
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({ onClose, onSave, task }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assigned_to_teacher_id: task?.assignedTo || 0,
        due_date: task?.dueDate || '',
        status: task?.status || 'Pending',
        priority: task?.priority || 'Medium',
    });
    
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await getTaskTeachers();
            if (response.success) {
                setTeachers(response.data);
            } else {
                setError('Failed to load teachers');
            }
        } catch (err) {
            setError('Error loading teachers');
            console.error('Error fetching teachers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'assigned_to_teacher_id' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.due_date || !formData.assigned_to_teacher_id) {
            alert('Please fill in Title, Due Date, and Assign To fields.');
            return;
        }

        try {
            setLoading(true);
            let response;
            
            if (task) {
                // Update existing task
                response = await updateTask(task.id, formData);
            } else {
                // Create new task
                response = await createTask(formData);
            }

            if (response.success) {
                onSave(response.data);
            } else {
                setError(response.message || 'Failed to save task');
            }
        } catch (err: any) {
            setError(err.message || 'Error saving task');
            console.error('Error saving task:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">{task ? 'Edit Task' : 'Add Task'}</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
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
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            name="description" 
                            id="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            rows={3} 
                            className="mt-1 input-style" 
                            disabled={loading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assigned_to_teacher_id" className="block text-sm font-medium text-gray-700">Assign To</label>
                            <select 
                                name="assigned_to_teacher_id" 
                                id="assigned_to_teacher_id" 
                                value={formData.assigned_to_teacher_id} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required
                                disabled={loading}
                            >
                                <option value={0} disabled>Select a teacher...</option>
                                {teachers.map(t => (
                                    <option key={t.user_id} value={t.user_id}>
                                        {t.name} {t.specialization ? `- ${t.specialization}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input 
                                type="date" 
                                name="due_date" 
                                id="due_date" 
                                value={formData.due_date} 
                                onChange={handleChange} 
                                className="mt-1 input-style" 
                                required 
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select 
                                name="status" 
                                id="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="mt-1 input-style"
                                disabled={loading}
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                            <select 
                                name="priority" 
                                id="priority" 
                                value={formData.priority} 
                                onChange={handleChange} 
                                className="mt-1 input-style"
                                disabled={loading}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
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
                            {loading ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; } .input-style:focus { ring: 1px; ring-color: #805AD5; border-color: #805AD5; }`}</style>
        </div>
    );
};

export default AddEditTaskModal;