<?php
// app/Http/Controllers/DemoBookingController.php

namespace App\Http\Controllers;

use App\Services\DemoBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DemoBookingController extends Controller
{
    protected DemoBookingService $demoBookingService;

    public function __construct(DemoBookingService $demoBookingService)
    {
        $this->demoBookingService = $demoBookingService;
    }

    public function index(): JsonResponse
    {
        \Log::info('Fetching all demo bookings');
        
        $result = $this->demoBookingService->getAllDemoBookings();

        \Log::info('Demo bookings fetch result', [
            'success' => $result['success'],
            'count' => $result['data'] ? count($result['data']) : 0
        ]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data'],
            'count' => $result['data'] ? count($result['data']) : 0
        ];

        return response()->json($response, $statusCode);
    }

    public function show(int $demoId): JsonResponse
    {
        \Log::info('Fetching demo booking', ['demo_id' => $demoId]);
        
        $result = $this->demoBookingService->getDemoBooking($demoId);

        \Log::info('Demo booking fetch result', ['found' => $result['success']]);

        $statusCode = $result['status_code'];
        $response = [
            'status' => $result['success'] ? 'success' : 'error',
            'message' => $result['message'],
            'data' => $result['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function store(): JsonResponse
    {
        \Log::info('Demo booking creation request received', request()->all());
        
        $creationResult = $this->demoBookingService->createDemoBooking(request()->all());

        \Log::info('Demo booking creation result', $creationResult);

        $statusCode = $creationResult['status_code'];
        $response = [
            'status' => $creationResult['success'] ? 'success' : 'error',
            'message' => $creationResult['message'],
            'data' => $creationResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function update(int $demoId): JsonResponse
    {
        \Log::info('Demo booking update request received', [
            'demo_id' => $demoId,
            'data' => request()->all()
        ]);
        
        $updateResult = $this->demoBookingService->updateDemoBooking($demoId, request()->all());

        \Log::info('Demo booking update result', $updateResult);

        $statusCode = $updateResult['status_code'];
        $response = [
            'status' => $updateResult['success'] ? 'success' : 'error',
            'message' => $updateResult['message'],
            'data' => $updateResult['data']
        ];

        return response()->json($response, $statusCode);
    }

    public function destroy(int $demoId): JsonResponse
    {
        \Log::info('Demo booking delete request received', ['demo_id' => $demoId]);
        
        $deleteResult = $this->demoBookingService->deleteDemoBooking($demoId);

        \Log::info('Demo booking delete result', $deleteResult);

        $statusCode = $deleteResult['status_code'];
        $response = [
            'status' => $deleteResult['success'] ? 'success' : 'error',
            'message' => $deleteResult['message'],
            'data' => $deleteResult['data']
        ];

        return response()->json($response, $statusCode);
    }

   public function schedule(int $demoId): JsonResponse
{
    \Log::info('Scheduling demo booking', [
        'demo_id' => $demoId,
        'data' => request()->all()
    ]);
    
    $requestData = request()->all();
    
    // Validate required fields
    if (!isset($requestData['date']) || !isset($requestData['time'])) {
        return response()->json([
            'status' => 'error',
            'message' => 'Date and time are required',
            'data' => null
        ], 400);
    }
    
    $updateData = [
        'scheduled_date' => $requestData['date'],
        'scheduled_time' => $requestData['time'],
        'status' => 'Scheduled',
        'updated_at' => now()
    ];
    
    // Add teacher_id if provided
    if (isset($requestData['teacher_id']) && !empty($requestData['teacher_id'])) {
        // Verify that the user exists and has teacher role
        $teacher = DB::table('users')
            ->where('user_id', $requestData['teacher_id'])
            ->where('role', 'teacher')
            ->first();
            
        if ($teacher) {
            $updateData['teacher_id'] = $requestData['teacher_id'];
            \Log::info('Assigning teacher to demo', [
                'demo_id' => $demoId,
                'teacher_id' => $requestData['teacher_id'],
                'teacher_name' => $teacher->name
            ]);
        } else {
            \Log::warning('Invalid teacher assignment attempt', [
                'demo_id' => $demoId,
                'teacher_id' => $requestData['teacher_id']
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid teacher selected or user is not a teacher',
                'data' => null
            ], 400);
        }
    }
    
    try {
        // Update the demo booking
        $updated = DB::table('demo_bookings')
            ->where('demo_id', $demoId)
            ->update($updateData);
            
        if ($updated) {
            // Get the UPDATED booking with all fields including teacher_id
            $booking = DB::table('demo_bookings')
                ->where('demo_id', $demoId)
                ->first();
                
            // Return the complete booking data including teacher_id
            return response()->json([
                'status' => 'success',
                'message' => 'Demo scheduled successfully',
                'data' => [
                    'id' => $booking->demo_id,
                    'student_name' => $booking->student_name,
                    'student_email' => $booking->student_email,
                    'student_mobile' => $booking->student_mobile,
                    'course_id' => $booking->course_id,
                    'referredByAffiliateId' => $booking->affiliate_id,
                    'bookingDate' => $booking->booking_date,
                    'bookingTime' => $booking->booking_time,
                    'status' => $booking->status,
                    'scheduledDate' => $booking->scheduled_date,
                    'scheduledTime' => $booking->scheduled_time,
                    'teacher_id' => $booking->teacher_id, // THIS IS CRITICAL
                    'commissionAmount' => $booking->commission_amount,
                    'commissionPaid' => $booking->commission_paid,
                    'payment_details_id' => $booking->payment_details_id
                ]
            ], 200);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to schedule demo',
                'data' => null
            ], 500);
        }
        
    } catch (\Exception $e) {
        \Log::error('Failed to schedule demo: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to schedule demo: ' . $e->getMessage(),
            'data' => null
        ], 500);
    }
}
}