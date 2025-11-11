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
            $createdData = $this->userRepository->createUserWithDetails($userData);
            $userWithDetails = $this->userRepository->getUserWithDetails($createdData['user_id']);

            return [
                'success' => true,
                'message' => $this->getSuccessMessage($userData),
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

    public function updateUser(int $userId, array $userData): array
    {
        try {
            $updatedData = $this->userRepository->updateUserWithDetails($userId, $userData);
            $userWithDetails = $this->userRepository->getUserWithDetails($userId);

            return [
                'success' => true,
                'message' => $this->getUpdateMessage($updatedData),
                'data' => $userWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    private function getSuccessMessage(array $userData): string
    {
        $joinAs = $userData['join_as'] ?? 'teacher';
        
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

    private function getUpdateMessage(array $updatedData): string
    {
        $message = 'User updated successfully';
        
        if (isset($updatedData['teacher_updated']) && isset($updatedData['partner_updated'])) {
            $message = 'Teacher and Partner updated successfully';
        } elseif (isset($updatedData['teacher_updated'])) {
            $message = 'Teacher updated successfully';
        } elseif (isset($updatedData['partner_updated'])) {
            $message = 'Partner updated successfully';
        }
        
        if (isset($updatedData['teacher_removed'])) {
            $message .= ' (Teacher role removed)';
        }
        
        if (isset($updatedData['partner_removed'])) {
            $message .= ' (Partner role removed)';
        }
        
        return $message;
    }

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'already exists')) {
            return 422;
        }

        if (str_contains($e->getMessage(), 'not found')) {
            return 404;
        }

        return 500;
    }
}