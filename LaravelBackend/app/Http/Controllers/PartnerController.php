<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PartnerController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            // Get all users with partner role and their partner details
            $partners = DB::table('users')
                ->leftJoin('partners', 'users.user_id', '=', 'partners.user_id')
                ->where('users.role', 'partner')
                ->orWhere('users.role', 'both') // Include users who are both teacher and partner
                ->select(
                    'users.user_id as user_id',
                    'users.name',
                    'users.email',
                    'users.mobile',
                    'users.role',
                    'users.city',
                    'users.address',
                    'users.created_at',
                    'partners.user_id as partner_user_id', // Use user_id from partners table
                    'partners.affiliate_id as affiliateId',
                    'partners.commission_percentage as commissionPercentage',
                    'partners.partner_type as partnerType',
                    'partners.firm_name as firmName'
                )
                ->get();

            // Transform the data to match frontend expectations
            $formattedPartners = $partners->map(function ($partner) {
                return [
                    'id' => $partner->user_id, // Use user_id as id for frontend
                    'user_id' => $partner->user_id,
                    'name' => $partner->name,
                    'email' => $partner->email,
                    'mobile' => $partner->mobile ?? '',
                    'role' => $partner->role,
                    'city' => $partner->city ?? '',
                    'address' => $partner->address ?? '',
                    'affiliateId' => $partner->affiliateId ?? '',
                    'commissionPercentage' => $partner->commissionPercentage ?? 10,
                    'partnerType' => $partner->partnerType ?? 'Individual',
                    'firmName' => $partner->firmName ?? '',
                    'created_at' => $partner->created_at,
                    'earnings' => ['total' => 0, 'daily' => 0] // Default earnings
                ];
            });

            return response()->json([
                'success' => true,
                'message' => 'Partners retrieved successfully',
                'data' => $formattedPartners,
                'status_code' => 200
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching partners: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve partners: ' . $e->getMessage(),
                'data' => null,
                'status_code' => 500
            ], 500);
        }
    }

    public function update(Request $request, $user_id): JsonResponse
    {
        Log::info('Partner Update Request:', [
            'user_id' => $user_id,
            'data' => $request->all()
        ]);

        DB::beginTransaction();

        try {
            // Find the partner by user_id
            $partner = Partner::where('user_id', $user_id)->first();
            
            if (!$partner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Partner not found'
                ], 404);
            }

            // Find the associated user using user_id
            $user = User::where('user_id', $user_id)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found for this partner'
                ], 404);
            }

            Log::info('Current Data:', [
                'partner' => $partner->toArray(),
                'user' => $user->toArray()
            ]);

            // Validate the request data
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:users,email,' . $user_id . ',user_id',
                'mobile' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:255',
                'address' => 'nullable|string',
                'affiliateId' => 'nullable|string|max:255',
                'commissionPercentage' => 'nullable|numeric|min:0|max:100',
                'partnerType' => 'sometimes|required|in:Individual,Institute',
                'firmName' => 'nullable|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();
            Log::info('Validated Data:', $validatedData);

            // Update user data (name, email, mobile, city, address)
            $userUpdateData = [];
            if (isset($validatedData['name'])) $userUpdateData['name'] = $validatedData['name'];
            if (isset($validatedData['email'])) $userUpdateData['email'] = $validatedData['email'];
            if (isset($validatedData['mobile'])) $userUpdateData['mobile'] = $validatedData['mobile'];
            if (isset($validatedData['city'])) $userUpdateData['city'] = $validatedData['city'];
            if (isset($validatedData['address'])) $userUpdateData['address'] = $validatedData['address'];

            if (!empty($userUpdateData)) {
                DB::table('users')
                    ->where('user_id', $user_id)
                    ->update($userUpdateData);
            }

            // Update partner-specific data
            $partnerUpdateData = [];
            if (isset($validatedData['affiliateId'])) $partnerUpdateData['affiliate_id'] = $validatedData['affiliateId'];
            if (isset($validatedData['commissionPercentage'])) $partnerUpdateData['commission_percentage'] = $validatedData['commissionPercentage'];
            if (isset($validatedData['partnerType'])) $partnerUpdateData['partner_type'] = $validatedData['partnerType'];
            
            // ✅ FIX: Handle firm_name properly when switching from Institute to Individual
            if (isset($validatedData['partnerType'])) {
                if ($validatedData['partnerType'] === 'Individual') {
                    $partnerUpdateData['firm_name'] = null; // Clear firm_name for Individual
                } elseif (isset($validatedData['firmName'])) {
                    $partnerUpdateData['firm_name'] = $validatedData['firmName'];
                }
            } elseif (isset($validatedData['firmName'])) {
                $partnerUpdateData['firm_name'] = $validatedData['firmName'];
            }

            if (!empty($partnerUpdateData)) {
                DB::table('partners')
                    ->where('user_id', $user_id)
                    ->update($partnerUpdateData);
            }

            DB::commit();

            // Get updated data
            $updatedUser = User::where('user_id', $user_id)->first();
            $updatedPartner = Partner::where('user_id', $user_id)->first();

            Log::info('Partner Updated Successfully:', [
                'user' => $updatedUser->toArray(),
                'partner' => $updatedPartner->toArray()
            ]);

            // Return combined data for frontend
            return response()->json([
                'success' => true,
                'message' => 'Partner updated successfully',
                'data' => [
                    'id' => $user_id, // Use user_id as id
                    'user_id' => $user_id,
                    'name' => $updatedUser->name,
                    'email' => $updatedUser->email,
                    'mobile' => $updatedUser->mobile,
                    'city' => $updatedUser->city,
                    'address' => $updatedUser->address,
                    'affiliateId' => $updatedPartner->affiliate_id,
                    'commissionPercentage' => $updatedPartner->commission_percentage,
                    'partnerType' => $updatedPartner->partner_type,
                    'firmName' => $updatedPartner->firm_name,
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validation Error:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Partner Update Error: ' . $e->getMessage());
            Log::error('Stack Trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update partner: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($user_id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $partner = Partner::where('user_id', $user_id)->first();
            
            if (!$partner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Partner not found'
                ], 404);
            }

            $user = User::where('user_id', $user_id)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found for this partner'
                ], 404);
            }

            // ✅ FIX: Check if user is also a teacher and handle accordingly
            $isAlsoTeacher = DB::table('teachers')->where('user_id', $user_id)->exists();
            
            if ($isAlsoTeacher) {
                // User is both teacher and partner - only remove partner role
                $this->handlePartnerRemovalFromBothUser($user_id, $user);
            } else {
                // User is only partner - delete completely
                $this->deletePartnerCompletely($user_id, $partner, $user);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $isAlsoTeacher ? 
                    'Partner role removed successfully (user remains as teacher)' : 
                    'Partner deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Delete Partner Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete partner: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle deletion when user is both teacher and partner
     * Only removes partner role, keeps user and teacher intact
     */
    private function handlePartnerRemovalFromBothUser(int $user_id, $user): void
    {
        // Delete partner record
        DB::table('partners')->where('user_id', $user_id)->delete();
        
        // Update user role from 'both' to 'teacher'
        if ($user->role === 'both') {
            DB::table('users')
                ->where('user_id', $user_id)
                ->update(['role' => 'teacher']);
        }
        
        Log::info('Partner role removed from user who is also teacher', ['user_id' => $user_id]);
    }

    /**
     * Handle complete deletion when user is only a partner
     */
    private function deletePartnerCompletely(int $user_id, $partner, $user): void
    {
        // Delete partner first
        $partner->delete();
        
        // Then delete user
        $user->delete();
        
        Log::info('Partner and user deleted completely', ['user_id' => $user_id]);
    }
}