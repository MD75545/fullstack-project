<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Exception;

class RegistrationService
{
    protected UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function registerUser(array $userData): array
    {
        try {
            // Create user and related records
            $createdData = $this->userRepository->createUserWithDetails($userData);

            // Get complete user data with relationships
            $userWithDetails = $this->userRepository->getUserWithDetails($createdData['user_id']);

            return [
                'success' => true,
                'message' => $this->getSuccessMessage($userData['join_as']),
                'data' => $userWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

 private function getSuccessMessage(string $joinAs): string
    {
        $messages = [
            'Teacher' => 'Teacher registered successfully',
            'Affiliate' => 'Affiliate registered successfully', 
            'Both' => 'Teacher and Affiliate registered successfully',
            'teacher' => 'Teacher registered successfully',
            'partner' => 'Partner registered successfully',
            'both' => 'Teacher and Partner registered successfully'
        ];

        return $messages[$joinAs] ?? 'User registered successfully';
    }

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'already exists')) {
            return 422;
        }

        return 500;
    }
}