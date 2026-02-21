<?php

use App\Http\Controllers\CourseController;
use App\Http\Controllers\DemoBookingController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TestCategoryController;
use App\Http\Controllers\TestController;
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
// student profile section
Route::post('/students/{userId}/profile', [StudentController::class, 'updateProfile']);

Route::post('/students/{userId}', [StudentController::class, 'update']); // Changed to POST for file uploads
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

// Route::get('/debug-commission/{demoId}', function ($demoId) {
//     $bookingRepo = new App\Repositories\DemoBookingRepository();
//     $paymentRepo = new App\Repositories\PaymentRepository();
    
//     $booking = $bookingRepo->getDemoBookingById($demoId);
    
//     if (!$booking) {
//         return response()->json(['error' => 'Booking not found'], 404);
//     }
    
//     $affiliateDetails = $paymentRepo->getAffiliateDetails($booking->affiliate_id);
//     $commission = $paymentRepo->calculateCommission($booking->course_id, $booking->affiliate_id);
    
//     return response()->json([
//         'booking' => [
//             'demo_id' => $booking->demo_id,
//             'student_name' => $booking->student_name,
//             'course_id' => $booking->course_id,
//             'affiliate_id' => $booking->affiliate_id,
//         ],
//         'affiliate_details' => $affiliateDetails,
//         'commission_calculation' => [
//             'calculated_commission' => $commission,
//             'course_price' => \DB::table('courses')->where('course_id', $booking->course_id)->value('price'),
//         ]
//     ]);
// });

// Auth routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/user/{userId}', [AuthController::class, 'getUser']);

Route::post('/test-password', [AuthController::class, 'testPassword']);

Route::get('/generate-proper-hash', function() {
    $password = 'password123';
    $properHash = Hash::make($password);
    
    return response()->json([
        'password' => $password,
        'proper_bcrypt_hash' => $properHash,
        'hash_length' => strlen($properHash)
    ]);
});

// Add this to your students routes
Route::post('/students/{userId}/photo', [StudentController::class, 'updatePhoto']);

// Test routes
Route::get('/test-categories', [TestController::class, 'getTestCategories']);
Route::get('/practice-tests', [TestController::class, 'getPracticeTests']);
Route::get('/tests/{testId}', [TestController::class, 'getTestWithQuestions']);
Route::post('/test-results', [TestController::class, 'submitTestResult']);
Route::get('/users/{userId}/test-results', [TestController::class, 'getUserTestResults']);
Route::get('/test-results/{testResultId}', [TestController::class, 'getTestResultDetails']);


// CONTEST ROUTES
Route::get('/upcoming-contests', [TestController::class, 'getUpcomingContests']);
Route::get('/completed-contests', [TestController::class, 'getCompletedContests']);
Route::get('/contest-details/{contestId}', [TestController::class, 'getContestDetails']);
Route::post('/contest/{contestId}/register', [TestController::class, 'registerForContest']);

// routes/api.php - Add this at the top
Route::get('/test', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Laravel Backend',
        'url' => request()->getHttpHost(),
        'razorpay_ready' => true,
        'timestamp' => now()->toDateTimeString()
    ]);
});

// ==================== PAYMENT ROUTES ====================
Route::prefix('payments')->group(function () {
    // Create payment order for contest
    Route::post('/contest/{contestId}/order', [PaymentController::class, 'createContestPaymentOrder']);
    
    // Verify payment
    Route::post('/verify', [PaymentController::class, 'verifyPayment']);
    
    // Get payment status
    Route::get('/{paymentId}/status', [PaymentController::class, 'getPaymentStatus']);
    
    // Get user payments
    Route::get('/user/{userId}', [PaymentController::class, 'getUserPayments']);
});

// Test routes
Route::get('/test', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Laravel Backend',
        'url' => request()->getHttpHost(),
        'razorpay_ready' => true,
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Newpull

// Test ngrok route
Route::get('/test-ngrok', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Laravel Backend via ngrok',
        'url' => request()->getHttpHost(),
        'razorpay_ready' => env('RAZORPAY_KEY_ID') ? true : false,
        'frontend_url' => env('FRONTEND_URL'),
        'timestamp' => now()->toDateTimeString()
    ]);
});