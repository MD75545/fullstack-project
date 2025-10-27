import React, { useState, useMemo } from 'react';
import { tasks as initialTasks, users } from '../../data/mockData';
import type { Task, Teacher } from '../../types';
import AddEditTaskModal from '../../components/AddEditTaskModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';

const ManageTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const { searchQuery } = useSearch();
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const teachers = users.filter(u => u.role === 'teacher') as Teacher[];
  const getTeacherName = (teacherId: number) => teachers.find(t => t.id === teacherId)?.name || 'Unassigned';

  const priorityColorMap = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-blue-100 text-blue-800',
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getTeacherName(task.assignedTo).toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

        return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  const handleOpenAddModal = () => {
      setEditingTask(null);
      setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (task: Task) => {
      setEditingTask(task);
      setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
        // Edit
        const updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskData } : t);
        setTasks(updatedTasks);
        // Persist change in mock data
        const taskIndex = initialTasks.findIndex(t => t.id === editingTask.id);
        if (taskIndex > -1) initialTasks[taskIndex] = { ...initialTasks[taskIndex], ...taskData };
    } else {
        // Add
        const newTask: Task = { ...taskData, id: Date.now() };
        setTasks(prev => [...prev, newTask]);
        initialTasks.push(newTask);
    }
    handleCloseModal();
  };

  const handleDeleteClick = (task: Task) => {
      setDeletingTask(task);
  };
  
  const confirmDelete = () => {
      if(deletingTask) {
          setTasks(prev => prev.filter(t => t.id !== deletingTask.id));
          const taskIndex = initialTasks.findIndex(t => t.id === deletingTask.id);
          if (taskIndex > -1) initialTasks.splice(taskIndex, 1);
          setDeletingTask(null);
      }
  };

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">Tasks List ({filteredTasks.length})</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full sm:w-40 p-2 border border-gray-300 rounded-md focus:ring-brand-purple focus:border-brand-purple"
              aria-label="Filter tasks by priority"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <button onClick={handleOpenAddModal} className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto">Add Task</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600 hidden md:table-cell">Assigned To</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Due Date</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Priority</th>
              <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 border-b border-slate-200">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-xs text-gray-500 hidden sm:table-cell">{task.description}</div>
                </td>
                <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">{getTeacherName(task.assignedTo)}</td>
                <td className="py-3 px-4 border-b border-slate-200">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 border-b border-slate-200">{task.status}</td>
                <td className="py-3 px-4 border-b border-slate-200">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColorMap[task.priority]}`}>
                        {task.priority}
                    </span>
                </td>
                <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                  <button onClick={() => handleOpenEditModal(task)} className="text-brand-purple font-medium hover:underline">Edit</button>
                  <button onClick={() => handleDeleteClick(task)} className="text-red-500 font-medium hover:underline">Delete</button>
                </td>
              </tr>
            ))}
             {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    {isModalOpen && (
        <AddEditTaskModal
            task={editingTask}
            onClose={handleCloseModal}
            onSave={handleSaveTask}
        />
    )}
    {deletingTask && (
        <ConfirmationModal
            title="Delete Task"
            message={`Are you sure you want to delete the task "${deletingTask.title}"? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingTask(null)}
        />
    )}
    </>
  );
};

export default ManageTasks;
