<?php

namespace App\Services;

use App\Repositories\TestRepository;
use Exception;

class TestService
{
    protected TestRepository $testRepository;

    public function __construct(TestRepository $testRepository)
    {
        $this->testRepository = $testRepository;
    }

    public function getPracticeTests(): array
    {
        try {
            $tests = $this->testRepository->getPracticeTests();

            return [
                'success' => true,
                'message' => 'Practice tests retrieved successfully',
                'data' => $tests,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve practice tests: ' . $e->getMessage(),
                'data' => [],
                'status_code' => 500
            ];
        }
    }

    public function getTestWithQuestions(int $testId): array
    {
        try {
            $test = $this->testRepository->getTestWithQuestions($testId);

            if (!$test) {
                return [
                    'success' => false,
                    'message' => 'Test not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Test retrieved successfully',
                'data' => $test,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve test: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function submitTestResult(array $resultData): array
    {
        try {
            // Validate required fields
            $requiredFields = ['user_id', 'test_id', 'answers'];
            foreach ($requiredFields as $field) {
                if (!isset($resultData[$field])) {
                    throw new Exception("Missing required field: {$field}");
                }
            }

            // Get test questions to calculate score
            $test = $this->testRepository->getTestWithQuestions($resultData['test_id']);
            if (!$test) {
                throw new Exception('Test not found');
            }

            $scoreObtained = 0;
            $totalScore = count($test->questions);

            // Calculate score based on answers
            foreach ($test->questions as $question) {
                if (isset($resultData['answers'][$question->question_id])) {
                    $userAnswer = $resultData['answers'][$question->question_id];
                    if ($userAnswer == $question->correct_option_id) {
                        $scoreObtained++;
                    }
                }
            }

            $resultData['score_obtained'] = $scoreObtained;
            $resultData['total_score'] = $totalScore;

            // Save the result
            $savedResult = $this->testRepository->saveTestResult($resultData);

            return [
                'success' => true,
                'message' => 'Test submitted successfully',
                'data' => $savedResult,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to submit test: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getUserTestResults(int $userId): array
    {
        try {
            $results = $this->testRepository->getUserTestResults($userId);

            return [
                'success' => true,
                'message' => 'Test results retrieved successfully',
                'data' => $results,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve test results: ' . $e->getMessage(),
                'data' => [],
                'status_code' => 500
            ];
        }
    }

    public function getTestResultDetails(int $testResultId): array
    {
        try {
            $result = $this->testRepository->getTestResultWithDetails($testResultId);

            if (!$result) {
                return [
                    'success' => false,
                    'message' => 'Test result not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Test result details retrieved successfully',
                'data' => $result,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve test result details: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getTestCategories(): array
    {
        try {
            $categories = $this->testRepository->getAllTestCategories();

            return [
                'success' => true,
                'message' => 'Test categories retrieved successfully',
                'data' => $categories,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve test categories: ' . $e->getMessage(),
                'data' => [],
                'status_code' => 500
            ];
        }
    }
}