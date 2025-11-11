<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\DemoBookingController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TestCategoryController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;

// Handle CORS preflight requests
Route::options('/{any}', function () {
    return response()->json();
})->where('any', '.*');

// Test CORS route
Route::get('/test-cors', function () {
    return response()->json([
        'message' => 'CORS is working with Laravel 12!',
        'timestamp' => now(),
        'status' => 'success'
    ]);
});


Route::put('/users/{userId}', [AuthController::class, 'updateUser']);
// Your registration route
Route::post('/register', [AuthController::class, 'register']);
// Add teachers route
Route::get('/teachers', [TeacherController::class, 'index']);
Route::put('/teachers/{id}', [TeacherController::class, 'update']); //  update route
Route::delete('/teachers/{id}', [TeacherController::class, 'destroy']); //  delete route

// Add partners routes
Route::get('/partners', [PartnerController::class, 'index']); 

Route::put('/partners/{user_id}', [PartnerController::class, 'update']);
Route::delete('/partners/{user_id}', [PartnerController::class, 'destroy']);

// Students
Route::get('/students', [StudentController::class, 'index']);
Route::get('/students/{userId}', [StudentController::class, 'show']);
Route::post('/students', [StudentController::class, 'store']);
Route::put('/students/{userId}', [StudentController::class, 'update']);
Route::delete('/students/{userId}', [StudentController::class, 'destroy']);
Route::get('/students-options/options', [StudentController::class, 'getOptions']);

// Courses routes
Route::get('/courses', [CourseController::class, 'index']);
Route::get('/courses/{courseId}', [CourseController::class, 'show']);
Route::post('/courses', [CourseController::class, 'store']);
Route::put('/courses/{courseId}', [CourseController::class, 'update']);
Route::delete('/courses/{courseId}', [CourseController::class, 'destroy']);

// Demo Bookings Routes
Route::prefix('demo-bookings')->group(function () {
    Route::get('/', [DemoBookingController::class, 'index']);
    Route::post('/', [DemoBookingController::class, 'store']);
    Route::get('/{demoId}', [DemoBookingController::class, 'show']);
    Route::put('/{demoId}', [DemoBookingController::class, 'update']);
    Route::delete('/{demoId}', [DemoBookingController::class, 'destroy']);
    Route::post('/{demoId}/schedule', [DemoBookingController::class, 'schedule']);
});

// Tasks routes
Route::get('/tasks', [TaskController::class, 'index']);
Route::get('/tasks/{taskId}', [TaskController::class, 'show']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::put('/tasks/{taskId}', [TaskController::class, 'update']);
Route::delete('/tasks/{taskId}', [TaskController::class, 'destroy']);
Route::get('/tasks-teachers/teachers', [TaskController::class, 'getTeachers']);

// Test Categories routes
Route::get('/test-categories', [TestCategoryController::class, 'index']);
Route::get('/test-categories/{categoryId}', [TestCategoryController::class, 'show']);
Route::post('/test-categories', [TestCategoryController::class, 'store']);
Route::put('/test-categories/{categoryId}', [TestCategoryController::class, 'update']);
Route::delete('/test-categories/{categoryId}', [TestCategoryController::class, 'destroy']);

Route::get('/debug-commission/{demoId}', function ($demoId) {
    $bookingRepo = new App\Repositories\DemoBookingRepository();
    $paymentRepo = new App\Repositories\PaymentRepository();
    
    $booking = $bookingRepo->getDemoBookingById($demoId);
    
    if (!$booking) {
        return response()->json(['error' => 'Booking not found'], 404);
    }
    
    $affiliateDetails = $paymentRepo->getAffiliateDetails($booking->affiliate_id);
    $commission = $paymentRepo->calculateCommission($booking->course_id, $booking->affiliate_id);
    
    return response()->json([
        'booking' => [
            'demo_id' => $booking->demo_id,
            'student_name' => $booking->student_name,
            'course_id' => $booking->course_id,
            'affiliate_id' => $booking->affiliate_id,
        ],
        'affiliate_details' => $affiliateDetails,
        'commission_calculation' => [
            'calculated_commission' => $commission,
            'course_price' => \DB::table('courses')->where('course_id', $booking->course_id)->value('price'),
        ]
    ]);
});

