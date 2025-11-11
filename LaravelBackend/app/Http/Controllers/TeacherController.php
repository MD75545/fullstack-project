<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TeacherController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Get all users with teacher role and their teacher details
            $teachers = DB::table('users')
                ->leftJoin('teachers', 'users.user_id', '=', 'teachers.user_id')
                ->where('users.role', 'teacher')
                ->orWhere('users.role', 'both') // Include users who are both teacher and partner
                ->select(
                    'users.user_id as user_id',
                    'users.name',
                    'users.email',
                    'users.mobile',
                    'users.role',
                    'users.city',
                    'users.address',
                    'users.created_at',
                    'teachers.user_id as teacher_user_id',
                    'teachers.specialization',
                    'teachers.affiliate_id as affiliateId',
                    'teachers.commission_percentage as commissionPercentage'
                )
                ->get();

            // Transform the data to match frontend expectations
            $formattedTeachers = $teachers->map(function ($teacher) {
                return [
                    'id' => $teacher->user_id, // Use user_id as id for frontend
                    'user_id' => $teacher->user_id,
                    'name' => $teacher->name,
                    'email' => $teacher->email,
                    'mobile' => $teacher->mobile ?? '',
                    'role' => $teacher->role,
                    'city' => $teacher->city ?? '',
                    'address' => $teacher->address ?? '',
                    'specialization' => $teacher->specialization ?? '',
                    'affiliateId' => $teacher->affiliateId ?? '',
                    'commissionPercentage' => $teacher->commissionPercentage ?? 0,
                    'created_at' => $teacher->created_at,
                    'earnings' => ['total' => 0, 'daily' => 0] // Default earnings
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Teachers retrieved successfully',
                'data' => $formattedTeachers,
                'status_code' => 200
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching teachers: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teachers: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ], 500);
        }
    }

    public function update(Request $request, $user_id): JsonResponse
    {
        Log::info('Teacher Update Request:', [
            'user_id' => $user_id,
            'data' => $request->all()
        ]);

        DB::beginTransaction();

        try {
            // Find the teacher by user_id
            $teacher = Teacher::where('user_id', $user_id)->first();
            
            if (!$teacher) {
                return response()->json([
                    'success' => false,
                    'message' => 'Teacher not found'
                ], 404);
            }

            // Find the associated user using user_id
            $user = User::where('user_id', $user_id)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found for this teacher'
                ], 404);
            }

            Log::info('Current Data:', [
                'teacher' => $teacher->toArray(),
                'user' => $user->toArray()
            ]);

            // Validate the request data
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user_id . ',user_id',
                'mobile' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'specialization' => 'sometimes|required|string|max:255',
                'affiliateId' => 'nullable|string|max:255',
                'commissionPercentage' => 'nullable|numeric|min:0|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            Log::info('Validated Data:', $validatedData);

            // Update user data (name, email, mobile, city, address)
            $userUpdateData = [];
            if (isset($validatedData['name'])) $userUpdateData['name'] = $validatedData['name'];
            if (isset($validatedData['email'])) $userUpdateData['email'] = $validatedData['email'];
            if (isset($validatedData['mobile'])) $userUpdateData['mobile'] = $validatedData['mobile'];
            if (isset($validatedData['city'])) $userUpdateData['city'] = $validatedData['city'];
            if (isset($validatedData['address'])) $userUpdateData['address'] = $validatedData['address'];

            if (!empty($userUpdateData)) {
                DB::table('users')
                    ->where('user_id', $user_id)
                    ->update($userUpdateData);
            }

            // Update teacher-specific data
            $teacherUpdateData = [];
            if (isset($validatedData['specialization'])) $teacherUpdateData['specialization'] = $validatedData['specialization'];
            if (isset($validatedData['affiliateId'])) $teacherUpdateData['affiliate_id'] = $validatedData['affiliateId'];
            if (isset($validatedData['commissionPercentage'])) $teacherUpdateData['commission_percentage'] = $validatedData['commissionPercentage'];

            if (!empty($teacherUpdateData)) {
                DB::table('teachers')
                    ->where('user_id', $user_id)
                    ->update($teacherUpdateData);
            }

            DB::commit();

            // Get updated data
            $updatedUser = User::where('user_id', $user_id)->first();
            $updatedTeacher = Teacher::where('user_id', $user_id)->first();

            Log::info('Teacher Updated Successfully:', [
                'user' => $updatedUser->toArray(),
                'teacher' => $updatedTeacher->toArray()
            ]);

            // Return combined data for frontend
            return response()->json([
                'success' => true,
                'message' => 'Teacher updated successfully',
                'data' => [
                    'id' => $user_id, // Use user_id as id
                    'user_id' => $user_id,
                    'name' => $updatedUser->name,
                    'email' => $updatedUser->email,
                    'mobile' => $updatedUser->mobile,
                    'city' => $updatedUser->city,
                    'address' => $updatedUser->address,
                    'specialization' => $updatedTeacher->specialization,
                    'affiliateId' => $updatedTeacher->affiliate_id,
                    'commissionPercentage' => $updatedTeacher->commission_percentage,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation Error:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Teacher Update Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update teacher: ' . $e->getMessage()
            ], 500);
        }
    }

   public function destroy($user_id): JsonResponse
{
    DB::beginTransaction();

    try {
        $teacher = Teacher::where('user_id', $user_id)->first();
        
        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Teacher not found'
            ], 404);
        }

        $user = User::where('user_id', $user_id)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found for this teacher'
            ], 404);
        }

        // Determine user's current roles
        $isPartner = DB::table('partners')->where('user_id', $user_id)->exists();
        $currentRole = $user->role;

        // Delete teacher record
        DB::table('teachers')->where('user_id', $user_id)->delete();

        // Update user role based on remaining roles
        if ($isPartner) {
            // User is still a partner - update role to 'partner'
            DB::table('users')
                ->where('user_id', $user_id)
                ->update(['role' => 'partner']);
                
            $message = 'Teacher role removed successfully. User remains as partner.';
        } else {
            // User is no longer teacher or partner - delete user completely
            $user->delete();
            $message = 'Teacher and user deleted successfully.';
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => $message
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Delete Teacher Error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete teacher: ' . $e->getMessage()
        ], 500);
    }
}
}