<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class StudentRepository
{
    public function createStudentWithDetails(array $studentData): array
    {
        try {
            DB::beginTransaction();

            // Check existing records
            if ($this->checkEmailExists($studentData['email'])) {
                throw new Exception('Email already exists');
            }

            if ($this->checkMobileExists($studentData['mobile'])) {
                throw new Exception('Mobile number already exists');
            }

            // Insert into users table
            $userId = DB::table('users')->insertGetId([
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'mobile' => $studentData['mobile'] ?? null,
                'password_hash' => Hash::make($studentData['password']),
                'role' => 'student',
                'city' => $studentData['city'] ?? null,
                'address' => $studentData['address'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$userId) {
                throw new Exception('Failed to create user');
            }

            // Insert into students table
            $studentInserted = DB::table('students')->insert([
                'user_id' => $userId,
                'course_id' => $studentData['course_id'],
                'teacher_id' => $studentData['teacher_id'] ?? null,
                'referred_by_affiliate_id' => $studentData['referred_by_affiliate_id'] ?? null,
                'display_name_preference' => $studentData['display_name_preference'] ?? 'real_name',
                'gender' => $studentData['gender'] ?? null,
            ]);

            if (!$studentInserted) {
                throw new Exception('Failed to create student record');
            }

            DB::commit();

            return [
                'user_id' => $userId,
                'student_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateStudentWithDetails(int $userId, array $studentData): array
    {
        try {
            DB::beginTransaction();

            $user = DB::table('users')->where('user_id', $userId)->first();
            if (!$user) {
                throw new Exception('User not found');
            }

            $student = DB::table('students')->where('user_id', $userId)->first();
            if (!$student) {
                throw new Exception('Student not found');
            }

            // Update user data
            $userUpdateData = [
                'name' => $studentData['name'],
                'email' => $studentData['email'],
                'mobile' => $studentData['mobile'] ?? $user->mobile,
                'city' => $studentData['city'] ?? $user->city,
                'address' => $studentData['address'] ?? $user->address,
                'updated_at' => now()
            ];

            DB::table('users')->where('user_id', $userId)->update($userUpdateData);

            // Update student data
            $studentUpdateData = [
                'course_id' => $studentData['course_id'],
                'teacher_id' => $studentData['teacher_id'] ?? null,
                'referred_by_affiliate_id' => $studentData['referred_by_affiliate_id'] ?? null,
                'display_name_preference' => $studentData['display_name_preference'] ?? 'real_name',
                'gender' => $studentData['gender'] ?? null,
            ];

            DB::table('students')->where('user_id', $userId)->update($studentUpdateData);

            DB::commit();

            return [
                'user_id' => $userId,
                'student_updated' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getAllStudentsWithDetails()
    {
        return DB::table('users')
            ->join('students', 'users.user_id', '=', 'students.user_id')
            ->leftJoin('courses', 'students.course_id', '=', 'courses.course_id')
            ->leftJoin('users as teachers', 'students.teacher_id', '=', 'teachers.user_id')
            ->leftJoin('partners', 'students.referred_by_affiliate_id', '=', 'partners.affiliate_id')
            ->where('users.role', 'student')
            ->select(
                'users.user_id',
                'users.name',
                'users.email',
                'users.mobile',
                'users.city',
                'users.address',
                'users.created_at',
                'students.course_id',
                'students.teacher_id',
                'students.referred_by_affiliate_id',
                'students.display_name_preference',
                'students.gender',
                'courses.title as course_title',
                'courses.duration as course_duration',
                'courses.level as course_level',
                'teachers.name as teacher_name',
                'partners.affiliate_id',
                'partners.firm_name as referred_by_firm'
            )
            ->get();
    }

    public function getStudentWithDetails(int $userId): ?object
    {
        return DB::table('users')
            ->join('students', 'users.user_id', '=', 'students.user_id')
            ->leftJoin('courses', 'students.course_id', '=', 'courses.course_id')
            ->leftJoin('users as teachers', 'students.teacher_id', '=', 'teachers.user_id')
            ->leftJoin('partners', 'students.referred_by_affiliate_id', '=', 'partners.affiliate_id')
            ->where('users.user_id', $userId)
            ->where('users.role', 'student')
            ->select(
                'users.user_id',
                'users.name',
                'users.email',
                'users.mobile',
                'users.city',
                'users.address',
                'users.created_at',
                'students.course_id',
                'students.teacher_id',
                'students.referred_by_affiliate_id',
                'students.display_name_preference',
                'students.gender',
                'courses.title as course_title',
                'courses.duration as course_duration',
                'courses.level as course_level',
                'teachers.name as teacher_name',
                'partners.affiliate_id',
                'partners.firm_name as referred_by_firm'
            )
            ->first();
    }

    public function deleteStudent(int $userId): bool
    {
        try {
            DB::beginTransaction();

            // Delete student record first
            $studentDeleted = DB::table('students')->where('user_id', $userId)->delete();

            if (!$studentDeleted) {
                throw new Exception('Failed to delete student record');
            }

            // Then delete user record
            $userDeleted = DB::table('users')->where('user_id', $userId)->delete();

            if (!$userDeleted) {
                throw new Exception('Failed to delete user record');
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function checkEmailExists(string $email): bool
    {
        return DB::table('users')->where('email', $email)->exists();
    }

    public function checkMobileExists(string $mobile): bool
    {
        return DB::table('users')->where('mobile', $mobile)->exists();
    }

     public function getAvailableTeachers()
    {
        return DB::table('users')
            ->join('teachers', 'users.user_id', '=', 'teachers.user_id')
            ->where('users.role', 'teacher')
            ->orWhere('users.role', 'both')
            ->select(
                'users.user_id',
                'users.name',
                'teachers.specialization'
            )
            ->get();
    }

    public function getAvailableCourses()
    {
        return DB::table('courses')
            ->select('course_id', 'title', 'duration', 'level', 'price')
            ->where('course_id', '>', 0) // Ensure we get actual courses
            ->get();
    }

    public function getAvailableAffiliates()
    {
        return DB::table('partners')
            ->select('affiliate_id', 'firm_name')
            ->get();
    }

    
}