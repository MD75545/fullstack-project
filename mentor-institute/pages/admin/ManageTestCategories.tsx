import React, { useState, useMemo, useEffect } from 'react';
import type { TestCategory } from '../../types';
import { useSearch } from '../../context/SearchContext';
import { getTestCategories, createTestCategory, updateTestCategory, deleteTestCategory } from '../../services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

interface CategoryModalProps {
    onClose: () => void;
    onSave: (name: string) => void;
    category?: TestCategory | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, onSave, category }) => {
    const [name, setName] = useState(category?.name || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            try {
                setLoading(true);
                setError('');
                
                if (category) {
                    // Edit existing category
                    const response = await updateTestCategory(category.id, { name: name.trim() });
                    if (response.success) {
                        onSave(name);
                    } else {
                        setError(response.message || 'Failed to update category');
                    }
                } else {
                    // Add new category
                    const response = await createTestCategory({ name: name.trim() });
                    if (response.success) {
                        onSave(name);
                    } else {
                        setError(response.message || 'Failed to create category');
                    }
                }
            } catch (err: any) {
                setError(err.message || 'Error saving category');
                console.error('Error saving category:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{category ? 'Edit' : 'Add'} Category</h2>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-brand-purple focus:border-brand-purple"
                        placeholder="Category Name"
                        required
                        autoFocus
                        disabled={loading}
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageTestCategories: React.FC = () => {
    const [categories, setCategories] = useState<TestCategory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<TestCategory | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { searchQuery } = useSearch();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching categories from API...');
            
            const response = await getTestCategories();
            console.log('Categories API response:', response);
            
            if (response.success) {
                console.log('Raw categories data:', response.data);
                
                // Transform API data to match frontend TestCategory type
                const transformedCategories = response.data.map((category: any) => ({
                    id: category.test_category_id,
                    name: category.name
                }));
                
                console.log('Transformed categories:', transformedCategories);
                setCategories(transformedCategories);
            } else {
                setError(response.message || 'Failed to load categories');
            }
        } catch (err: any) {
            setError(err.message || 'Error loading categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const handleDeleteClick = (category: TestCategory) => {
        setDeletingCategory(category);
    };

    const confirmDelete = async () => {
        if (deletingCategory) {
            try {
                setLoading(true);
                const response = await deleteTestCategory(deletingCategory.id);
                if (response.success) {
                    // Refresh the categories list
                    await fetchCategories();
                    setDeletingCategory(null);
                } else {
                    setError(response.message || 'Failed to delete category');
                }
            } catch (err: any) {
                setError(err.message || 'Error deleting category');
                console.error('Error deleting category:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = () => {
        // Categories are refreshed automatically when modal closes
        setIsModalOpen(false);
        fetchCategories();
    };

    if (loading && categories.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-center items-center h-32">
                    <div className="text-lg">Loading categories...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
                <h2 className="text-xl font-bold text-gray-800">
                    Test Categories ({filteredCategories.length})
                    {categories.length > 0 && ` - Total: ${categories.length}`}
                </h2>
                <button 
                    onClick={handleAdd} 
                    className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
                    disabled={loading}
                >
                    Add Category
                </button>
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
                                    <button 
                                        onClick={() => handleEdit(category)} 
                                        className="text-brand-purple font-medium hover:underline"
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(category)} 
                                        className="text-red-500 font-medium hover:underline"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                         {filteredCategories.length === 0 && !loading && (
                            <tr>
                                <td colSpan={2} className="text-center py-8 text-gray-500">
                                    {categories.length === 0 ? 'No categories found. Create your first category!' : 'No categories match your search criteria.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {isModalOpen && (
                <CategoryModal 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSave} 
                    category={editingCategory} 
                />
            )}
            
            {deletingCategory && (
                <ConfirmationModal
                    title="Delete Category"
                    message={`Are you sure you want to delete the category "${deletingCategory.name}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingCategory(null)}
                />
            )}
        </div>
    );
};

export default ManageTestCategories;