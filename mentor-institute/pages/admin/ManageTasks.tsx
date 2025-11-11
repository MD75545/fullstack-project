import React, { useState, useMemo, useEffect } from 'react';
import type { Task } from '../../types';
import AddEditTaskModal from '../../components/AddEditTaskModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import { useSearch } from '../../context/SearchContext';
import { getTasks, deleteTask } from '../../services/api';

const ManageTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { searchQuery } = useSearch();
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const priorityColorMap = {
    High: 'bg-red-100 text-red-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Low: 'bg-blue-100 text-blue-800',
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching tasks from API...');
      
      const response = await getTasks();
      console.log('Tasks API response:', response);
      
      if (response.success) {
        console.log('Raw tasks data:', response.data);
        
        // Transform API data to match frontend Task type
        const transformedTasks = response.data.map((task: any) => ({
          id: task.task_id,
          title: task.title,
          description: task.description || '',
          assignedTo: task.assigned_to_teacher_id,
          assignedTeacherName: task.teacher_name || 'Unassigned',
          dueDate: task.due_date,
          status: task.status,
          priority: task.priority,
          createdAt: task.created_at,
          updatedAt: task.updated_at
        }));
        
        console.log('Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
      } else {
        setError(response.message || 'Failed to load tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = !searchQuery ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.assignedTeacherName && task.assignedTeacherName.toLowerCase().includes(searchQuery.toLowerCase()));
        
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
      // Refresh tasks after modal closes
      fetchTasks();
  };

  const handleSaveTask = () => {
    // Tasks are refreshed automatically when modal closes
    handleCloseModal();
  };

  const handleDeleteClick = (task: Task) => {
      setDeletingTask(task);
  };
  
  const confirmDelete = async () => {
      if(deletingTask) {
          try {
              setLoading(true);
              const response = await deleteTask(deletingTask.id);
              if (response.success) {
                  // Refresh the task list
                  await fetchTasks();
                  setDeletingTask(null);
              } else {
                  setError(response.message || 'Failed to delete task');
              }
          } catch (err: any) {
              setError(err.message || 'Error deleting task');
              console.error('Error deleting task:', err);
          } finally {
              setLoading(false);
          }
      }
  };

  // Add debug logging to see what's being rendered
  console.log('Current tasks state:', tasks);
  console.log('Filtered tasks:', filteredTasks);

  if (loading && tasks.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-center items-center h-32">
          <div className="text-lg">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="bg-white p-6 rounded-xl shadow-lg">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          Tasks List ({filteredTasks.length})
          {tasks.length > 0 && ` - Total: ${tasks.length}`}
        </h2>
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
          <button 
            onClick={handleOpenAddModal} 
            className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
            disabled={loading}
          >
            Add Task
          </button>
        </div>
      </div>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-sm rounded">
          Debug: {tasks.length} total tasks, {filteredTasks.length} filtered tasks
        </div>
      )}

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
                    <div className="text-xs text-gray-500 hidden sm:table-cell">
                      {task.description || 'No description'}
                    </div>
                </td>
                <td className="py-3 px-4 border-b border-slate-200 hidden md:table-cell">
                  {task.assignedTeacherName}
                </td>
                <td className="py-3 px-4 border-b border-slate-200">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                </td>
                <td className="py-3 px-4 border-b border-slate-200">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-4 border-b border-slate-200">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColorMap[task.priority]}`}>
                        {task.priority}
                    </span>
                </td>
                <td className="py-3 px-4 border-b border-slate-200 whitespace-nowrap space-x-4">
                  <button 
                    onClick={() => handleOpenEditModal(task)} 
                    className="text-brand-purple font-medium hover:underline"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(task)} 
                    className="text-red-500 font-medium hover:underline"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
             {filteredTasks.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  {tasks.length === 0 ? 'No tasks found. Create your first task!' : 'No tasks match your search criteria.'}
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