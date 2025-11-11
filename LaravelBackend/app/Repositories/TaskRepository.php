<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class TaskRepository
{
    public function createTask(array $taskData): array
    {
        try {
            DB::beginTransaction();

            $taskId = DB::table('tasks')->insertGetId([
                'title' => $taskData['title'],
                'description' => $taskData['description'],
                'assigned_to_teacher_id' => $taskData['assigned_to_teacher_id'],
                'due_date' => $taskData['due_date'],
                'status' => $taskData['status'] ?? 'Pending',
                'priority' => $taskData['priority'] ?? 'Medium',
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$taskId) {
                throw new Exception('Failed to create task');
            }

            DB::commit();

            return [
                'task_id' => $taskId,
                'task_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateTask(int $taskId, array $taskData): array
    {
        try {
            DB::beginTransaction();

            $task = DB::table('tasks')->where('task_id', $taskId)->first();
            if (!$task) {
                throw new Exception('Task not found');
            }

            $updateData = [
                'title' => $taskData['title'],
                'description' => $taskData['description'],
                'assigned_to_teacher_id' => $taskData['assigned_to_teacher_id'],
                'due_date' => $taskData['due_date'],
                'status' => $taskData['status'],
                'priority' => $taskData['priority'],
                'updated_at' => now()
            ];

            $updated = DB::table('tasks')->where('task_id', $taskId)->update($updateData);

            if (!$updated) {
                throw new Exception('Failed to update task');
            }

            DB::commit();

            return [
                'task_id' => $taskId,
                'task_updated' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getAllTasksWithDetails()
    {
        return DB::table('tasks')
            ->join('users as teachers', 'tasks.assigned_to_teacher_id', '=', 'teachers.user_id')
            ->select(
                'tasks.task_id',
                'tasks.title',
                'tasks.description',
                'tasks.assigned_to_teacher_id',
                'tasks.due_date',
                'tasks.status',
                'tasks.priority',
                'tasks.created_at',
                'tasks.updated_at',
                'teachers.name as teacher_name',
                'teachers.email as teacher_email'
            )
            ->get();
    }

    public function getTaskWithDetails(int $taskId): ?object
    {
        return DB::table('tasks')
            ->join('users as teachers', 'tasks.assigned_to_teacher_id', '=', 'teachers.user_id')
            ->where('tasks.task_id', $taskId)
            ->select(
                'tasks.task_id',
                'tasks.title',
                'tasks.description',
                'tasks.assigned_to_teacher_id',
                'tasks.due_date',
                'tasks.status',
                'tasks.priority',
                'tasks.created_at',
                'tasks.updated_at',
                'teachers.name as teacher_name',
                'teachers.email as teacher_email'
            )
            ->first();
    }

    public function deleteTask(int $taskId): bool
    {
        try {
            DB::beginTransaction();

            $deleted = DB::table('tasks')->where('task_id', $taskId)->delete();

            if (!$deleted) {
                throw new Exception('Failed to delete task');
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getAvailableTeachers()
    {
        return DB::table('users')
            ->join('teachers', 'users.user_id', '=', 'teachers.user_id')
            ->where('users.role', 'teacher')
            ->orWhere('users.role', 'both')
            ->select(
                'users.user_id',
                'users.name',
                'teachers.specialization'
            )
            ->get();
    }
}