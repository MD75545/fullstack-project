<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $primaryKey = 'question_id';
    protected $fillable = [
        'test_id',
        'text',
        'options',
        'correct_option_id'
    ];

    protected $casts = [
        'options' => 'array'
    ];

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }
}