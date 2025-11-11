<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Exception;

class CourseRepository
{
    public function getAllCourses()
    {
        return DB::table('courses')
            ->select('course_id', 'title', 'description', 'duration', 'level', 'image_url', 'price')
            ->orderBy('course_id', 'desc')
            ->get();
    }

    public function getCourseById(int $courseId): ?object
    {
        return DB::table('courses')
            ->where('course_id', $courseId)
            ->first();
    }

    public function createCourse(array $courseData): array
    {
        try {
            DB::beginTransaction();

            $courseId = DB::table('courses')->insertGetId([
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'duration' => $courseData['duration'],
                'level' => $courseData['level'],
                'image_url' => $courseData['image_url'] ?? null,
                'price' => $courseData['price'],
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$courseId) {
                throw new Exception('Failed to create course');
            }

            DB::commit();

            return [
                'course_id' => $courseId,
                'course_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCourse(int $courseId, array $courseData): array
    {
        try {
            DB::beginTransaction();

            $course = DB::table('courses')->where('course_id', $courseId)->first();
            if (!$course) {
                throw new Exception('Course not found');
            }

            $updateData = [
                'title' => $courseData['title'],
                'description' => $courseData['description'],
                'duration' => $courseData['duration'],
                'level' => $courseData['level'],
                'price' => $courseData['price'],
                'updated_at' => now()
            ];

            // Update image only if provided
            if (isset($courseData['image_url'])) {
                $updateData['image_url'] = $courseData['image_url'];
                
                // Delete old image if it exists
                if ($course->image_url && Storage::exists($course->image_url)) {
                    Storage::delete($course->image_url);
                }
            }

            $updated = DB::table('courses')
                ->where('course_id', $courseId)
                ->update($updateData);

            if (!$updated) {
                throw new Exception('Failed to update course');
            }

            DB::commit();

            return [
                'course_id' => $courseId,
                'course_updated' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteCourse(int $courseId): bool
    {
        try {
            DB::beginTransaction();

            $course = DB::table('courses')->where('course_id', $courseId)->first();
            if (!$course) {
                throw new Exception('Course not found');
            }

            // Delete image file if exists
            if ($course->image_url && Storage::exists($course->image_url)) {
                Storage::delete($course->image_url);
            }

            // Check if any students are enrolled in this course
            $enrolledStudents = DB::table('students')
                ->where('course_id', $courseId)
                ->count();

            if ($enrolledStudents > 0) {
                throw new Exception("Cannot delete course. There are {$enrolledStudents} students enrolled in this course.");
            }

            $deleted = DB::table('courses')->where('course_id', $courseId)->delete();

            if (!$deleted) {
                throw new Exception('Failed to delete course');
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

      public function uploadCourseImage($image): string
    {
        try {
            if (!$image) {
                return null;
            }

            $filename = 'course_' . time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // FIX: Use Storage facade with public disk - this is the correct way
            $path = Storage::disk('public')->putFileAs('courses', $image, $filename);
            
            \Log::info('Image stored correctly', [
                'filename' => $filename,
                'path' => $path,
                'full_path' => Storage::disk('public')->path($path)
            ]);
            
            return 'storage/courses/' . $filename;
            
        } catch (Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());
            throw new Exception('Failed to upload image: ' . $e->getMessage());
        }
    }
}