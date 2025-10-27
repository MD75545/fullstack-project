<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'required|string|max:15|unique:users,mobile',
            'password' => 'required|string|min:8',
            'join_as' => 'required|in:Teacher,Affiliate,Both', // ← Changed to match frontend
            'city' => 'required|string|max:100',
            'address' => 'required|string',
        ];

        // Add rules based on join_as
        if (in_array($this->join_as, ['Teacher', 'Both'])) {
            $rules['specialization'] = 'required|string|max:255';
        }

        if (in_array($this->join_as, ['Affiliate', 'Both'])) {
            $rules['affiliate_type'] = 'required|in:Individual,Institute';
            
            if ($this->affiliate_type === 'Institute') {
                $rules['firm_name'] = 'required|string|max:255';
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'join_as.in' => 'Join as must be one of: Teacher, Affiliate, Both',
            'specialization.required' => 'Specialization is required when joining as Teacher or Both',
            'affiliate_type.required' => 'Affiliate type is required when joining as Affiliate or Both',
            'firm_name.required' => 'Firm name is required when affiliate type is Institute'
        ];
    }
}