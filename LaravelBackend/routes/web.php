<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('welcome');
});

// Temporary test route in web.php
Route::post('/test-register', [AuthController::class, 'register']);