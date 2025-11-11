<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to_teacher_id' => 'required|integer|exists:users,user_id',
            'due_date' => 'required|date',
            'status' => 'required|in:Pending,In Progress,Completed',
            'priority' => 'required|in:High,Medium,Low',
        ];
    }

    public function messages(): array
    {
        return [
            'assigned_to_teacher_id.required' => 'Teacher assignment is required',
            'assigned_to_teacher_id.exists' => 'Selected teacher does not exist',
        ];
    }
}