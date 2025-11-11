<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|integer|min:0',
            'duration' => 'required|string|max:50',
            'level' => 'required|string|in:Beginner to Advanced,Beginner,Intermediate,Advanced',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'image.image' => 'The file must be an image',
            'image.mimes' => 'The image must be a JPEG, PNG, JPG, or GIF',
            'image.max' => 'The image must not be larger than 2MB',
        ];
    }
}