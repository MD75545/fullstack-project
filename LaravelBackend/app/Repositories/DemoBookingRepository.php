<?php
// app/Repositories/DemoBookingRepository.php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Exception;

class DemoBookingRepository
{
    public function getAllDemoBookings()
    {
        return DB::table('demo_bookings')
            ->select(
                'demo_id as id',
                'student_name',
                'student_email',
                'student_mobile',
                'course_id',
                'affiliate_id as referredByAffiliateId',
                'booking_date as bookingDate',
                'booking_time as bookingTime',
                'status',
                'scheduled_date as scheduledDate',
                'scheduled_time as scheduledTime',
                'teacher_id',
                'commission_amount as commissionAmount',
                'commission_paid as commissionPaid',
                'payment_details_id',
                'created_at',
                'updated_at'
            )
            ->orderBy('demo_id', 'desc')
            ->get();
    }

    public function getDemoBookingById(int $demoId): ?object
    {
        return DB::table('demo_bookings')
            ->where('demo_id', $demoId)
            ->first();
    }

    public function createDemoBooking(array $bookingData): array
    {
        try {
            DB::beginTransaction();

            $insertData = [
                'student_name' => $bookingData['student_name'],
                'student_email' => $bookingData['student_email'],
                'student_mobile' => $bookingData['student_mobile'],
                'course_id' => $bookingData['course_id'],
                'affiliate_id' => $bookingData['affiliate_id'] ?? null,
                'booking_date' => $bookingData['booking_date'],
                'booking_time' => $bookingData['booking_time'],
                'status' => 'Pending'
            ];

            // Only add timestamps if columns exist
            $tableColumns = DB::select('SHOW COLUMNS FROM demo_bookings');
            $columnNames = array_column($tableColumns, 'Field');
            
            if (in_array('created_at', $columnNames)) {
                $insertData['created_at'] = now();
            }
            if (in_array('updated_at', $columnNames)) {
                $insertData['updated_at'] = now();
            }

            $demoId = DB::table('demo_bookings')->insertGetId($insertData);

            if (!$demoId) {
                throw new Exception('Failed to create demo booking');
            }

            DB::commit();

            return [
                'demo_id' => $demoId,
                'booking_created' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateDemoBooking(int $demoId, array $bookingData): array
    {
        try {
            DB::beginTransaction();

            $booking = DB::table('demo_bookings')->where('demo_id', $demoId)->first();
            if (!$booking) {
                throw new Exception('Demo booking not found');
            }

            $updateData = [];

            // Update only provided fields
            $allowedFields = [
                'student_name', 'student_email', 'student_mobile', 'course_id',
                'affiliate_id', 'booking_date', 'booking_time', 'status',
                'scheduled_date', 'scheduled_time', 'teacher_id',
                'commission_amount', 'commission_paid', 'payment_details_id'
            ];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $bookingData)) {
                    $updateData[$field] = $bookingData[$field];
                }
            }

            // Only update updated_at if column exists
            $tableColumns = DB::select('SHOW COLUMNS FROM demo_bookings');
            $columnNames = array_column($tableColumns, 'Field');
            
            if (in_array('updated_at', $columnNames)) {
                $updateData['updated_at'] = now();
            }

            $updated = DB::table('demo_bookings')
                ->where('demo_id', $demoId)
                ->update($updateData);

            if (!$updated) {
                throw new Exception('Failed to update demo booking');
            }

            DB::commit();

            return [
                'demo_id' => $demoId,
                'booking_updated' => true
            ];

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteDemoBooking(int $demoId): bool
    {
        try {
            DB::beginTransaction();

            $booking = DB::table('demo_bookings')->where('demo_id', $demoId)->first();
            if (!$booking) {
                throw new Exception('Demo booking not found');
            }

            $deleted = DB::table('demo_bookings')->where('demo_id', $demoId)->delete();

            if (!$deleted) {
                throw new Exception('Failed to delete demo booking');
            }

            DB::commit();
            return true;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getDemoBookingsByStatus(string $status)
    {
        return DB::table('demo_bookings')
            ->where('status', $status)
            ->orderBy('demo_id', 'desc')
            ->get();
    }
}