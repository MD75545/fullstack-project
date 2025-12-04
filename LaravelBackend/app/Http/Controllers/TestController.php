<?php

namespace App\Http\Controllers;

use App\Services\TestService;
use App\Repositories\TestRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    protected TestService $testService;
    protected TestRepository $testRepository; // Add this

    public function __construct(TestService $testService, TestRepository $testRepository) // Update constructor
    {
        $this->testService = $testService;
        $this->testRepository = $testRepository; // Initialize repository
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

    // CONTEST METHODS

    public function getUpcomingContests(): JsonResponse
    {
        try {
            $result = $this->testService->getUpcomingContests();
            
            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);
        } catch (\Exception $e) {
            Log::error('Get upcoming contests error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve upcoming contests',
                'data' => []
            ], 500);
        }
    }

    public function getCompletedContests(): JsonResponse
    {
        try {
            $result = $this->testService->getCompletedContests();
            
            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);
        } catch (\Exception $e) {
            Log::error('Get completed contests error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve completed contests',
                'data' => []
            ], 500);
        }
    }

    public function getContestDetails(int $contestId): JsonResponse
    {
        try {
            $result = $this->testService->getContestDetails($contestId);
            
            return response()->json([
                'status' => $result['success'] ? 'success' : 'error',
                'message' => $result['message'],
                'data' => $result['data']
            ], $result['status_code']);
        } catch (\Exception $e) {
            Log::error('Get contest details error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve contest details',
                'data' => null
            ], 500);
        }
    }

    // Updated registerForContest method
    public function registerForContest(Request $request, int $contestId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,user_id',
            ]);
            
            // Get contest details using the injected repository
            $contest = $this->testRepository->getContestById($contestId);
            if (!$contest) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contest not found',
                    'data' => null
                ], 404);
            }
            
            // For free contests, register directly through service
            if ($contest->entry_fee <= 0) {
                $result = $this->testService->registerUserForContest(
                    $validated['user_id'], 
                    $contestId
                );
                
                return response()->json([
                    'status' => $result['success'] ? 'success' : 'error',
                    'message' => $result['message'],
                    'data' => $result['data']
                ], $result['status_code']);
            } else {
                // For paid contests, indicate that payment is required
                return response()->json([
                    'status' => 'payment_required',
                    'message' => 'Payment required for this contest',
                    'data' => [
                        'contest_id' => $contestId,
                        'entry_fee' => $contest->entry_fee,
                        'redirect_to_payment' => true,
                        'contest_name' => $contest->name,
                        'prize_money' => $contest->prize_money
                    ]
                ], 200);
            }
        } catch (\Exception $e) {
            Log::error('Register for contest error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}