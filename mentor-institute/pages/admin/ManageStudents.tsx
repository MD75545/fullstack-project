import React, { useState, useMemo, useEffect } from 'react';
import type { Student } from '../../types';
import AddEditStudentModal from '../../components/AddEditStudentModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';
import { getStudents, deleteStudent } from '../../services/api';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const { searchQuery } = useSearch();

  // Fetch students from API on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setFetchLoading(true);
        setError('');
        const response = await getStudents();

        if (response.success && response.data) {
          // Transform API data to match your Student type
          const studentsData: Student[] = response.data.map((student: any) => ({
            id: student.user_id,
            name: student.name,
            email: student.email,
            mobile: student.mobile || '',
            city: student.city || '',
            address: student.address || '',
            courseId: student.course_id,
            teacherId: student.teacher_id || undefined,
            referredByAffiliateId: student.referred_by_affiliate_id || undefined,
            displayNamePreference: student.display_name_preference || 'real_name',
            gender: student.gender || undefined,
            password: 'defaultPassword123', // Not used in display
            role: 'student',
            // Additional fields from API
            courseTitle: student.course_title,
            courseDuration: student.course_duration,
            courseLevel: student.course_level,
            teacherName: student.teacher_name,
            referredByFirm: student.referred_by_firm,
            createdAt: student.created_at,
            
          }));

          setStudents(studentsData);
          
        } else {
          setError(response.message || 'Failed to load students');
        }
      } catch (error: any) {
        console.error('Error fetching students:', error);
        setError(error.message || 'Failed to load students. Please try again.');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) {
      return students;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return students.filter(student => {
        return (
            student.name.toLowerCase().includes(lowercasedQuery) ||
            student.email.toLowerCase().includes(lowercasedQuery) ||
            (student.courseTitle && student.courseTitle.toLowerCase().includes(lowercasedQuery)) ||
            (student.teacherName && student.teacherName.toLowerCase().includes(lowercasedQuery)) ||
            (student.mobile && student.mobile.toLowerCase().includes(lowercasedQuery))
        );
    });
  }, [students, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
    setError('');
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setError('');
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'role'>) => {
    try {
      // Refresh the students list after adding/editing
      const response = await getStudents();
      if (response.success && response.data) {
        const studentsData: Student[] = response.data.map((student: any) => ({
          id: student.user_id,
          name: student.name,
          email: student.email,
          mobile: student.mobile || '',
          city: student.city || '',
          address: student.address || '',
          courseId: student.course_id,
          teacherId: student.teacher_id || undefined,
          referredByAffiliateId: student.referred_by_affiliate_id || undefined,
          displayNamePreference: student.display_name_preference || 'real_name',
          gender: student.gender || undefined,
          password: 'defaultPassword123',
          role: 'student',
          courseTitle: student.course_title,
          courseDuration: student.course_duration,
          courseLevel: student.course_level,
          teacherName: student.teacher_name,
          referredByFirm: student.referred_by_firm,
          createdAt: student.created_at,
        }));
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error refreshing students:', error);
      setError('Failed to refresh students list');
    }
    
    handleCloseModal();
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
  };

  const confirmDelete = async () => {
    if (deletingStudent) {
      try {
        console.log('Deleting student:', deletingStudent.id);
        
        const response = await deleteStudent(deletingStudent.id);
        
        if (response.success) {
          console.log('Student deleted successfully');
          
          // Refresh the students list
          const studentsResponse = await getStudents();
          if (studentsResponse.success && studentsResponse.data) {
            const studentsData: Student[] = studentsResponse.data.map((student: any) => ({
              id: student.user_id,
              name: student.name,
              email: student.email,
              mobile: student.mobile || '',
              city: student.city || '',
              address: student.address || '',
              courseId: student.course_id,
              teacherId: student.teacher_id || undefined,
              referredByAffiliateId: student.referred_by_affiliate_id || undefined,
              displayNamePreference: student.display_name_preference || 'real_name',
              gender: student.gender || undefined,
              password: 'defaultPassword123',
              role: 'student',
              courseTitle: student.course_title,
              courseDuration: student.course_duration,
              courseLevel: student.course_level,
              teacherName: student.teacher_name,
              referredByFirm: student.referred_by_firm,
              createdAt: student.created_at,
            }));
            setStudents(studentsData);
          }
          
          setError(''); // Clear any previous errors
        } else {
          setError(response.message || 'Failed to delete student');
        }
      } catch (error: any) {
        console.error('Error deleting student:', error);
        setError(error.message || 'Failed to delete student. Please try again.');
      } finally {
        setDeletingStudent(null);
      }
    }
  };

  if (fetchLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg text-gray-600">Loading students...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h2 className="text-xl font-bold text-gray-800">Students List ({filteredStudents.length})</h2>
          <button onClick={handleOpenAddModal} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">
            Add Student
          </button>
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
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Course</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Assigned Teacher</th>
                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 border-b border-slate-200">{student.name}</td>
                  <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                      <div>{student.email}</div>
                      {student.mobile && <div className="text-xs text-gray-500">{student.mobile}</div>}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200 hidden lg:table-cell">
                    {student.courseTitle || 'N/A'}
                    {student.courseLevel && <div className="text-xs text-gray-500">{student.courseLevel}</div>}
                  </td>
                  <td className="py-3 px-4 border-b border-slate-200">{student.teacherName || 'Not Assigned'}</td>
                  <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                    <button onClick={() => handleOpenEditModal(student)} className="text-brand-purple font-medium hover:underline">Edit</button>
                    <button onClick={() => handleDeleteClick(student)} className="text-red-500 font-medium hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
               {filteredStudents.length === 0 && !fetchLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {students.length === 0 ? 'No students found.' : 'No students matching your search.'}
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