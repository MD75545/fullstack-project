<?php

namespace App\Http\Controllers;

use App\Services\RegistrationService;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    protected RegistrationService $registrationService;

    public function __construct(RegistrationService $registrationService)
    {
        $this->registrationService = $registrationService;
    }

    public function register(RegisterUserRequest $request): JsonResponse
    {
        \Log::info('Registration request received', $request->all());
        
        $registrationResult = $this->registrationService->registerUser($request->validated());

        \Log::info('Registration result', $registrationResult);

        $statusCode = $registrationResult['status_code'];
        $response = [
            'status' => $registrationResult['success'] ? 'success' : 'error',
            'message' => $registrationResult['message'],
            'data' => $registrationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function updateUser(UpdateUserRequest $request, int $userId): JsonResponse
    {
        \Log::info('Update user request received', ['user_id' => $userId, 'data' => $request->all()]);
        
        $updateResult = $this->registrationService->updateUser($userId, $request->validated());

        \Log::info('Update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function login(Request $request): JsonResponse
    {
        Log::info('Login attempt received', ['email' => $request->input('email')]);

        try {
            // Manual validation to avoid validation exceptions
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                Log::warning('Login validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                    'status_code' => 422
                ], 422);
            }

            $email = $request->input('email');
            $password = $request->input('password');

            Log::info('Looking for user', ['email' => $email]);

            // Find user by email
            $user = DB::table('users')
                ->where('email', $email)
                ->first();

            if (!$user) {
                Log::warning('User not found', ['email' => $email]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password.',
                    'status_code' => 401
                ], 401);
            }

            Log::info('User found', [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'role' => $user->role
            ]);

            // Verify password
            Log::info('Verifying password');
            if (!Hash::check($password, $user->password_hash)) {
                Log::warning('Password verification failed', [
                    'user_id' => $user->user_id,
                    'email' => $user->email
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid email or password.',
                    'status_code' => 401
                ], 401);
            }

            Log::info('Password verified successfully');

            // Get additional user details based on role
            $userDetails = $this->getUserDetails($user);

            Log::info('Login successful', [
                'user_id' => $user->user_id,
                'email' => $user->email,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => $userDetails,
                'status_code' => 200
            ]);

        } catch (\Exception $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Login failed. Please try again.',
                'error_details' => config('app.debug') ? $e->getMessage() : null,
                'status_code' => 500
            ], 500);
        }
    }

 private function getUserDetails(object $user): array
{
    try {
        Log::info('Getting user details for user_id: ' . $user->user_id);

        $details = [
            'user_id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'mobile' => $user->mobile ?? '',
            'role' => $user->role,
            'city' => $user->city ?? '',
            'address' => $user->address ?? '',
            'photo_url' => $user->photo_url ?? '', // Add this line
            'created_at' => $user->created_at,
        ];

        // Add role-specific details
        switch ($user->role) {
            case 'student':
                $student = DB::table('students')
                    ->where('user_id', $user->user_id)
                    ->first();
                
                if ($student) {
                    $details['student'] = [
                        'course_id' => $student->course_id,
                        'teacher_id' => $student->teacher_id,
                        'display_name_preference' => $student->display_name_preference,
                        'gender' => $student->gender,
                    ];

                    // Get course details
                    if ($student->course_id) {
                        $course = DB::table('courses')
                            ->where('course_id', $student->course_id)
                            ->first();
                        $details['course'] = $course;
                    }
                }
                break;

            case 'teacher':
                $teacher = DB::table('teachers')
                    ->where('user_id', $user->user_id)
                    ->first();
                
                if ($teacher) {
                    $details['teacher'] = [
                        'specialization' => $teacher->specialization,
                        'affiliate_id' => $teacher->affiliate_id,
                        'commission_percentage' => $teacher->commission_percentage,
                    ];
                }
                break;

            case 'partner':
                $partner = DB::table('partners')
                    ->where('user_id', $user->user_id)
                    ->first();
                
                if ($partner) {
                    $details['partner'] = [
                        'affiliate_id' => $partner->affiliate_id,
                        'firm_name' => $partner->firm_name,
                        'commission_percentage' => $partner->commission_percentage,
                        'partner_type' => $partner->partner_type,
                    ];
                }
                break;
        }

        return $details;

    } catch (\Exception $e) {
        Log::error('Error getting user details', [
            'user_id' => $user->user_id,
            'error' => $e->getMessage()
        ]);
        
        // Return basic user details even if role-specific details fail
        return [
            'user_id' => $user->user_id,
            'name' => $user->name,
            'email' => $user->email,
            'mobile' => $user->mobile ?? '',
            'role' => $user->role,
            'city' => $user->city ?? '',
            'address' => $user->address ?? '',
            'photo_url' => $user->photo_url ?? '', // Add this line
            'created_at' => $user->created_at,
        ];
    }
}
    public function getUser(int $userId): JsonResponse
    {
        try {
            $user = DB::table('users')
                ->where('user_id', $userId)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                    'status_code' => 404
                ], 404);
            }

            $userDetails = $this->getUserDetails($user);

            return response()->json([
                'success' => true,
                'message' => 'User retrieved successfully',
                'data' => $userDetails,
                'status_code' => 200
            ]);

        } catch (\Exception $e) {
            Log::error('Get user error', [
                'user_id' => $userId,
                'message' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
                'status_code' => 500
            ], 500);
        }
    }

    public function testPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $email = $request->input('email');
            $password = $request->input('password');

            $user = DB::table('users')
                ->where('email', $email)
                ->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found',
                    'user_exists' => false
                ], 404);
            }

            $passwordMatches = Hash::check($password, $user->password_hash);

            return response()->json([
                'success' => true,
                'message' => 'Password check completed',
                'data' => [
                    'user_exists' => true,
                    'password_matches' => $passwordMatches,
                    'user_id' => $user->user_id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'password_provided' => $password
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
}