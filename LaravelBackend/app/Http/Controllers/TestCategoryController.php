<?php

namespace App\Http\Controllers;

use App\Services\TestCategoryService;
use App\Http\Requests\CreateTestCategoryRequest;
use App\Http\Requests\UpdateTestCategoryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class TestCategoryController extends Controller
{
    protected TestCategoryService $testCategoryService;

    public function __construct(TestCategoryService $testCategoryService)
    {
        $this->testCategoryService = $testCategoryService;
    }

    public function index(): JsonResponse
    {
        \Log::info('Fetching all test categories');
        
        $result = $this->testCategoryService->getAllCategories();

        \Log::info('Categories fetch result', [
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

    public function show(int $categoryId): JsonResponse
    {
        \Log::info('Fetching test category', ['category_id' => $categoryId]);
        
        $result = $this->testCategoryService->getCategory($categoryId);

        \Log::info('Category fetch result', ['found' => $result['success']]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function store(CreateTestCategoryRequest $request): JsonResponse
    {
        \Log::info('Test category creation request received', $request->all());
        
        $creationResult = $this->testCategoryService->createCategory($request->validated());

        \Log::info('Test category creation result', $creationResult);

        $statusCode = $creationResult['status_code'];
        $response = [
            'status' => $creationResult['success'] ? 'success' : 'error',
            'message' => $creationResult['message'],
            'data' => $creationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function update(UpdateTestCategoryRequest $request, int $categoryId): JsonResponse
    {
        \Log::info('Test category update request received', ['category_id' => $categoryId, 'data' => $request->all()]);
        
        $updateResult = $this->testCategoryService->updateCategory($categoryId, $request->validated());

        \Log::info('Test category update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function destroy(int $categoryId): JsonResponse
    {
        \Log::info('Test category delete request received', ['category_id' => $categoryId]);
        
        $deleteResult = $this->testCategoryService->deleteCategory($categoryId);

        \Log::info('Test category delete result', $deleteResult);

        $statusCode = $deleteResult['status_code'];
        $response = [
            'status' => $deleteResult['success'] ? 'success' : 'error',
            'message' => $deleteResult['message'],
            'data' => $deleteResult['data']
        ];

        return response()->json($response, $statusCode);
    }
}