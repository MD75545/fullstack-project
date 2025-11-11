<?php

namespace App\Services;

use App\Repositories\CourseRepository;
use Exception;

class CourseService
{
    protected CourseRepository $courseRepository;

    public function __construct(CourseRepository $courseRepository)
    {
        $this->courseRepository = $courseRepository;
    }

    public function getAllCourses(): array
    {
        try {
            $courses = $this->courseRepository->getAllCourses();

            return [
                'success' => true,
                'message' => 'Courses retrieved successfully',
                'data' => $courses,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve courses: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getCourse(int $courseId): array
    {
        try {
            $course = $this->courseRepository->getCourseById($courseId);

            if (!$course) {
                return [
                    'success' => false,
                    'message' => 'Course not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Course retrieved successfully',
                'data' => $course,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve course: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

   public function createCourse(array $courseData): array
    {
        try {
            // Handle image upload if provided
            if (isset($courseData['image']) && $courseData['image']) {
                $imagePath = $this->courseRepository->uploadCourseImage($courseData['image']);
                $courseData['image_url'] = $imagePath;
            } else {
                $courseData['image_url'] = null;
            }
            unset($courseData['image']); // Remove the image object from data

            $createdData = $this->courseRepository->createCourse($courseData);
            $course = $this->courseRepository->getCourseById($createdData['course_id']);

            return [
                'success' => true,
                'message' => 'Course created successfully',
                'data' => $course,
                'status_code' => 201
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Course creation failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function updateCourse(int $courseId, array $courseData): array
    {
        try {
            // Handle image upload if new image provided
            if (isset($courseData['image'])) {
                $imagePath = $this->courseRepository->uploadCourseImage($courseData['image']);
                $courseData['image_url'] = $imagePath;
                unset($courseData['image']);
            }

            $updatedData = $this->courseRepository->updateCourse($courseId, $courseData);
            $course = $this->courseRepository->getCourseById($courseId);

            return [
                'success' => true,
                'message' => 'Course updated successfully',
                'data' => $course,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Course update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function deleteCourse(int $courseId): array
    {
        try {
            $deleted = $this->courseRepository->deleteCourse($courseId);

            return [
                'success' => true,
                'message' => 'Course deleted successfully',
                'data' => null,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete course: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'not found')) {
            return 404;
        }

        if (str_contains($e->getMessage(), 'Cannot delete course')) {
            return 422;
        }

        return 500;
    }
}