<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class UserRepository
{
    public function createUserWithDetails(array $userData): array
    {
        try {
            DB::beginTransaction();

            // Check existing records
            if ($this->checkEmailExists($userData['email'])) {
                throw new Exception('Email already exists');
            }

            if ($this->checkMobileExists($userData['mobile'])) {
                throw new Exception('Mobile number already exists');
            }

            // Determine role based on the source and data
            $role = $this->determineUserRole($userData);

            // Generate common affiliate ID if needed
            $commonAffiliateId = $this->generateAffiliateId($userData, $role);

            // Insert into users table
            $userId = DB::table('users')->insertGetId([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'mobile' => $userData['mobile'],
                'password_hash' => Hash::make($userData['password']),
                'role' => $role,
                'city' => $userData['city'] ?? null,
                'address' => $userData['address'] ?? null,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            if (!$userId) {
                throw new Exception('Failed to create user');
            }

            $result = [
                'user_id' => $userId,
                'common_affiliate_id' => $commonAffiliateId
            ];

            // Handle Teacher registration
            if ($this->shouldCreateTeacher($userData, $role)) {
                $this->createTeacherRecord($userId, $commonAffiliateId, $userData);
                $result['teacher_created'] = true;
            }

            // Handle Partner registration
            if ($this->shouldCreatePartner($userData, $role)) {
                $this->createPartnerRecord($userId, $commonAffiliateId, $userData);
                $result['partner_created'] = true;
            }

            DB::commit();
            return $result;

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateUserWithDetails(int $userId, array $userData): array
    {
        try {
            DB::beginTransaction();

            $user = DB::table('users')->where('user_id', $userId)->first();
            if (!$user) {
                throw new Exception('User not found');
            }

            $result = [];

            // Determine new role based on affiliate checkbox
            $newRole = $this->determineUpdateRole($userData, $user->role);
            
            // Update user basic info
            $updateData = [
                'name' => $userData['name'],
                'email' => $userData['email'],
                'mobile' => $userData['mobile'],
                'city' => $userData['city'] ?? $user->city,
                'address' => $userData['address'] ?? $user->address,
                'role' => $newRole, // Always update role based on checkbox
                'updated_at' => now()
            ];

            DB::table('users')->where('user_id', $userId)->update($updateData);

            // Handle Teacher updates (teacher should always exist when editing)
            $teacherExists = DB::table('teachers')->where('user_id', $userId)->exists();
            
            if ($teacherExists) {
                $this->handleTeacherUpdate($userId, $userData);
                $result['teacher_updated'] = true;
            }

            // Handle Partner updates - KEY LOGIC FOR CHECKBOX
            $partnerExists = DB::table('partners')->where('user_id', $userId)->exists();
            $shouldBePartner = $this->shouldCreatePartner($userData, $newRole);

            if ($shouldBePartner) {
                // Create or update partner record
                $this->handlePartnerUpdate($userId, $userData, $partnerExists);
                $result['partner_updated'] = true;
            } elseif ($partnerExists && !$shouldBePartner) {
                // ✅ PARTNER REMOVAL LOGIC - When checkbox is unchecked
                DB::table('partners')->where('user_id', $userId)->delete();
                $result['partner_removed'] = true;
                
                // Also remove affiliate_id from teacher record
                DB::table('teachers')
                    ->where('user_id', $userId)
                    ->update(['affiliate_id' => null]);
            }

            DB::commit();
            return array_merge($result, ['user_id' => $userId]);

        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function determineUserRole(array $userData): string
    {
        // For Join Us form
        if (isset($userData['join_as'])) {
            return $this->mapRoleToDatabase($userData['join_as']);
        }
        
        // For admin adding teacher (default to teacher)
        if (isset($userData['is_affiliate']) && $userData['is_affiliate']) {
            return 'both';
        }
        
        // Default for admin adding teacher
        return 'teacher';
    }

    private function determineUpdateRole(array $userData, string $currentRole): string
    {
        // Check if affiliate checkbox is present
        if (isset($userData['is_affiliate'])) {
            return $userData['is_affiliate'] ? 'both' : 'teacher';
        }
        
        return $currentRole;
    }

   private function generateAffiliateId(array $userData = [], string $role = ''): string
{
    // If no parameters provided, generate a simple affiliate ID
    if (empty($userData) && empty($role)) {
        return 'AFF' . strtoupper(uniqid());
    }
    
    // Original logic for create operations
    if ($this->shouldCreatePartner($userData, $role)) {
        return 'AFF' . strtoupper(uniqid());
    }
    
    return 'AFF' . strtoupper(uniqid()); // Fallback
}

   

    private function shouldCreateTeacher(array $userData, string $role): bool
    {
        return in_array($role, ['teacher', 'both']) || 
               (isset($userData['specialization']) && !empty($userData['specialization']));
    }

    private function shouldCreatePartner(array $userData, string $role): bool
    {
        return in_array($role, ['partner', 'both']) || 
               (isset($userData['is_affiliate']) && $userData['is_affiliate']) ||
               (isset($userData['join_as']) && in_array($userData['join_as'], ['Affiliate', 'Both']));
    }

    private function handleTeacherUpdate(int $userId, array $userData): void
    {
        $teacherData = [
            'specialization' => $userData['specialization'],
            'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
        ];

        // Only set affiliate_id if user is also a partner
        if (isset($userData['is_affiliate']) && $userData['is_affiliate'] && isset($userData['affiliateId'])) {
            $teacherData['affiliate_id'] = $userData['affiliateId'];
        }

        DB::table('teachers')
            ->where('user_id', $userId)
            ->update($teacherData);
    }

    private function handlePartnerUpdate(int $userId, array $userData, bool $partnerExists): void
{
    // Use the updated method without parameters
    $affiliateId = $userData['affiliateId'] ?? $this->generateAffiliateId();
    
    $partnerData = [
        'affiliate_id' => $affiliateId,
        'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
        'partner_type' => 'Individual' // Default for teachers who become affiliates
    ];

    if ($partnerExists) {
        DB::table('partners')
            ->where('user_id', $userId)
            ->update($partnerData);
    } else {
        $partnerData['user_id'] = $userId;
        DB::table('partners')->insert($partnerData);
    }

    // Also update teacher's affiliate_id to keep them in sync
    DB::table('teachers')
        ->where('user_id', $userId)
        ->update(['affiliate_id' => $affiliateId]);
}

    // This method is kept for backward compatibility with create operations
    private function handleTeacherUpdateOld(int $userId, array $userData, bool $teacherExists): string
    {
        $affiliateId = $userData['affiliateId'] ?? null;
        
        if (!$affiliateId) {
            $affiliateId = 'AFF' . strtoupper(uniqid());
        }

        $teacherData = [
            'specialization' => $userData['specialization'],
            'affiliate_id' => $affiliateId,
            'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
        ];

        if ($teacherExists) {
            DB::table('teachers')
                ->where('user_id', $userId)
                ->update($teacherData);
        } else {
            $teacherData['user_id'] = $userId;
            DB::table('teachers')->insert($teacherData);
        }

        return $affiliateId;
    }

    // This method is kept for backward compatibility with create operations
    private function handlePartnerUpdateOld(int $userId, string $affiliateId, array $userData, bool $partnerExists): void
    {
        $partnerData = [
            'affiliate_id' => $affiliateId,
            'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
            'partner_type' => 'Individual' // Default for teachers who become affiliates
        ];

        if ($partnerExists) {
            DB::table('partners')
                ->where('user_id', $userId)
                ->update($partnerData);
        } else {
            $partnerData['user_id'] = $userId;
            DB::table('partners')->insert($partnerData);
        }
    }

    private function mapRoleToDatabase(string $joinAs): string
    {
        $roleMapping = [
            'Teacher' => 'teacher',
            'Affiliate' => 'partner', 
            'Both' => 'both',
            'teacher' => 'teacher',
            'partner' => 'partner',
            'both' => 'both',
        ];

        return $roleMapping[$joinAs] ?? 'teacher';
    }

    private function createTeacherRecord(int $userId, ?string $affiliateId, array $userData): void
    {
        $teacherData = [
            'user_id' => $userId,
            'specialization' => $userData['specialization'],
            'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
        ];

        if ($affiliateId) {
            $teacherData['affiliate_id'] = $affiliateId;
        }

        $teacherInserted = DB::table('teachers')->insert($teacherData);

        if (!$teacherInserted) {
            throw new Exception('Failed to create teacher record');
        }
    }

    private function createPartnerRecord(int $userId, string $affiliateId, array $userData): void
    {
        $partnerData = [
            'user_id' => $userId,
            'affiliate_id' => $affiliateId,
            'commission_percentage' => $userData['commissionPercentage'] ?? 10.00,
            'partner_type' => $userData['affiliate_type'] ?? 'Individual'
        ];

        // Add firm_name only for Institute type
        if (($userData['affiliate_type'] ?? '') === 'Institute') {
            $partnerData['firm_name'] = $userData['firm_name'];
        }

        $partnerInserted = DB::table('partners')->insert($partnerData);

        if (!$partnerInserted) {
            throw new Exception('Failed to create partner record');
        }
    }

    public function checkEmailExists(string $email): bool
    {
        return DB::table('users')->where('email', $email)->exists();
    }

    public function checkMobileExists(string $mobile): bool
    {
        return DB::table('users')->where('mobile', $mobile)->exists();
    }

    public function getUserWithDetails(int $userId): ?object
    {
        return DB::table('users')
            ->leftJoin('teachers', 'users.user_id', '=', 'teachers.user_id')
            ->leftJoin('partners', 'users.user_id', '=', 'partners.user_id')
            ->where('users.user_id', $userId)
            ->select(
                'users.user_id',
                'users.name',
                'users.email',
                'users.mobile',
                'users.role as join_as',
                'users.city',
                'users.address',
                'users.created_at',
                'teachers.specialization',
                'teachers.affiliate_id as teacher_affiliate_id',
                'partners.affiliate_id as partner_affiliate_id',
                'partners.partner_type as affiliate_type',
                'partners.firm_name'
            )
            ->first();
    }
}