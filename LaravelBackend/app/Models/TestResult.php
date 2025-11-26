<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TestResult extends Model
{
    use HasFactory;

    protected $primaryKey = 'test_result_id';
    protected $fillable = [
        'user_id',
        'test_id',
        'submitted_at',
        'score_obtained',
        'total_score',
        'answers',
        'rank'
    ];

    protected $casts = [
        'answers' => 'array',
        'submitted_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'test_id');
    }
}