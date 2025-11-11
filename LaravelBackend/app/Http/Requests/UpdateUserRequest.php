<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('userId');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId . ',user_id',
            'mobile' => 'required|string|max:15|unique:users,mobile,' . $userId . ',user_id',
            'city' => 'required|string|max:100',
            'address' => 'required|string',
            'is_affiliate' => 'boolean',
        ];

        // Add rules based on user type
        $rules['specialization'] = 'required|string|max:255';
        
        if ($this->is_affiliate) {
            $rules['affiliateId'] = 'sometimes|string|max:255';
            $rules['commissionPercentage'] = 'sometimes|numeric|min:0|max:100';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'specialization.required' => 'Specialization is required',
            'is_affiliate.boolean' => 'Is affiliate must be true or false',
        ];
    }
}