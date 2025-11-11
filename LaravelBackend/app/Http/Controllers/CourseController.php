<?php

namespace App\Http\Controllers;

use App\Services\CourseService;
use App\Http\Requests\CreateCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class CourseController extends Controller
{
    protected CourseService $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    public function index(): JsonResponse
    {
        \Log::info('Fetching all courses');
        
        $result = $this->courseService->getAllCourses();

        \Log::info('Courses fetch result', [
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

    public function show(int $courseId): JsonResponse
    {
        \Log::info('Fetching course', ['course_id' => $courseId]);
        
        $result = $this->courseService->getCourse($courseId);

        \Log::info('Course fetch result', ['found' => $result['success']]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function store(CreateCourseRequest $request): JsonResponse
    {
        \Log::info('Course creation request received');
        
        $creationResult = $this->courseService->createCourse($request->validated());

        \Log::info('Course creation result', $creationResult);

        $statusCode = $creationResult['status_code'];
        $response = [
            'status' => $creationResult['success'] ? 'success' : 'error',
            'message' => $creationResult['message'],
            'data' => $creationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function update(UpdateCourseRequest $request, int $courseId): JsonResponse
    {
        \Log::info('Course update request received', ['course_id' => $courseId]);
        
        $updateResult = $this->courseService->updateCourse($courseId, $request->validated());

        \Log::info('Course update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function destroy(int $courseId): JsonResponse
    {
        \Log::info('Course delete request received', ['course_id' => $courseId]);
        
        $deleteResult = $this->courseService->deleteCourse($courseId);

        \Log::info('Course delete result', $deleteResult);

        $statusCode = $deleteResult['status_code'];
        $response = [
            'status' => $deleteResult['success'] ? 'success' : 'error',
            'message' => $deleteResult['message'],
            'data' => $deleteResult['data']
        ];

        return response()->json($response, $statusCode);
    }
}