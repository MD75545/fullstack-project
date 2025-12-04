<?php

namespace App\Http\Controllers;

use App\Repositories\TestRepository;
use App\Repositories\PaymentRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Razorpay\Api\Api;
use Exception;

class PaymentController extends Controller
{
    protected Api $razorpay;
    protected TestRepository $testRepository;
    protected PaymentRepository $paymentRepository;

    public function __construct(
        TestRepository $testRepository,
        PaymentRepository $paymentRepository
    ) {
        // Initialize Razorpay with environment variables
        $this->razorpay = new Api(
            env('RAZORPAY_KEY_ID'),
            env('RAZORPAY_KEY_SECRET')
        );
        $this->testRepository = $testRepository;
        $this->paymentRepository = $paymentRepository;
    }

    /**
     * Create payment order for contest registration
     */
    public function createContestPaymentOrder(Request $request, int $contestId): JsonResponse
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|integer|exists:users,user_id',
            ]);

            $userId = $validated['user_id'];

            // Get contest details
            $contest = $this->testRepository->getContestById($contestId);
            if (!$contest) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contest not found',
                    'data' => null
                ], 404);
            }

            if ($contest->entry_fee <= 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This contest has no entry fee',
                    'data' => null
                ], 400);
            }

            // Check if contest is upcoming
            if ($contest->status !== 'upcoming') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contest registration is closed',
                    'data' => null
                ], 400);
            }

            // Check if user already registered
            $existingRegistration = $this->testRepository->checkUserContestRegistration($userId, $contestId);
            if ($existingRegistration) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Already registered for this contest',
                    'data' => null
                ], 400);
            }

            // Check if minimum participants requirement is met
            $participantCount = $contest->current_participants ?? 0;
            $minParticipants = $contest->min_participants ?? 0;
            
            if ($participantCount >= $minParticipants && $minParticipants > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Contest has reached maximum participants',
                    'data' => null
                ], 400);
            }

            // Create Razorpay order
            $order = $this->razorpay->order->create([
                'amount' => $contest->entry_fee * 100, // Convert to paise
                'currency' => 'INR',
                'receipt' => 'contest_' . $contestId . '_' . $userId . '_' . time(),
                'notes' => [
                    'contest_id' => $contestId,
                    'user_id' => $userId,
                    'contest_name' => $contest->name,
                    'type' => 'contest_entry'
                ],
                'payment_capture' => 1 // Auto capture payment
            ]);

            // Create payment record in database
            $paymentData = [
                'user_id' => $userId,
                'test_id' => $contestId,
                'demo_id' => null,
                'affiliate_id' => null,
                'paid_on' => now()->toDateString(),
                'amount' => $contest->entry_fee,
                'mode' => 'online',
                'payment_type' => 'contest_entry',
                'razorpay_order_id' => $order->id,
                'status' => 'pending',
                'description' => 'Contest entry fee for ' . $contest->name
            ];

            $paymentId = $this->paymentRepository->createPayment($paymentData);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment order created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'amount' => $contest->entry_fee,
                    'currency' => 'INR',
                    'key_id' => env('RAZORPAY_KEY_ID'),
                    'contest_id' => $contestId,
                    'contest_name' => $contest->name,
                    'payment_id' => $paymentId,
                    'user_id' => $userId,
                    'notes' => [
                        'contest_name' => $contest->name
                    ]
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Create payment order error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create payment order: ' . $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    /**
     * Verify payment and update registration
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'razorpay_order_id' => 'required|string',
                'razorpay_payment_id' => 'required|string',
                'razorpay_signature' => 'required|string',
                'payment_id' => 'required|integer|exists:payments,payment_id',
            ]);

            $attributes = [
                'razorpay_order_id' => $validated['razorpay_order_id'],
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature']
            ];

            // Verify payment signature
            $this->razorpay->utility->verifyPaymentSignature($attributes);

            // Update payment status
            $this->paymentRepository->updatePayment($validated['payment_id'], [
                'razorpay_payment_id' => $validated['razorpay_payment_id'],
                'razorpay_signature' => $validated['razorpay_signature'],
                'status' => 'completed',
                'updated_at' => now()
            ]);

            // Get payment details
            $paymentDetails = $this->paymentRepository->getPaymentById($validated['payment_id']);

            $registrationId = null;
            if ($paymentDetails && $paymentDetails->test_id) {
                // Check if registration already exists
                $existingRegistration = $this->paymentRepository->getContestRegistrationByPaymentId($validated['payment_id']);

                if (!$existingRegistration) {
                    // Check if user already registered for this contest
                    $userRegistration = $this->paymentRepository->getContestRegistrationByUserAndTest(
                        $paymentDetails->user_id,
                        $paymentDetails->test_id
                    );

                    if ($userRegistration) {
                        // Update existing registration with payment_id
                        $registrationId = $userRegistration->registration_id;
                        $this->paymentRepository->updateContestRegistration($registrationId, [
                            'payment_id' => $validated['payment_id'],
                            'status' => 'registered'
                        ]);
                    } else {
                        // Create new contest registration
                        $registrationId = $this->paymentRepository->createContestRegistration([
                            'user_id' => $paymentDetails->user_id,
                            'test_id' => $paymentDetails->test_id,
                            'payment_id' => $validated['payment_id'],
                            'status' => 'registered'
                        ]);
                    }

                    // Update participant count
                    $this->testRepository->updateContestParticipants($paymentDetails->test_id);
                } else {
                    $registrationId = $existingRegistration->registration_id;
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Payment verified successfully',
                'data' => [
                    'payment_id' => $validated['payment_id'],
                    'registration_id' => $registrationId,
                    'contest_id' => $paymentDetails->test_id ?? null,
                    'status' => 'completed'
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Verify payment error: ' . $e->getMessage());

            // Update payment as failed
            if (isset($validated['payment_id'])) {
                $this->paymentRepository->updatePayment($validated['payment_id'], [
                    'status' => 'failed',
                    'updated_at' => now()
                ]);
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Payment verification failed: ' . $e->getMessage(),
                'data' => null
            ], 400);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(int $paymentId): JsonResponse
    {
        try {
            $payment = $this->paymentRepository->getPaymentById($paymentId);

            if (!$payment) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Payment not found',
                    'data' => null
                ], 404);
            }

            // Check if contest registration exists
            $registration = null;
            if ($payment->test_id) {
                $registration = $this->paymentRepository->getContestRegistrationByPaymentId($paymentId);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Payment status retrieved',
                'data' => [
                    'payment_id' => $payment->payment_id,
                    'status' => $payment->status,
                    'amount' => $payment->amount,
                    'contest_id' => $payment->test_id,
                    'razorpay_order_id' => $payment->razorpay_order_id,
                    'razorpay_payment_id' => $payment->razorpay_payment_id,
                    'created_at' => $payment->created_at,
                    'registration' => $registration
                ]
            ]);

        } catch (Exception $e) {
            Log::error('Get payment status error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get payment status',
                'data' => null
            ], 500);
        }
    }

    /**
     * Get user's payment history
     */
    public function getUserPayments(int $userId): JsonResponse
    {
        try {
            $payments = $this->paymentRepository->getUserPayments($userId);

            return response()->json([
                'status' => 'success',
                'message' => 'User payments retrieved successfully',
                'data' => $payments
            ]);

        } catch (Exception $e) {
            Log::error('Get user payments error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get user payments',
                'data' => []
            ], 500);
        }
    }
}