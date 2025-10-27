import React, { useState, useMemo } from 'react';
import { users } from '../../data/mockData';
import type { Teacher } from '../../types';
import AddEditTeacherModal from '../../components/AddEditTeacherModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';

const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(users.filter(u => u.role === 'teacher') as Teacher[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const { searchQuery } = useSearch();

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
    
    // Also update the global users array for persistence during session
    const userIndex = users.findIndex(u => u.id === teacherId);
    if(userIndex > -1) {
        const teacherToUpdate = users[userIndex] as Teacher;
        users[userIndex] = {...teacherToUpdate, commissionPercentage: updatedTeachers.find(t => t.id === teacherId)?.commissionPercentage};
    }
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

  const handleSaveTeacher = (teacherData: Omit<Teacher, 'id' | 'role' | 'earnings'>) => {
    if (editingTeacher) {
        // Edit
        const updatedTeachers = teachers.map(t => t.id === editingTeacher.id ? { ...editingTeacher, ...teacherData } : t);
        setTeachers(updatedTeachers);
        const userIndex = users.findIndex(u => u.id === editingTeacher.id);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...teacherData };
        }
    } else {
        // Add
        const newTeacher: Teacher = {
            ...teacherData,
            id: Date.now(),
            role: 'teacher',
        };
        setTeachers(prev => [...prev, newTeacher]);
        users.push(newTeacher);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (teacher: Teacher) => {
      setDeletingTeacher(teacher);
  };
  
  const confirmDelete = () => {
      if(deletingTeacher) {
          setTeachers(prev => prev.filter(t => t.id !== deletingTeacher.id));
          const userIndex = users.findIndex(u => u.id === deletingTeacher.id);
          if (userIndex > -1) {
              users.splice(userIndex, 1);
          }
          setDeletingTeacher(null);
      }
  };

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h2 className="text-xl font-bold text-gray-800">Teachers List ({filteredTeachers.length})</h2>
        <button onClick={handleOpenAddModal} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Teacher</button>
      </div>
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
             {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No teachers found matching your search.
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
