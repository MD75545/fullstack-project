import React, { useState } from 'react';
import type { Task, Teacher } from '../types';
import { users } from '../data/mockData';

interface AddEditTaskModalProps {
    onClose: () => void;
    onSave: (taskData: Omit<Task, 'id'>) => void;
    task: Task | null;
}

const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({ onClose, onSave, task }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        assignedTo: task?.assignedTo || 0,
        dueDate: task?.dueDate || '',
        status: task?.status || 'Pending',
        priority: task?.priority || 'Medium',
    });

    const teachers = users.filter(u => u.role === 'teacher') as Teacher[];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'assignedTo' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.dueDate || !formData.assignedTo) {
            alert('Please fill in Title, Due Date, and Assign To fields.');
            return;
        }
        onSave(formData as Omit<Task, 'id'>);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close modal">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">{task ? 'Edit Task' : 'Add Task'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 input-style" required />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 input-style" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                            <select name="assignedTo" id="assignedTo" value={formData.assignedTo} onChange={handleChange} className="mt-1 input-style" required>
                                <option value={0} disabled>Select a teacher...</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                            <input type="date" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleChange} className="mt-1 input-style" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 input-style">
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                            <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className="mt-1 input-style">
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90">
                            Save Task
                        </button>
                    </div>
                </form>
            </div>
             <style>{`.input-style { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #D1D5DB; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); outline: none; } .input-style:focus { ring: 1px; ring-color: #805AD5; border-color: #805AD5; }`}</style>
        </div>
    );
};

export default AddEditTaskModal;
