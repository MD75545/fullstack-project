<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $primaryKey = 'test_id';
    protected $fillable = [
        'name',
        'category_id',
        'type',
        'duration_minutes',
        'start_time',
        'entry_fee',
        'prize_money',
        'min_participants'
    ];

    public function category()
    {
        return $this->belongsTo(TestCategory::class, 'category_id');
    }

    public function questions()
    {
        return $this->hasMany(Question::class, 'test_id');
    }

    public function results()
    {
        return $this->hasMany(TestResult::class, 'test_id');
    }
}