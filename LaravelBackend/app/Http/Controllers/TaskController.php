<?php

namespace App\Http\Controllers;

use App\Services\TaskService;
use App\Http\Requests\CreateTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    protected TaskService $taskService;

    public function __construct(TaskService $taskService)
    {
        $this->taskService = $taskService;
    }

    public function index(): JsonResponse
    {
        \Log::info('Fetching all tasks');
        
        $result = $this->taskService->getAllTasks();

        \Log::info('Tasks fetch result', [
            'success' => $result['success'],
            'count' => $result['data'] ? count($result['data']) : 0
        ]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data'],
            'count' => $result['data'] ? count($result['data']) : 0
        ];

        return response()->json($response, $statusCode);
    }

    public function show(int $taskId): JsonResponse
    {
        \Log::info('Fetching task', ['task_id' => $taskId]);
        
        $result = $this->taskService->getTask($taskId);

        \Log::info('Task fetch result', ['found' => $result['success']]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function store(CreateTaskRequest $request): JsonResponse
    {
        \Log::info('Task creation request received', $request->all());
        
        $creationResult = $this->taskService->createTask($request->validated());

        \Log::info('Task creation result', $creationResult);

        $statusCode = $creationResult['status_code'];
        $response = [
            'status' => $creationResult['success'] ? 'success' : 'error',
            'message' => $creationResult['message'],
            'data' => $creationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function update(UpdateTaskRequest $request, int $taskId): JsonResponse
    {
        \Log::info('Task update request received', ['task_id' => $taskId, 'data' => $request->all()]);
        
        $updateResult = $this->taskService->updateTask($taskId, $request->validated());

        \Log::info('Task update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function destroy(int $taskId): JsonResponse
    {
        \Log::info('Task delete request received', ['task_id' => $taskId]);
        
        $deleteResult = $this->taskService->deleteTask($taskId);

        \Log::info('Task delete result', $deleteResult);

        $statusCode = $deleteResult['status_code'];
        $response = [
            'status' => $deleteResult['success'] ? 'success' : 'error',
            'message' => $deleteResult['message'],
            'data' => $deleteResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function getTeachers(): JsonResponse
{
    \Log::info('Fetching teachers for tasks');
    
    $result = $this->taskService->getAvailableTeachers();

    \Log::info('Teachers fetch result', [
        'teachers_count' => $result['success'] ? count($result['data'] ?? []) : 0
    ]);

    $statusCode = $result['status_code'];
    
    // Ensure consistent response structure
    $response = [
        'success' => $result['success'],
        'message' => $result['message'],
        'data' => $result['data']
    ];

    return response()->json($response, $statusCode);
}
}