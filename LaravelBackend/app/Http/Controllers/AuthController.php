<?php

namespace App\Http\Controllers;

use App\Services\RegistrationService;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

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
}