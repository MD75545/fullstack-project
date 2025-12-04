<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

// Test routes for ngrok/Razorpay
Route::get('/test', function () {
    return response()->json([
        'status' => 'online',
        'service' => 'Laravel Backend via ngrok',
        'url' => request()->getHttpHost(),
        'razorpay_ready' => true,
        'timestamp' => now()->toDateTimeString()
    ]);
});

Route::get('/health', function () {
    return response()->json(['status' => 'healthy', 'service' => 'Laravel']);
});

Route::post('/razorpay-create-order', function (Request $request) {
    try {
        // For testing, return a mock order
        return response()->json([
            'success' => true,
            'order_id' => 'order_test_' . time() . '_' . rand(1000, 9999),
            'amount' => ($request->amount ?? 100) * 100, // Default ₹1
            'currency' => 'INR',
            'receipt' => 'receipt_' . time(),
            'message' => 'Test order created. Use real Razorpay keys for production.'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/razorpay-test', function () {
    return response()->json([
        'razorpay' => 'test_mode',
        'backend' => 'Laravel',
        'url' => url('/'),
        'timestamp' => now()->toDateTimeString(),
        'instructions' => 'Use test card: 4111 1111 1111 1111'
    ]);
});

// Your existing routes
Route::get('/', function () {
    return view('welcome');
});

Route::post('/test-register', [AuthController::class, 'register']);