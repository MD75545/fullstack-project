<?php
// app/Services/DemoBookingService.php

namespace App\Services;

use App\Repositories\DemoBookingRepository;
use App\Repositories\PaymentRepository;
use App\Mail\DemoBookingNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

class DemoBookingService
{
    protected DemoBookingRepository $demoBookingRepository;

    public function __construct(DemoBookingRepository $demoBookingRepository)
    {
        $this->demoBookingRepository = $demoBookingRepository;
    }

    public function getAllDemoBookings(): array
    {
        try {
            $bookings = $this->demoBookingRepository->getAllDemoBookings();

            return [
                'success' => true,
                'message' => 'Demo bookings retrieved successfully',
                'data' => $bookings,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve demo bookings: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function getDemoBooking(int $demoId): array
    {
        try {
            $booking = $this->demoBookingRepository->getDemoBookingById($demoId);

            if (!$booking) {
                return [
                    'success' => false,
                    'message' => 'Demo booking not found',
                    'data' => null,
                    'status_code' => 404
                ];
            }

            return [
                'success' => true,
                'message' => 'Demo booking retrieved successfully',
                'data' => $booking,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to retrieve demo booking: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

     public function createDemoBooking(array $bookingData): array
    {
        try {
            // Validate required fields
            $requiredFields = ['student_name', 'student_email', 'student_mobile', 'course_id', 'booking_date', 'booking_time'];
            foreach ($requiredFields as $field) {
                if (empty($bookingData[$field])) {
                    throw new Exception("Field {$field} is required");
                }
            }

            // Transform field names to match database
            $transformedData = [
                'student_name' => $bookingData['student_name'],
                'student_email' => $bookingData['student_email'],
                'student_mobile' => $bookingData['student_mobile'],
                'course_id' => $bookingData['course_id'],
                'affiliate_id' => $bookingData['affiliate_id'] ?? null,
                'booking_date' => $bookingData['booking_date'],
                'booking_time' => $bookingData['booking_time'],
            ];

            $createdData = $this->demoBookingRepository->createDemoBooking($transformedData);
            $booking = $this->demoBookingRepository->getDemoBookingById($createdData['demo_id']);

            // Send email notification to admin and get the status
            $emailSent = $this->sendDemoBookingEmail($bookingData, $createdData['demo_id']);

            return [
                'success' => true,
                'message' => 'Demo booking created successfully' . ($emailSent ? '' : ' (but email notification failed)'),
                'data' => $booking,
                'email_sent' => $emailSent, // Add this line to return email status
                'status_code' => 201
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Demo booking creation failed: ' . $e->getMessage(),
                'data' => null,
                'email_sent' => false,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }


    public function updateDemoBooking(int $demoId, array $bookingData): array
    {
        try {
            $updatedData = $this->demoBookingRepository->updateDemoBooking($demoId, $bookingData);
            $booking = $this->demoBookingRepository->getDemoBookingById($demoId);

            return [
                'success' => true,
                'message' => 'Demo booking updated successfully',
                'data' => $booking,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Demo booking update failed: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function deleteDemoBooking(int $demoId): array
    {
        try {
            $deleted = $this->demoBookingRepository->deleteDemoBooking($demoId);

            return [
                'success' => true,
                'message' => 'Demo booking deleted successfully',
                'data' => null,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to delete demo booking: ' . $e->getMessage(),
                'data' => null,
                'status_code' => $this->getStatusCode($e)
            ];
        }
    }

    public function scheduleDemo(int $demoId, array $scheduleData): array
    {
        try {
            $updateData = [
                'scheduled_date' => $scheduleData['date'],
                'scheduled_time' => $scheduleData['time'],
                'teacher_id' => $scheduleData['teacher_id'] ?? null,
                'status' => 'Scheduled'
            ];

            return $this->updateDemoBooking($demoId, $updateData);

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to schedule demo: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    private function getStatusCode(Exception $e): int
    {
        if (str_contains($e->getMessage(), 'not found')) {
            return 404;
        }

        return 500;
    }

    public function calculateAndSetCommission(int $demoId): array
    {
        try {
            $booking = $this->demoBookingRepository->getDemoBookingById($demoId);
            
            if (!$booking) {
                throw new Exception('Demo booking not found');
            }

            $paymentRepository = new PaymentRepository();
            
            // Get affiliate details for debugging
            $affiliateDetails = $paymentRepository->getAffiliateDetails($booking->affiliate_id);
            
            \Log::info("Affiliate details for commission calculation", [
                'demo_id' => $demoId,
                'affiliate_id' => $booking->affiliate_id,
                'affiliate_details' => $affiliateDetails
            ]);

            $commissionAmount = $paymentRepository->calculateCommissionForBooking($demoId);

            // Only update if commission is greater than 0
            if ($commissionAmount > 0) {
                $updatedData = $this->demoBookingRepository->updateDemoBooking($demoId, [
                    'commission_amount' => $commissionAmount
                ]);

                $booking = $this->demoBookingRepository->getDemoBookingById($demoId);

                return [
                    'success' => true,
                    'message' => "Commission calculated successfully: ₹{$commissionAmount}",
                    'data' => $booking,
                    'commission_amount' => $commissionAmount,
                    'affiliate_details' => $affiliateDetails,
                    'status_code' => 200
                ];
            } else {
                return [
                    'success' => true,
                    'message' => 'No commission applicable for this booking',
                    'data' => $booking,
                    'commission_amount' => 0,
                    'affiliate_details' => $affiliateDetails,
                    'status_code' => 200
                ];
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to calculate commission: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    public function processPayment(int $demoId, array $paymentData): array
    {
        try {
            $booking = $this->demoBookingRepository->getDemoBookingById($demoId);
            
            if (!$booking) {
                throw new Exception('Demo booking not found');
            }

            // Check if commission exists, if not calculate it
            if (!$booking->commission_amount || $booking->commission_amount <= 0) {
                $commissionResult = $this->calculateAndSetCommission($demoId);
                if (!$commissionResult['success']) {
                    throw new Exception('Failed to calculate commission: ' . $commissionResult['message']);
                }
                
                // Refresh booking data
                $booking = $this->demoBookingRepository->getDemoBookingById($demoId);
            }

            if (!$booking->commission_amount || $booking->commission_amount <= 0) {
                throw new Exception('No commission to pay for this booking');
            }

            // Create payment record
            $paymentRepository = new PaymentRepository();
            $paymentResult = $paymentRepository->createPayment([
                'demo_booking_id' => $demoId,
                'affiliate_id' => $booking->affiliate_id,
                'paid_on' => $paymentData['paid_on'],
                'amount' => $booking->commission_amount,
                'mode' => $paymentData['mode'],
                'description' => $paymentData['description'] ?? "Commission payment for demo booking #{$demoId}"
            ]);

            // Update demo booking with payment reference
            $paymentRepository->updateDemoBookingPayment($demoId, $paymentResult['payment_id']);

            $booking = $this->demoBookingRepository->getDemoBookingById($demoId);

            return [
                'success' => true,
                'message' => "Payment of ₹{$booking->commission_amount} processed successfully",
                'data' => $booking,
                'status_code' => 200
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ];
        }
    }

    /**
     * Send demo booking email notification
     */
       private function sendDemoBookingEmail(array $bookingData, int $demoId): bool
    {
        try {
            // Get course details for email
            $course = \DB::table('courses')
                        ->where('course_id', $bookingData['course_id'])
                        ->first();

            if (!$course) {
                Log::warning('Course not found for email notification', [
                    'demo_id' => $demoId,
                    'course_id' => $bookingData['course_id']
                ]);
                return false;
            }

            // Send email notification to admin
            Mail::to('mohammedubare7@gmail.com')
                ->send(new DemoBookingNotification($bookingData, $course));
            
            // Check if email was actually sent
            if (Mail::failures()) {
                Log::error('Failed to send demo booking email - Mail failures', [
                    'demo_id' => $demoId,
                    'student_email' => $bookingData['student_email'],
                    'admin_email' => 'mohammedubare7@gmail.com',
                    'failures' => Mail::failures()
                ]);
                return false;
            }
            
            Log::info('Demo booking email sent successfully', [
                'demo_id' => $demoId,
                'student_email' => $bookingData['student_email'],
                'admin_email' => 'mohammedubare7@gmail.com'
            ]);
            
            return true;
            
        } catch (Exception $emailError) {
            Log::error('Failed to send demo booking email: ' . $emailError->getMessage(), [
                'demo_id' => $demoId,
                'error_message' => $emailError->getMessage(),
                'trace' => $emailError->getTraceAsString()
            ]);
            return false;
        }
    }
}