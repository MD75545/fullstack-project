<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class TestRepository
{
    public function getAllTestCategories()
    {
        return DB::table('test_categories')
            ->select('test_category_id', 'name')
            ->orderBy('test_category_id', 'asc')
            ->get();
    }

    public function getPracticeTests()
    {
        return DB::table('tests')
            ->select(
                'tests.test_id',
                'tests.name',
                'tests.category_id', 
                'tests.type',
                'tests.duration_minutes',
                'tests.start_time',
                'tests.entry_fee',
                'tests.prize_money',
                'tests.min_participants',
                'test_categories.test_category_id',
                'test_categories.name as category_name'
            )
            ->leftJoin('test_categories', 'tests.category_id', '=', 'test_categories.test_category_id')
            ->where('tests.type', 'practice')
            ->orderBy('tests.test_id', 'asc')
            ->get();
    }

    public function getContests()
    {
        return DB::table('tests')
            ->select(
                'tests.test_id',
                'tests.name',
                'tests.category_id',
                'tests.type',
                'tests.duration_minutes',
                'tests.start_time',
                'tests.entry_fee',
                'tests.prize_money',
                'tests.min_participants',
                'test_categories.test_category_id',
                'test_categories.name as category_name'
            )
            ->leftJoin('test_categories', 'tests.category_id', '=', 'test_categories.test_category_id')
            ->where('tests.type', 'contest')
            ->orderBy('tests.test_id', 'asc')
            ->get();
    }

    public function getTestWithQuestions(int $testId)
    {
        // Get test details
        $test = DB::table('tests')
            ->select(
                'tests.test_id',
                'tests.name',
                'tests.category_id',
                'tests.type',
                'tests.duration_minutes',
                'tests.start_time',
                'tests.entry_fee',
                'tests.prize_money',
                'tests.min_participants',
                'test_categories.test_category_id',
                'test_categories.name as category_name'
            )
            ->leftJoin('test_categories', 'tests.category_id', '=', 'test_categories.test_category_id')
            ->where('tests.test_id', $testId)
            ->first();

        if (!$test) {
            return null;
        }

        // Get questions for this test
        $questions = DB::table('questions')
            ->select(
                'question_id',
                'test_id',
                'text',
                'options',
                'correct_option_id'
            )
            ->where('test_id', $testId)
            ->orderBy('question_id', 'asc')
            ->get();

        // Add questions to test object
        $test->questions = $questions;

        return $test;
    }

    public function getQuestionsByTest(int $testId)
    {
        return DB::table('questions')
            ->select(
                'question_id',
                'test_id',
                'text',
                'options',
                'correct_option_id'
            )
            ->where('test_id', $testId)
            ->orderBy('question_id', 'asc')
            ->get();
    }

    public function getTestById(int $testId)
    {
        return DB::table('tests')
            ->select(
                'tests.test_id',
                'tests.name',
                'tests.category_id',
                'tests.type',
                'tests.duration_minutes',
                'tests.start_time',
                'tests.entry_fee',
                'tests.prize_money',
                'tests.min_participants',
                'test_categories.test_category_id',
                'test_categories.name as category_name'
            )
            ->leftJoin('test_categories', 'tests.category_id', '=', 'test_categories.test_category_id')
            ->where('tests.test_id', $testId)
            ->first();
    }

    public function getUserTestResults(int $userId)
    {
        return DB::table('test_results')
            ->select(
                'test_results.test_result_id',
                'test_results.user_id',
                'test_results.test_id',
                'test_results.score_obtained',
                'test_results.total_score',
                'test_results.answers',
                'test_results.submitted_at',
                'test_results.rank',
                'tests.name as test_name',
                'tests.type as test_type'
            )
            ->leftJoin('tests', 'test_results.test_id', '=', 'tests.test_id')
            ->where('test_results.user_id', $userId)
            ->orderBy('test_results.submitted_at', 'desc')
            ->get();
    }

    public function getUserTestResultsByTest(int $userId, int $testId)
    {
        return DB::table('test_results')
            ->select(
                'test_results.test_result_id',
                'test_results.user_id',
                'test_results.test_id',
                'test_results.score_obtained',
                'test_results.total_score',
                'test_results.answers',
                'test_results.submitted_at',
                'test_results.rank',
                'tests.name as test_name',
                'tests.type as test_type'
            )
            ->leftJoin('tests', 'test_results.test_id', '=', 'tests.test_id')
            ->where('test_results.user_id', $userId)
            ->where('test_results.test_id', $testId)
            ->orderBy('test_results.submitted_at', 'desc')
            ->get();
    }

     public function saveTestResult(array $resultData): array
    {
        try {
            DB::beginTransaction();

            $testResultId = DB::table('test_results')->insertGetId([
                'user_id' => $resultData['user_id'],
                'test_id' => $resultData['test_id'],
                'score_obtained' => $resultData['score_obtained'],
                'total_score' => $resultData['total_score'],
                'answers' => json_encode($resultData['answers']),
                'submitted_at' => now()->setTimezone('Asia/Kolkata'), // Store in IST
                'rank' => 0
            ]);

            if (!$testResultId) {
                throw new Exception('Failed to save test result');
            }

            $this->calculateRank($testResultId, $resultData['test_id']);

            DB::commit();

            return [
                'test_result_id' => $testResultId,
                'user_id' => $resultData['user_id'],
                'test_id' => $resultData['test_id'],
                'score_obtained' => $resultData['score_obtained'],
                'total_score' => $resultData['total_score'],
                'submitted_at' => now()->setTimezone('Asia/Kolkata')->toDateTimeString(),
                'rank' => DB::table('test_results')->where('test_result_id', $testResultId)->value('rank')
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function calculateRank(int $testResultId, int $testId): void
    {
        // Get all results for this test ordered by score and submission time
        $results = DB::table('test_results')
            ->select('test_result_id', 'score_obtained', 'submitted_at')
            ->where('test_id', $testId)
            ->orderBy('score_obtained', 'desc')
            ->orderBy('submitted_at', 'asc')
            ->get();

        $rank = 1;
        foreach ($results as $result) {
            DB::table('test_results')
                ->where('test_result_id', $result->test_result_id)
                ->update(['rank' => $rank]);
            $rank++;
        }
    }

    public function getTestResultWithDetails(int $testResultId)
    {
        // Get test result with test details
        $result = DB::table('test_results')
            ->select(
                'test_results.test_result_id',
                'test_results.user_id',
                'test_results.test_id',
                'test_results.score_obtained',
                'test_results.total_score',
                'test_results.answers',
                'test_results.submitted_at',
                'test_results.rank',
                'tests.name as test_name',
                'tests.type as test_type',
                'tests.duration_minutes',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->leftJoin('tests', 'test_results.test_id', '=', 'tests.test_id')
            ->leftJoin('users', 'test_results.user_id', '=', 'users.user_id')
            ->where('test_results.test_result_id', $testResultId)
            ->first();

        if (!$result) {
            return null;
        }

        // Get questions for this test
        $result->questions = DB::table('questions')
            ->select(
                'question_id',
                'test_id',
                'text',
                'options',
                'correct_option_id'
            )
            ->where('test_id', $result->test_id)
            ->orderBy('question_id', 'asc')
            ->get();

        return $result;
    }

    public function checkIfUserHasAttemptedTest(int $userId, int $testId): bool
    {
        return DB::table('test_results')
            ->where('user_id', $userId)
            ->where('test_id', $testId)
            ->exists();
    }

    public function getTestStats(int $testId): array
    {
        $totalAttempts = DB::table('test_results')
            ->where('test_id', $testId)
            ->count();

        $averageScore = DB::table('test_results')
            ->where('test_id', $testId)
            ->avg('score_obtained');

        $topScore = DB::table('test_results')
            ->where('test_id', $testId)
            ->max('score_obtained');

        return [
            'total_attempts' => $totalAttempts,
            'average_score' => round($averageScore, 2),
            'top_score' => $topScore,
        ];
    }
}