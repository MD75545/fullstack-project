<!DOCTYPE html>
<html>
<head>
    <title>New Demo Booking</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .details { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Demo Booking Request</h1>
        </div>
        
        <div class="content">
            <h2>Student Details:</h2>
            <div class="details">
                <p><strong>Name:</strong> {{ $bookingData['student_name'] }}</p>
                <p><strong>Email:</strong> {{ $bookingData['student_email'] }}</p>
                <p><strong>Mobile:</strong> {{ $bookingData['student_mobile'] }}</p>
                <p><strong>Course:</strong> {{ $course->title }}</p>
                <p><strong>Preferred Date:</strong> {{ $bookingData['booking_date'] }}</p>
                <p><strong>Preferred Time:</strong> {{ $bookingData['booking_time'] }}</p>
                @if(isset($bookingData['city']))
                <p><strong>City:</strong> {{ $bookingData['city'] }}</p>
                @endif
                @if(isset($bookingData['qualification']))
                <p><strong>Qualification:</strong> {{ $bookingData['qualification'] }}</p>
                @endif
                @if(isset($bookingData['affiliate_id']))
                <p><strong>Referred by Affiliate:</strong> {{ $bookingData['affiliate_id'] }}</p>
                @endif
            </div>
            
            <p><strong>Booking Time:</strong> {{ now()->format('Y-m-d H:i:s') }}</p>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f4fd; border-radius: 5px;">
                <p><strong>Action Required:</strong> Please schedule this demo in the admin panel and contact the student for confirmation.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>This email was sent from Mentor Institute of Technologies</p>
            <p>© {{ date('Y') }} Mentor Institute. All rights reserved.</p>
        </div>
    </div>
</body>
</html>