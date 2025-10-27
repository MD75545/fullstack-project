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

            // Map join_as to valid database role
            $dbRole = $this->mapRoleToDatabase($userData['join_as']);

            // Generate common affiliate ID for both roles
            $commonAffiliateId = 'AFF' . strtoupper(uniqid());

            // Insert into users table
            $userId = DB::table('users')->insertGetId([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'mobile' => $userData['mobile'],
                'password_hash' => Hash::make($userData['password']),
                'role' => $dbRole, // Use valid database role
                'city' => $userData['city'],
                'address' => $userData['address'],
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

            // Handle Teacher registration - for both 'teacher' and 'both' roles
            if (in_array($userData['join_as'], ['Teacher', 'Both', 'teacher', 'both'])) {
                // Make sure specialization is provided
                if (empty($userData['specialization'])) {
                    throw new Exception('Specialization is required for teacher registration');
                }
                $this->createTeacherRecord($userId, $commonAffiliateId, $userData['specialization']);
                $result['teacher_created'] = true;
            }

            // Handle Partner registration - for both 'Affiliate' and 'Both' roles  
            if (in_array($userData['join_as'], ['Affiliate', 'Both', 'partner', 'both'])) {
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

    private function mapRoleToDatabase(string $joinAs): string
{
    $roleMapping = [
        'Teacher' => 'teacher',      // Maps to 'teacher'
        'Affiliate' => 'partner',    // Maps to 'partner'  
        'Both' => 'both',            // Now maps to valid 'both' role
        'teacher' => 'teacher',
        'partner' => 'partner',
        'both' => 'both',
    ];

    return $roleMapping[$joinAs] ?? 'teacher';
}
    private function createTeacherRecord(int $userId, string $affiliateId, string $specialization): void
    {
        $teacherInserted = DB::table('teachers')->insert([
            'user_id' => $userId,
            'specialization' => $specialization,
            'affiliate_id' => $affiliateId,
            'commission_percentage' => 10.00, // Set default commission
        ]);

        if (!$teacherInserted) {
            throw new Exception('Failed to create teacher record');
        }
    }
    private function createPartnerRecord(int $userId, string $affiliateId, array $userData): void
{
    $partnerData = [
        'user_id' => $userId,
        'affiliate_id' => $affiliateId,
        'commission_percentage' => 10.00,
        'partner_type' => $userData['affiliate_type']
    ];

    // Add firm_name only for Institute type
    if ($userData['affiliate_type'] === 'Institute') {
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