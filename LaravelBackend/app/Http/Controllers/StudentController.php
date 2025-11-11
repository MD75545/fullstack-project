<?php

namespace App\Http\Controllers;

use App\Services\StudentService;
use App\Http\Requests\RegisterStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(): JsonResponse
{
    \Log::info('Fetching all students');
    
    $result = $this->studentService->getAllStudents();

    \Log::info('Students fetch result', [
        'success' => $result['success'],
        'count' => $result['data'] ? count($result['data']) : 0,
        'data_sample' => $result['data'] ? $result['data']->first() : null
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

    public function show(int $userId): JsonResponse
    {
        \Log::info('Fetching student', ['user_id' => $userId]);
        
        $result = $this->studentService->getStudent($userId);

        \Log::info('Student fetch result', ['found' => $result['success']]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function store(RegisterStudentRequest $request): JsonResponse
    {
        \Log::info('Student registration request received', $request->all());
        
        $registrationResult = $this->studentService->registerStudent($request->validated());

        \Log::info('Student registration result', $registrationResult);

        $statusCode = $registrationResult['status_code'];
        $response = [
            'status' => $registrationResult['success'] ? 'success' : 'error',
            'message' => $registrationResult['message'],
            'data' => $registrationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function update(UpdateStudentRequest $request, int $userId): JsonResponse
    {
        \Log::info('Student update request received', ['user_id' => $userId, 'data' => $request->all()]);
        
        $updateResult = $this->studentService->updateStudent($userId, $request->validated());

        \Log::info('Student update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function destroy(int $userId): JsonResponse
    {
        \Log::info('Student delete request received', ['user_id' => $userId]);
        
        $deleteResult = $this->studentService->deleteStudent($userId);

        \Log::info('Student delete result', $deleteResult);

        $statusCode = $deleteResult['status_code'];
        $response = [
            'status' => $deleteResult['success'] ? 'success' : 'error',
            'message' => $deleteResult['message'],
            'data' => $deleteResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function getOptions(): JsonResponse
    {
        \Log::info('Fetching student form options');
        
        $result = $this->studentService->getAvailableOptions();

        \Log::info('Options fetch result', [
            'teachers_count' => $result['success'] ? count($result['data']['teachers'] ?? []) : 0,
            'courses_count' => $result['success'] ? count($result['data']['courses'] ?? []) : 0,
            'affiliates_count' => $result['success'] ? count($result['data']['affiliates'] ?? []) : 0
        ]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }


}