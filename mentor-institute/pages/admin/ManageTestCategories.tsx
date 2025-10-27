import React, { useState, useMemo } from 'react';
import { testCategories as initialCategories } from '../../data/mockData';
import type { TestCategory } from '../../types';
import { useSearch } from '../../context/SearchContext';

interface ModalProps {
    onClose: () => void;
    onSave: (name: string) => void;
    category?: TestCategory | null;
}

const CategoryModal: React.FC<ModalProps> = ({ onClose, onSave, category }) => {
    const [name, setName] = useState(category?.name || '');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{category ? 'Edit' : 'Add'} Category</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-brand-purple focus:border-brand-purple"
                        placeholder="Category Name"
                        required
                        autoFocus
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ManageTestCategories: React.FC = () => {
    const [categories, setCategories] = useState<TestCategory[]>(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
    const { searchQuery } = useSearch();

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const lowercasedQuery = searchQuery.toLowerCase();
        return categories.filter(c => c.name.toLowerCase().includes(lowercasedQuery));
    }, [categories, searchQuery]);

    const handleAdd = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: TestCategory) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (categoryId: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            setCategories(prev => prev.filter(c => c.id !== categoryId));
        }
    };

    const handleSave = (name: string) => {
        if (editingCategory) {
            // Edit existing
            setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name } : c));
        } else {
            // Add new
            const newCategory: TestCategory = { id: Date.now(), name };
            setCategories(prev => [...prev, newCategory]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h2 className="text-xl font-bold text-gray-800">Test Categories ({filteredCategories.length})</h2>
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Category</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Category Name</th>
                            <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map(category => (
                            <tr key={category.id} className="hover:bg-slate-50">
                                <td className="py-3 px-4 border-b border-slate-200">{category.name}</td>
                                <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                                    <button onClick={() => handleEdit(category)} className="text-brand-purple font-medium hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(category.id)} className="text-red-500 font-medium hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                         {filteredCategories.length === 0 && (
                            <tr>
                                <td colSpan={2} className="text-center py-8 text-gray-500">
                                    No categories found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <CategoryModal onClose={() => setIsModalOpen(false)} onSave={handleSave} category={editingCategory} />}
        </div>
    );
};

export default ManageTestCategories;
