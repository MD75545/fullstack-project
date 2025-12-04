<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class PaymentRepository
{
    public function createPayment(array $paymentData): int
    {
        return DB::table('payments')->insertGetId([
            'user_id' => $paymentData['user_id'],
            'test_id' => $paymentData['test_id'] ?? null,
            'demo_id' => $paymentData['demo_id'] ?? null,
            'affiliate_id' => $paymentData['affiliate_id'] ?? null,
            'paid_on' => $paymentData['paid_on'],
            'amount' => $paymentData['amount'],
            'mode' => $paymentData['mode'],
            'payment_type' => $paymentData['payment_type'],
            'razorpay_order_id' => $paymentData['razorpay_order_id'] ?? null,
            'razorpay_payment_id' => $paymentData['razorpay_payment_id'] ?? null,
            'razorpay_signature' => $paymentData['razorpay_signature'] ?? null,
            'status' => $paymentData['status'] ?? 'pending',
            'description' => $paymentData['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
    
    public function updatePayment(int $paymentId, array $updateData): int
    {
        return DB::table('payments')
            ->where('payment_id', $paymentId)
            ->update($updateData);
    }
    
    public function updatePaymentRegistration(int $paymentId, int $registrationId): bool
    {
        // Update contest_registrations with payment_id
        DB::table('contest_registrations')
            ->where('registration_id', $registrationId)
            ->update(['payment_id' => $paymentId]);
        
        return true;
    }
    
    public function getPaymentById(int $paymentId): ?object
    {
        return DB::table('payments')
            ->where('payment_id', $paymentId)
            ->first();
    }
    
    public function getPaymentByOrderId(string $orderId): ?object
    {
        return DB::table('payments')
            ->where('razorpay_order_id', $orderId)
            ->first();
    }
    
    public function getUserPayments(int $userId, ?string $paymentType = null): \Illuminate\Support\Collection
    {
        $query = DB::table('payments')
            ->select(
                'payments.*',
                'tests.name as contest_name',
                'tests.start_time as contest_date'
            )
            ->leftJoin('tests', 'payments.test_id', '=', 'tests.test_id')
            ->where('payments.user_id', $userId)
            ->orderBy('payments.created_at', 'desc');
            
        if ($paymentType !== null) {
            $query->where('payments.payment_type', $paymentType);
        }
        
        return $query->get();
    }
    
    public function getContestRegistrationByPaymentId(int $paymentId): ?object
    {
        return DB::table('contest_registrations')
            ->where('payment_id', $paymentId)
            ->first();
    }
    
    public function createContestRegistration(array $registrationData): int
    {
        return DB::table('contest_registrations')->insertGetId([
            'user_id' => $registrationData['user_id'],
            'test_id' => $registrationData['test_id'],
            'payment_id' => $registrationData['payment_id'] ?? null,
            'registered_at' => now(),
            'status' => $registrationData['status'] ?? 'registered'
        ]);
    }
    
    public function getContestRegistrationByUserAndTest(int $userId, int $testId): ?object
    {
        return DB::table('contest_registrations')
            ->where('user_id', $userId)
            ->where('test_id', $testId)
            ->first();
    }
    
    public function updateContestRegistration(int $registrationId, array $updateData): int
    {
        return DB::table('contest_registrations')
            ->where('registration_id', $registrationId)
            ->update($updateData);
    }
    
    public function getContestRegistrationsByTestId(int $testId): \Illuminate\Support\Collection
    {
        return DB::table('contest_registrations')
            ->select(
                'contest_registrations.*',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->join('users', 'contest_registrations.user_id', '=', 'users.user_id')
            ->where('contest_registrations.test_id', $testId)
            ->orderBy('contest_registrations.registered_at', 'desc')
            ->get();
    }
}