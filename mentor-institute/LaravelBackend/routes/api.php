<?php

use Illuminate\Support\Facades\Route;
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

// Your registration route
Route::post('/register', [AuthController::class, 'register']);

// Add other routes as needed