<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('userId');

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId . ',user_id',
            'mobile' => 'required|string|max:15|unique:users,mobile,' . $userId . ',user_id',
            'city' => 'required|string|max:100',
            'address' => 'required|string',
            'display_name_preference' => 'required|in:real_name,anonymous',
            'gender' => 'required|in:male,female,other',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            // Note: course_id, teacher_id, etc. are NOT included here
        ];
    }

    public function messages(): array
    {
        return [
            'display_name_preference.required' => 'Display name preference is required',
            'gender.required' => 'Gender selection is required',
        ];
    }
}