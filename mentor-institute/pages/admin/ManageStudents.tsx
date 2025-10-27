import React, { useState, useMemo } from 'react';
import { users, courses } from '../../data/mockData';
import type { Student, Teacher } from '../../types';
import AddEditStudentModal from '../../components/AddEditStudentModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(users.filter(u => u.role === 'student') as Student[]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const { searchQuery } = useSearch();

  const teachers = users.filter(u => u.role === 'teacher') as Teacher[];

  const filteredStudents = useMemo(() => {
    if (!searchQuery) {
      return students;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return students.filter(student => {
        const course = courses.find(c => c.id === student.courseId);
        const teacher = teachers.find(t => t.id === student.teacherId);
        return (
            student.name.toLowerCase().includes(lowercasedQuery) ||
            student.email.toLowerCase().includes(lowercasedQuery) ||
            (course && course.title.toLowerCase().includes(lowercasedQuery)) ||
            (teacher && teacher.name.toLowerCase().includes(lowercasedQuery))
        );
    });
  }, [students, searchQuery, teachers]);


  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'role'>) => {
    if (editingStudent) {
      // Edit
      const updatedStudents = students.map(s => s.id === editingStudent.id ? { ...editingStudent, ...studentData } : s);
      setStudents(updatedStudents);
      const userIndex = users.findIndex(u => u.id === editingStudent.id);
      if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], ...studentData };
      }
    } else {
      // Add
      const newStudent: Student = {
        ...studentData,
        id: Date.now(),
        role: 'student',
      };
      setStudents(prev => [...prev, newStudent]);
      users.push(newStudent);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
  };

  const confirmDelete = () => {
    if (deletingStudent) {
      setStudents(prev => prev.filter(s => s.id !== deletingStudent.id));
      const userIndex = users.findIndex(u => u.id === deletingStudent.id);
      if (userIndex > -1) {
        users.splice(userIndex, 1);
      }
      setDeletingStudent(null);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-xl font-bold text-gray-800">Students List ({filteredStudents.length})</h2>
          <button onClick={handleOpenAddModal} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Student</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-slate-100">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Contact</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Course</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Assigned Teacher</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const course = courses.find(c => c.id === student.courseId);
                const teacher = teachers.find(t => t.id === student.teacherId);
                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 border-b border-slate-200">{student.name}</td>
                    <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                        <div>{student.email}</div>
                        {student.mobile && <div className="text-xs text-gray-500">{student.mobile}</div>}
                    </td>
                    <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">{course?.title || 'N/A'}</td>
                    <td className="py-3 px-4 border-b border-slate-200">{teacher?.name || 'Not Assigned'}</td>
                    <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                      <button onClick={() => handleOpenEditModal(student)} className="text-brand-purple font-medium hover:underline">Edit</button>
                      <button onClick={() => handleDeleteClick(student)} className="text-red-500 font-medium hover:underline">Delete</button>
                    </td>
                  </tr>
                )
              })}
               {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No students found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <AddEditStudentModal
          student={editingStudent}
          onClose={handleCloseModal}
          onSave={handleSaveStudent}
        />
      )}
      {deletingStudent && (
        <ConfirmationModal
          title="Delete Student"
          message={`Are you sure you want to delete ${deletingStudent.name}? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingStudent(null)}
        />
      )}
    </>
  );
};

export default ManageStudents;
