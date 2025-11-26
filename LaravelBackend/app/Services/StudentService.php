<?php

namespace App\Services;

use App\Repositories\StudentRepository;
use Exception;

class StudentService
{
    protected StudentRepository $studentRepository;

    public function __construct(StudentRepository $studentRepository)
    {
        $this->studentRepository = $studentRepository;
    }

    public function registerStudent(array $studentData): array
    {
        try {
            $createdData = $this->studentRepository->createStudentWithDetails($studentData);
            $studentWithDetails = $this->studentRepository->getStudentWithDetails($createdData['user_id']);

            return [
                'success' => true,
                'message' => 'Student registered successfully',
                'data' => $studentWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Student registration failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function updateStudent(int $userId, array $studentData): array
    {
        try {
            $updatedData = $this->studentRepository->updateStudentWithDetails($userId, $studentData);
            $studentWithDetails = $this->studentRepository->getStudentWithDetails($userId);

            return [
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $studentWithDetails,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Student update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function getAllStudents(): array
    {
        try {
            $students = $this->studentRepository->getAllStudentsWithDetails();

            return [
                'success' => true,
                'message' => 'Students retrieved successfully',
                'data' => $students,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve students: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getStudent(int $userId): array
    {
        try {
            $student = $this->studentRepository->getStudentWithDetails($userId);

            if (!$student) {
                return [
                    'success' => false,
                    'message' => 'Student not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Student retrieved successfully',
                'data' => $student,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve student: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function deleteStudent(int $userId): array
    {
        try {
            $deleted = $this->studentRepository->deleteStudent($userId);

            return [
                'success' => true,
                'message' => 'Student deleted successfully',
                'data' => null,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete student: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function getAvailableOptions(): array
    {
        try {
            $teachers = $this->studentRepository->getAvailableTeachers();
            $courses = $this->studentRepository->getAvailableCourses();
            $affiliates = $this->studentRepository->getAvailableAffiliates();

            return [
                'success' => true,
                'message' => 'Options retrieved successfully',
                'data' => [
                    'teachers' => $teachers,
                    'courses' => $courses,
                    'affiliates' => $affiliates
                ],
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve options: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
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

     public function getStudentProfile(int $userId): array
    {
        try {
            $student = $this->studentRepository->getStudentWithDetails($userId);

            if (!$student) {
                return [
                    'success' => false,
                    'message' => 'Student not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Student profile retrieved successfully',
                'data' => $student,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            \Log::error('Get student profile error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function updateStudentProfile(int $userId, array $profileData): array
    {
        try {
            $result = $this->studentRepository->updateStudentProfile($userId, $profileData);

            return [
                'success' => true,
                'message' => 'Student profile updated successfully',
                'data' => $result,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            \Log::error('Update student profile error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function updateStudentPhoto(int $userId, $image): array
    {
        try {
            $result = $this->studentRepository->updateStudentPhoto($userId, $image);

            return [
                'success' => true,
                'message' => 'Student photo updated successfully',
                'data' => $result,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            \Log::error('Update student photo error: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }
}