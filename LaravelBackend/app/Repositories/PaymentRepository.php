<?php
// app/Repositories/PaymentRepository.php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class PaymentRepository
{
    public function createPayment(array $paymentData): array
    {
        try {
            DB::beginTransaction();

            $paymentId = DB::table('payments')->insertGetId([
                'demo_booking_id' => $paymentData['demo_booking_id'],
                'affiliate_id' => $paymentData['affiliate_id'] ?? null,
                'paid_on' => $paymentData['paid_on'],
                'amount' => $paymentData['amount'],
                'mode' => $paymentData['mode'],
                'description' => $paymentData['description'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$paymentId) {
                throw new Exception('Failed to create payment');
            }

            DB::commit();

            return [
                'payment_id' => $paymentId,
                'payment_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getPaymentById(int $paymentId): ?object
    {
        return DB::table('payments')
            ->where('payments_details_id', $paymentId)
            ->first();
    }

    public function getPaymentsByAffiliate(string $affiliateId)
    {
        return DB::table('payments')
            ->where('affiliate_id', $affiliateId)
            ->orderBy('paid_on', 'desc')
            ->get();
    }

    public function updateDemoBookingPayment(int $demoId, int $paymentId): bool
    {
        return DB::table('demo_bookings')
            ->where('demo_id', $demoId)
            ->update([
                'payment_details_id' => $paymentId,
                'commission_paid' => true,
                'updated_at' => now()
            ]);
    }

    // UPDATED: Check both teachers and partners tables for commission percentage
    public function calculateCommission(int $courseId, $affiliateId = null): float
    {
        // Return 0 immediately if no affiliate
        if (!$affiliateId) {
            return 0;
        }

        // Get course price
        $course = DB::table('courses')
            ->where('course_id', $courseId)
            ->first();

        if (!$course || !$course->price) {
            \Log::error("Course not found or has no price: {$courseId}");
            return 0;
        }

        // First, check if affiliate exists in users table and get the role
        $user = DB::table('users')
            ->where('affiliate_id', $affiliateId)
            ->first();

        if (!$user) {
            \Log::error("Affiliate not found in users table: {$affiliateId}");
            return 0;
        }

        $commissionPercentage = 0;

        // Check based on user role
        if ($user->role === 'teacher') {
            // Get commission from teachers table
            $teacher = DB::table('teachers')
                ->where('user_id', $user->id)
                ->first();
            
            if ($teacher && isset($teacher->commission_percentage)) {
                $commissionPercentage = $teacher->commission_percentage;
            }
        } elseif ($user->role === 'partner') {
            // Get commission from partners table
            $partner = DB::table('partners')
                ->where('user_id', $user->id)
                ->first();
            
            if ($partner && isset($partner->commission_percentage)) {
                $commissionPercentage = $partner->commission_percentage;
            }
        }

        // If no commission percentage found, use default
        if ($commissionPercentage <= 0) {
            $commissionPercentage = 15.00; // Default 15%
            \Log::warning("Using default commission percentage for affiliate: {$affiliateId}");
        }

        // Calculate commission
        $commission = ($course->price * $commissionPercentage) / 100;
        
        \Log::info("Commission calculated", [
            'course_id' => $courseId,
            'course_price' => $course->price,
            'affiliate_id' => $affiliateId,
            'user_role' => $user->role,
            'commission_percentage' => $commissionPercentage,
            'commission_amount' => $commission
        ]);

        return round($commission, 2);
    }

    // Alternative method that works directly with demo booking ID
    public function calculateCommissionForBooking(int $demoId): float
    {
        $booking = DB::table('demo_bookings')
            ->where('demo_id', $demoId)
            ->first();

        if (!$booking) {
            \Log::error("Booking not found: {$demoId}");
            return 0;
        }

        return $this->calculateCommission($booking->course_id, $booking->affiliate_id);
    }

    // NEW: Get affiliate details for debugging
    public function getAffiliateDetails($affiliateId)
    {
        if (!$affiliateId) {
            return null;
        }

        $user = DB::table('users')
            ->where('affiliate_id', $affiliateId)
            ->first();

        if (!$user) {
            return null;
        }

        $details = [
            'user_id' => $user->id,
            'affiliate_id' => $user->affiliate_id,
            'role' => $user->role,
            'name' => $user->name,
            'commission_percentage' => null,
            'source_table' => null
        ];

        if ($user->role === 'teacher') {
            $teacher = DB::table('teachers')
                ->where('user_id', $user->id)
                ->first();
            
            if ($teacher) {
                $details['commission_percentage'] = $teacher->commission_percentage;
                $details['source_table'] = 'teachers';
            }
        } elseif ($user->role === 'partner') {
            $partner = DB::table('partners')
                ->where('user_id', $user->id)
                ->first();
            
            if ($partner) {
                $details['commission_percentage'] = $partner->commission_percentage;
                $details['source_table'] = 'partners';
            }
        }

        return $details;
    }
}