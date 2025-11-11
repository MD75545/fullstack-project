import React, { useState, useMemo, useEffect } from 'react';
import { getTeachers, deleteTeacher } from '../../services/api'; // Import deleteTeacher
import type { Teacher } from '../../types';
import AddEditTeacherModal from '../../components/AddEditTeacherModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';

const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { searchQuery } = useSearch();

  // Fetch teachers from API on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getTeachers();
        
        if (response.success && response.data) {
          // Transform API data to match your Teacher type
          const teachersData: Teacher[] = response.data.map((teacher: any) => ({
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            mobile: teacher.mobile || '',
            specialization: teacher.specialization || 'Not specified',
            city: teacher.city || '',
            address: teacher.address || '',
            affiliateId: teacher.affiliateId || '',
            commissionPercentage: teacher.commissionPercentage || 0,
            role: 'teacher',
            earnings: teacher.earnings || 0
          }));
          setTeachers(teachersData);
        } else {
          setError(response.message || 'Failed to load teachers');
        }
      } catch (error: any) {
        console.error('Error fetching teachers:', error);
        setError(error.message || 'Failed to load teachers. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    if (!searchQuery) {
        return teachers;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return teachers.filter(teacher =>
        teacher.name.toLowerCase().includes(lowercasedQuery) ||
        teacher.email.toLowerCase().includes(lowercasedQuery) ||
        teacher.specialization.toLowerCase().includes(lowercasedQuery) ||
        (teacher.city && teacher.city.toLowerCase().includes(lowercasedQuery))
    );
  }, [teachers, searchQuery]);

  const handleCommissionChange = (teacherId: number, commission: string) => {
    const newCommission = parseInt(commission, 10);
    const updatedTeachers = teachers.map(t => {
        if (t.id === teacherId) {
            let commissionValue = 0;
            if (commission !== '' && !isNaN(newCommission) && newCommission >= 0 && newCommission <= 100) {
                commissionValue = newCommission;
            }
            return { ...t, commissionPercentage: commissionValue };
        }
        return t;
    });
    setTeachers(updatedTeachers);
  };
  
  const handleOpenAddModal = () => {
      setEditingTeacher(null);
      setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (teacher: Teacher) => {
      setEditingTeacher(teacher);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingTeacher(null);
  };

  const handleSaveTeacher = async (teacherData: Omit<Teacher, 'id' | 'role' | 'earnings'>) => {
    try {
      // Refresh the teachers list after adding/editing
      const response = await getTeachers();
      if (response.success && response.data) {
        const teachersData: Teacher[] = response.data.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          mobile: teacher.mobile || '',
          specialization: teacher.specialization || 'Not specified',
          city: teacher.city || '',
          address: teacher.address || '',
          affiliateId: teacher.affiliateId || '',
          commissionPercentage: teacher.commissionPercentage || 0,
          role: 'teacher',
          earnings: teacher.earnings || 0
        }));
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error refreshing teachers:', error);
      setError('Failed to refresh teachers list');
    }
    
    handleCloseModal();
  };

  const handleDeleteClick = (teacher: Teacher) => {
      setDeletingTeacher(teacher);
  };
  
  const confirmDelete = async () => {
      if(deletingTeacher) {
          try {
              console.log('Deleting teacher:', deletingTeacher.id);
              
              const response = await deleteTeacher(deletingTeacher.id);
              
              if (response.success) {
                  console.log('Teacher deleted successfully');
                  
                  // Refresh the teachers list
                  const teachersResponse = await getTeachers();
                  if (teachersResponse.success && teachersResponse.data) {
                    const teachersData: Teacher[] = teachersResponse.data.map((teacher: any) => ({
                      id: teacher.id,
                      name: teacher.name,
                      email: teacher.email,
                      mobile: teacher.mobile || '',
                      specialization: teacher.specialization || 'Not specified',
                      city: teacher.city || '',
                      address: teacher.address || '',
                      affiliateId: teacher.affiliateId || '',
                      commissionPercentage: teacher.commissionPercentage || 0,
                      role: 'teacher',
                      earnings: teacher.earnings || 0
                    }));
                    setTeachers(teachersData);
                  }
                  
                  setError(''); // Clear any previous errors
              } else {
                  setError(response.message || 'Failed to delete teacher');
              }
          } catch (error: any) {
              console.error('Error deleting teacher:', error);
              setError(error.message || 'Failed to delete teacher. Please try again.');
          } finally {
              setDeletingTeacher(null);
          }
      }
  };

  // Add loading state
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading teachers...</div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-xl font-bold text-gray-800">Teachers List ({filteredTeachers.length})</h2>
        <button onClick={handleOpenAddModal} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Teacher</button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Contact</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Specialization</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Location</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Commission %</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 border-b border-slate-200">{teacher.name}</td>
                <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                    <div>{teacher.email}</div>
                    {teacher.mobile && <div className="text-xs text-gray-500">{teacher.mobile}</div>}
                </td>
                <td className="py-3 px-4 border-b border-slate-200">{teacher.specialization}</td>
                <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">
                    {teacher.city && <div>{teacher.city}</div>}
                    {teacher.address && <div className="text-xs text-gray-500 truncate" title={teacher.address}>{teacher.address}</div>}
                </td>
                <td className="py-3 px-4 border-b border-slate-200">
                    {teacher.affiliateId ? (
                         <input 
                            type="number" 
                            value={teacher.commissionPercentage || 0} 
                            onChange={(e) => handleCommissionChange(teacher.id, e.target.value)}
                            className="w-20 p-1 border border-slate-300 rounded-md focus:ring-brand-purple focus:border-brand-purple text-sm"
                            min="0"
                            max="100"
                            aria-label={`Commission for ${teacher.name}`}
                        />
                    ) : (
                        <span className="text-gray-400 text-xs">N/A</span>
                    )}
                </td>
                <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                  <button onClick={() => handleOpenEditModal(teacher)} className="text-brand-purple font-medium hover:underline">Edit</button>
                  <button onClick={() => handleDeleteClick(teacher)} className="text-red-500 font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
             {filteredTeachers.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {teachers.length === 0 ? 'No teachers found.' : 'No teachers matching your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    {isModalOpen && (
        <AddEditTeacherModal
            teacher={editingTeacher}
            onClose={handleCloseModal}
            onSave={handleSaveTeacher}
        />
    )}
    {deletingTeacher && (
        <ConfirmationModal
            title="Delete Teacher"
            message={`Are you sure you want to delete ${deletingTeacher.name}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingTeacher(null)}
        />
    )}
    </>
  );
};

export default ManageTeachers;