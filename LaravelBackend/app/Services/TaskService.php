<?php

namespace App\Services;

use App\Repositories\TaskRepository;
use Exception;

class TaskService
{
    protected TaskRepository $taskRepository;

    public function __construct(TaskRepository $taskRepository)
    {
        $this->taskRepository = $taskRepository;
    }

    public function createTask(array $taskData): array
    {
        try {
            $createdData = $this->taskRepository->createTask($taskData);
            $taskWithDetails = $this->taskRepository->getTaskWithDetails($createdData['task_id']);

            return [
                'success' => true,
                'message' => 'Task created successfully',
                'data' => $taskWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Task creation failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function updateTask(int $taskId, array $taskData): array
    {
        try {
            $updatedData = $this->taskRepository->updateTask($taskId, $taskData);
            $taskWithDetails = $this->taskRepository->getTaskWithDetails($taskId);

            return [
                'success' => true,
                'message' => 'Task updated successfully',
                'data' => $taskWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Task update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function getAllTasks(): array
    {
        try {
            $tasks = $this->taskRepository->getAllTasksWithDetails();

            return [
                'success' => true,
                'message' => 'Tasks retrieved successfully',
                'data' => $tasks,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve tasks: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getTask(int $taskId): array
    {
        try {
            $task = $this->taskRepository->getTaskWithDetails($taskId);

            if (!$task) {
                return [
                    'success' => false,
                    'message' => 'Task not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Task retrieved successfully',
                'data' => $task,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve task: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function deleteTask(int $taskId): array
    {
        try {
            $deleted = $this->taskRepository->deleteTask($taskId);

            return [
                'success' => true,
                'message' => 'Task deleted successfully',
                'data' => null,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete task: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function getAvailableTeachers(): array
{
    try {
        $teachers = $this->taskRepository->getAvailableTeachers();

        return [
            'success' => true,
            'message' => 'Teachers retrieved successfully',
            'data' => $teachers,
            'status_code' => 200
        ];

    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => 'Failed to retrieve teachers: ' . $e->getMessage(),
            'data' => null,
            'status_code' => 500
        ];
    }
}

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'not found')) {
            return 404;
        }

        return 500;
    }
}