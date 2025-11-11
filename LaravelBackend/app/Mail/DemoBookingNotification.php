<?php
// app/Mail/DemoBookingNotification.php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DemoBookingNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $bookingData;
    public $course;

    public function __construct($bookingData, $course)
    {
        $this->bookingData = $bookingData;
        $this->course = $course;
    }

    public function build()
    {
        return $this->subject('New Demo Booking - ' . $this->course->title)
                    ->view('emails.demo-booking-notification')
                    ->from('noreply@mentorinstitute.com', 'Mentor Institute')
                    ->replyTo($this->bookingData['student_email'], $this->bookingData['student_name']);
    }
}