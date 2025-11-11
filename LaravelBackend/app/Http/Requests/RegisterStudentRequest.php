<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'mobile' => 'required|string|max:15|unique:users,mobile',
            'password' => 'required|string|min:8',
            'city' => 'required|string|max:100',
            'address' => 'required|string',
            'course_id' => 'required|integer|exists:courses,course_id',
            'teacher_id' => 'nullable|integer|exists:users,user_id',
            'referred_by_affiliate_id' => 'nullable|string|exists:partners,affiliate_id',
            'display_name_preference' => 'nullable|in:real_name,nickname,anonymous',
            'gender' => 'nullable|in:male,female,other',
        ];
    }

    public function messages(): array
    {
        return [
            'course_id.required' => 'Course selection is required',
            'course_id.exists' => 'Selected course does not exist',
            'teacher_id.exists' => 'Selected teacher does not exist',
            'referred_by_affiliate_id.exists' => 'Selected affiliate does not exist',
        ];
    }
}