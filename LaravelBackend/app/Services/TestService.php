<?php

namespace App\Services;

use App\Repositories\TestRepository;
use App\Repositories\PaymentRepository; // Add this for payment handling
use Exception;

class TestService
{
    protected TestRepository $testRepository;
    protected PaymentRepository $paymentRepository; // Add this

    public function __construct(TestRepository $testRepository, PaymentRepository $paymentRepository) // Update constructor
    {
        $this->testRepository = $testRepository;
        $this->paymentRepository = $paymentRepository; // Initialize payment repository
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

    // CONTEST METHODS

    public function getUpcomingContests(): array
    {
        try {
            $contests = $this->testRepository->getUpcomingContests();
            
            return [
                'success' => true,
                'message' => 'Upcoming contests retrieved successfully',
                'data' => $contests,
                'status_code' => 200
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve contests: ' . $e->getMessage(),
                'data' => [],
                'status_code' => 500
            ];
        }
    }

    public function getCompletedContests(): array
    {
        try {
            $contests = $this->testRepository->getCompletedContests();
            
            return [
                'success' => true,
                'message' => 'Completed contests retrieved successfully',
                'data' => $contests,
                'status_code' => 200
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve contests: ' . $e->getMessage(),
                'data' => [],
                'status_code' => 500
            ];
        }
    }

    public function getContestDetails(int $contestId): array
    {
        try {
            $contest = $this->testRepository->getContestById($contestId);
            
            if (!$contest) {
                return [
                    'success' => false,
                    'message' => 'Contest not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }
            
            return [
                'success' => true,
                'message' => 'Contest details retrieved successfully',
                'data' => $contest,
                'status_code' => 200
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve contest: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    // Updated method for contest registration
    public function registerUserForContest(int $userId, int $contestId, array $paymentData = []): array
    {
        try {
            // Check if contest exists
            $contest = $this->testRepository->getContestById($contestId);
            if (!$contest) {
                throw new Exception('Contest not found');
            }
            
            // Check if contest is upcoming
            if ($contest->status !== 'upcoming') {
                throw new Exception('Contest registration is closed');
            }
            
            // Check if user already registered
            $existingRegistration = $this->testRepository->checkUserContestRegistration($userId, $contestId);
            if ($existingRegistration) {
                throw new Exception('Already registered for this contest');
            }
            
            // For free contests only
            $paymentAmount = $contest->entry_fee > 0 ? $contest->entry_fee : 0;
            
            if ($paymentAmount > 0) {
                // For paid contests, don't create registration here
                // Registration will be created after payment verification
                return [
                    'success' => true,
                    'message' => 'Payment required for contest registration',
                    'data' => [
                        'payment_required' => true,
                        'amount' => $paymentAmount,
                        'contest_id' => $contestId,
                        'contest_name' => $contest->name
                    ],
                    'status_code' => 200
                ];
            } else {
                // For free contests, create registration directly
                $registrationId = $this->testRepository->registerForContest($userId, $contestId, 0);
                
                // Update participant count
                $this->testRepository->updateContestParticipants($contestId);
                
                return [
                    'success' => true,
                    'message' => 'Successfully registered for contest',
                    'data' => [
                        'registration_id' => $registrationId,
                        'contest_id' => $contestId,
                        'payment_required' => false,
                        'amount' => 0
                    ],
                    'status_code' => 200
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 400
            ];
        }
    }
}