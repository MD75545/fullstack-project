<?php

namespace App\Http\Controllers;

use App\Services\TestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    protected TestService $testService;

    public function __construct(TestService $testService)
    {
        $this->testService = $testService;
    }

    public function getPracticeTests(): JsonResponse
    {
        try {
            $result = $this->testService->getPracticeTests();

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Get practice tests error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve practice tests',
                'data' => []
            ], 500);
        }
    }

    public function getTestWithQuestions(int $testId): JsonResponse
    {
        try {
            $result = $this->testService->getTestWithQuestions($testId);

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Get test with questions error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve test',
                'data' => null
            ], 500);
        }
    }

    public function submitTestResult(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,user_id',
                'test_id' => 'required|integer|exists:tests,test_id',
                'answers' => 'required|array',
            ]);

            $result = $this->testService->submitTestResult($validated);

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Submit test result error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to submit test result',
                'data' => null
            ], 500);
        }
    }

    public function getUserTestResults(int $userId): JsonResponse
    {
        try {
            $result = $this->testService->getUserTestResults($userId);

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Get user test results error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve test results',
                'data' => []
            ], 500);
        }
    }

    public function getTestResultDetails(int $testResultId): JsonResponse
    {
        try {
            $result = $this->testService->getTestResultDetails($testResultId);

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Get test result details error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve test result details',
                'data' => null
            ], 500);
        }
    }

    public function getTestCategories(): JsonResponse
    {
        try {
            $result = $this->testService->getTestCategories();

            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);

        } catch (\Exception $e) {
            Log::error('Get test categories error: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve test categories',
                'data' => []
            ], 500);
        }
    }
}