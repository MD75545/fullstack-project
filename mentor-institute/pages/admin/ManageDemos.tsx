import React, { useState, useEffect, useMemo } from 'react';
import type { DemoBooking, Partner, Teacher, Student, Course } from '../../types';
import PaymentModal from '../../components/PaymentModal';
import { useSearch } from '../../context/SearchContext';
import { 
    getDemoBookings, 
    updateDemoBooking, 
    scheduleDemo, 
    calculateCommission, 
    processPayment, 
    getCourses,
    getTeachers 
} from '../../services/api';
import { useNotifications } from '../../context/NotificationsContext';

// Schedule Modal Component
const ScheduleDemoModal: React.FC<{
    booking: DemoBooking;
    onClose: () => void;
    onSave: (bookingId: number, scheduleData: { date: string, time: string, teacherId?: number }) => void;
}> = ({ booking, onClose, onSave }) => {
    const [scheduleData, setScheduleData] = useState({
        date: booking.scheduledDate || booking.bookingDate,
        time: booking.scheduledTime || booking.bookingTime,
        teacherId: booking.teacherId,
    });
    
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [teachersLoading, setTeachersLoading] = useState(true);
    const [teachersError, setTeachersError] = useState<string | null>(null);

    // Fetch teachers from API
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setTeachersLoading(true);
                setTeachersError(null);
                const result = await getTeachers();
                console.log('Teachers API result:', result); 
                
                if (result.success === true || result.status === 'success') {
                    const teachersData = result.data || result.teachers || [];
                    console.log('Raw teachers data:', teachersData);
                    
                    if (teachersData.length > 0) {
                        // Transform API data - teachers are users with role 'teacher'
                        const transformedTeachers = teachersData
                            .filter((user: any) => user.role === 'teacher') // Filter only teachers
                            .map((user: any) => {
                                console.log('Teacher user data:', user);
                                
                                return {
                                    id: user.user_id || user.id, // This should be the user_id
                                    name: user.name || 'Unknown Teacher',
                                    email: user.email || '',
                                    mobile: user.mobile || '',
                                    role: 'teacher' as const,
                                    specialization: user.specialization || 'General',
                                    qualification: user.qualification || '',
                                    experience: user.experience || '',
                                    bio: user.bio || '',
                                    avatar: user.photo_url || user.avatar || '',
                                    affiliateId: user.affiliate_id || '',
                                    commissionPercentage: user.commission_percentage || 0,
                                    displayName: user.display_name || user.name
                                };
                            });
                        
                        console.log('Transformed teachers:', transformedTeachers);
                        setTeachers(transformedTeachers);
                        
                        if (transformedTeachers.length === 0) {
                            setTeachersError('No teachers found (users with teacher role)');
                        }
                    } else {
                        setTeachersError('No users with teacher role found');
                    }
                } else {
                    setTeachersError(result.message || 'Failed to fetch teachers');
                }
            } catch (error: any) {
                console.error('Failed to fetch teachers:', error);
                setTeachersError(error.message || 'Failed to fetch teachers');
            } finally {
                setTeachersLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setScheduleData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = () => {
        console.log('Submitting schedule data:', scheduleData);
        onSave(booking.id, {
            date: scheduleData.date,
            time: scheduleData.time,
            teacherId: scheduleData.teacherId ? parseInt(scheduleData.teacherId as string) : undefined
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold text-brand-navy mb-4">Schedule Demo</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Demo Date</label>
                        <input 
                            type="date" 
                            name="date" 
                            id="date" 
                            value={scheduleData.date} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Demo Time</label>
                        <input 
                            type="time" 
                            name="time" 
                            id="time" 
                            value={scheduleData.time} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent" 
                        />
                    </div>
                     <div>
                        <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Assign Teacher</label>
                        {teachersLoading ? (
                            <div className="mt-1 flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-purple"></div>
                                <span className="text-sm text-gray-500">Loading teachers...</span>
                            </div>
                        ) : teachersError ? (
                            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-sm text-red-600">{teachersError}</p>
                            </div>
                        ) : teachers.length === 0 ? (
                            <p className="mt-1 text-sm text-red-500">No teachers available. Please add teachers first.</p>
                        ) : (
                            <select 
                                name="teacherId" 
                                id="teacherId" 
                                value={scheduleData.teacherId || ''} 
                                onChange={handleChange} 
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                            >
                                <option value="">Select a teacher...</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name} 
                                        {teacher.specialization && teacher.specialization !== 'General' && ` (${teacher.specialization})`}
                                        {teacher.experience && ` - ${teacher.experience}`}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-4">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={!scheduleData.date || !scheduleData.time || teachersLoading}
                        className="px-4 py-2 bg-brand-purple text-white rounded-md hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Confirm & Schedule
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageDemos: React.FC = () => {
    const [bookings, setBookings] = useState<DemoBooking[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [teachersLoading, setTeachersLoading] = useState(true);
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; booking: DemoBooking | null }>({ isOpen: false, booking: null });
    const [scheduleModalState, setScheduleModalState] = useState<{ isOpen: boolean; booking: DemoBooking | null }>({ isOpen: false, booking: null });
    const { searchQuery } = useSearch();
    const { addNotification } = useNotifications();
    
    const allStatuses: DemoBooking['status'][] = ['Pending', 'Scheduled', 'Conducted', 'Postponed', 'Cancelled', 'Student Admitted'];

    // Fetch teachers from API for the main component
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                setTeachersLoading(true);
                const result = await getTeachers();
                console.log('Main component teachers result:', result);
                
                if (result.success === true || result.status === 'success') {
                    const teachersData = result.data || result.teachers || [];
                    if (teachersData.length > 0) {
                        const transformedTeachers = teachersData
                            .filter((user: any) => user.role === 'teacher')
                            .map((user: any) => ({
                                id: user.user_id || user.id,
                                name: user.name || 'Unknown Teacher',
                                email: user.email || '',
                                mobile: user.mobile || '',
                                role: 'teacher' as const,
                                specialization: user.specialization || 'General',
                                qualification: user.qualification || '',
                                experience: user.experience || '',
                                bio: user.bio || '',
                                avatar: user.photo_url || user.avatar || '',
                                affiliateId: user.affiliate_id || '',
                                commissionPercentage: user.commission_percentage || 0,
                                displayName: user.display_name || user.name
                            }));
                        setTeachers(transformedTeachers);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch teachers in main component:', error);
            } finally {
                setTeachersLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    // Fetch courses from API
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setCoursesLoading(true);
                const result = await getCourses();
                if (result.status === 'success') {
                    const transformedCourses = result.data.map((course: any) => ({
                        id: course.course_id,
                        title: course.title,
                        description: course.description,
                        duration: course.duration,
                        level: course.level,
                        image: course.image_url || '/default-course-image.jpg',
                        price: course.price,
                        icon: (
                            <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center text-white">
                                {course.title.charAt(0)}
                            </div>
                        )
                    }));
                    setCourses(transformedCourses);
                } else {
                    console.error('Failed to fetch courses:', result.message);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setCoursesLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const getCourseName = (courseId: number) => {
        const course = courses.find(c => c.id === courseId);
        return course ? course.title : 'Unknown';
    };

    const getTeacherName = (teacherId?: number) => {
        if (!teacherId) return 'N/A';
        const teacher = teachers.find(t => t.id === teacherId);
        return teacher ? teacher.name : 'Unknown Teacher';
    };
    
    // Fetch demo bookings on component mount
    useEffect(() => {
        fetchDemoBookings();
    }, []);

    const fetchDemoBookings = async () => {
        try {
            setLoading(true);
            const result = await getDemoBookings();
            if (result.status === 'success') {
                const transformedBookings = result.data.map((booking: any) => ({
                    id: booking.id,
                    studentName: booking.student_name,
                    studentEmail: booking.student_email,
                    studentMobile: booking.student_mobile,
                    courseId: booking.course_id,
                    referredByAffiliateId: booking.referredByAffiliateId,
                    bookingDate: booking.bookingDate,
                    bookingTime: booking.bookingTime,
                    status: booking.status,
                    scheduledDate: booking.scheduledDate,
                    scheduledTime: booking.scheduledTime,
                    teacherId: booking.teacher_id,
                    commissionAmount: booking.commissionAmount,
                    commissionPaid: booking.commissionPaid,
                    paymentDetailsId: booking.payment_details_id
                }));
                setBookings(transformedBookings);
            } else {
                addNotification('error', 'Failed to load demo bookings');
            }
        } catch (error) {
            console.error('Failed to fetch demo bookings:', error);
            addNotification('error', 'Failed to load demo bookings');
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = useMemo(() => {
        if (!searchQuery) {
            return bookings;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return bookings.filter(b => 
            b.studentName.toLowerCase().includes(lowercasedQuery) ||
            getCourseName(b.courseId).toLowerCase().includes(lowercasedQuery) ||
            (b.referredByAffiliateId && b.referredByAffiliateId.toLowerCase().includes(lowercasedQuery))
        );
    }, [bookings, searchQuery, courses]);

    const handleStatusChange = async (bookingId: number, newStatus: DemoBooking['status']) => {
        try {
            const result = await updateDemoBooking(bookingId, { status: newStatus });
            if (result.status === 'success') {
                setBookings(prev => prev.map(booking => 
                    booking.id === bookingId ? { ...booking, status: newStatus } : booking
                ));

                addNotification('success', `Status updated to ${newStatus}`);

                if (newStatus === 'Student Admitted') {
                    const booking = bookings.find(b => b.id === bookingId);
                    if (booking && booking.referredByAffiliateId) {
                        try {
                            const commissionResult = await calculateCommission(bookingId);
                            if (commissionResult.status === 'success') {
                                const commissionAmount = commissionResult.commission_amount || commissionResult.data?.commission_amount;
                                setBookings(prev => prev.map(b => 
                                    b.id === bookingId ? { 
                                        ...b, 
                                        commissionAmount: commissionAmount
                                    } : b
                                ));
                                
                                if (commissionAmount > 0) {
                                    addNotification('success', `Commission calculated: ₹${commissionAmount}`);
                                } else {
                                    addNotification('info', commissionResult.message || 'No commission applicable');
                                }
                            } else {
                                addNotification('warning', commissionResult.message || 'Commission calculation failed');
                            }
                        } catch (error) {
                            console.error('Failed to calculate commission:', error);
                            addNotification('error', 'Failed to calculate commission');
                        }
                    } else if (booking && !booking.referredByAffiliateId) {
                        addNotification('info', 'No affiliate referral - no commission applicable');
                    }
                }
            } else {
                addNotification('error', result.message || 'Failed to update status');
            }
        } catch (error: any) {
            console.error('Failed to update status:', error);
            addNotification('error', error.message || 'Failed to update status');
        }
    };

    const handleConfirmPayment = async (bookingId: number, paymentData: { mode: string; description?: string; paidOn: string; paidAmount: number }) => {
        try {
            const result = await processPayment(bookingId, paymentData);
            if (result.status === 'success') {
                setBookings(prev => prev.map(booking => 
                    booking.id === bookingId ? { 
                        ...booking, 
                        commissionPaid: true,
                        paymentDetails: paymentData
                    } : booking
                ));
                addNotification('success', 'Payment processed successfully');
            } else {
                addNotification('error', result.message || 'Failed to process payment');
            }
            setPaymentModalState({ isOpen: false, booking: null });
        } catch (error: any) {
            console.error('Failed to process payment:', error);
            addNotification('error', error.message || 'Failed to process payment');
            setPaymentModalState({ isOpen: false, booking: null });
        }
    };

    const handleScheduleSave = async (bookingId: number, scheduleData: { date: string, time: string, teacherId?: number }) => {
  try {
    console.log('Scheduling demo with data:', {
      bookingId,
      scheduleData,
      teacherId: scheduleData.teacherId,
    });

    const result = await scheduleDemo(bookingId, scheduleData);
    
    // ADD THESE DEBUG LINES HERE:
    console.log('=== DEBUG: Schedule API Response ===');
    console.log('FULL Schedule API response:', result);
    console.log('Response data:', result.data);
    console.log('Teacher ID in response:', result.data?.teacher_id);
    console.log('All keys in response data:', result.data ? Object.keys(result.data) : 'No data');
    console.log('=== END DEBUG ===');
    
    if (result.status === 'success') {
      // Use the data returned from the API to update local state
      const updatedBooking = result.data;
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { 
          ...booking, 
          status: 'Scheduled',
          scheduledDate: scheduleData.date,
          scheduledTime: scheduleData.time,
          teacherId: updatedBooking.teacher_id || scheduleData.teacherId
        } : booking
      ));
      
      console.log('Updated booking with teacher_id:', updatedBooking.teacher_id);
      addNotification('success', 'Demo scheduled successfully');
      setScheduleModalState({ isOpen: false, booking: null });
    } else {
      console.error('Schedule API error:', result);
      addNotification('error', result.message || 'Failed to schedule demo');
    }
  } catch (error: any) {
    console.error('Failed to schedule demo:', error);
    addNotification('error', error.message || 'Failed to schedule demo');
  }
};

    if (loading || coursesLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading demo bookings...</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Demo Bookings ({filteredBookings.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Student Details</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Referral</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Requested</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Scheduled Info</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Commission</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Payment</th>
                                <th className="py-3 px-4 border-b text-left text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        <div className="font-semibold">{booking.studentName}</div>
                                        <div className="text-xs text-gray-500">{getCourseName(booking.courseId)}</div>
                                        {booking.teacherId && (
                                            <div className="text-xs text-blue-500">Teacher ID: {booking.teacherId}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        {booking.referredByAffiliateId ? (
                                            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{booking.referredByAffiliateId}</span>
                                        ) : (
                                            <span className="text-xs font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Self</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200 text-sm">
                                        <div>{new Date(booking.bookingDate).toLocaleDateString()}</div>
                                        <div className="text-xs">{booking.bookingTime}</div>
                                    </td>
                                     <td className="py-3 px-4 border-b border-slate-200 text-sm">
                                        {booking.scheduledDate && (
                                            <div>
                                                <div>{new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}</div>
                                                <div className="text-xs text-gray-500">with {getTeacherName(booking.teacherId)}</div>
                                                {booking.teacherId && (
                                                    <div className="text-xs text-green-500">Teacher Assigned</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        {booking.status === 'Pending' ? (
                                             <span className={`px-2 py-1 text-xs rounded-full font-semibold bg-yellow-100 text-yellow-800`}>Pending</span>
                                        ) : (
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking.id, e.target.value as DemoBooking['status'])}
                                                className={`w-full text-xs rounded-md font-semibold border-2 p-1 focus:outline-none focus:ring-2 focus:ring-brand-purple ${
                                                    booking.status === 'Scheduled' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                                    booking.status === 'Student Admitted' ? 'bg-green-100 text-green-800 border-green-200' :
                                                    'bg-gray-100 text-gray-800 border-gray-200'
                                                }`}
                                            >
                                                {allStatuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200 font-semibold text-sm">
                                        {booking.commissionAmount ? `₹${booking.commissionAmount.toLocaleString('en-IN')}` : '-'}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200 text-xs">
                                        {booking.status === 'Student Admitted' && booking.commissionAmount ? (
                                            booking.commissionPaid ? (
                                                <div title={`Paid on ${booking.paymentDetails?.paidOn}`}>
                                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Paid</span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setPaymentModalState({ isOpen: true, booking })} 
                                                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                >
                                                    Pay Now
                                                </button>
                                            )
                                        ) : '-'}
                                    </td>
                                    <td className="py-3 px-4 border-b border-slate-200">
                                        {booking.status === 'Pending' && (
                                            <button 
                                                onClick={() => setScheduleModalState({ isOpen: true, booking })} 
                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                Accept
                                            </button>
                                        )}
                                         {booking.status === 'Scheduled' && (
                                            <button 
                                                onClick={() => setScheduleModalState({ isOpen: true, booking })} 
                                                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600 transition-colors"
                                            >
                                                Reschedule
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        {bookings.length === 0 ? 'No demo bookings found.' : 'No demo bookings matching your search.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {paymentModalState.isOpen && paymentModalState.booking && (
                <PaymentModal 
                    booking={paymentModalState.booking}
                    onClose={() => setPaymentModalState({ isOpen: false, booking: null })}
                    onConfirm={handleConfirmPayment}
                />
            )}
            {scheduleModalState.isOpen && scheduleModalState.booking && (
                <ScheduleDemoModal 
                    booking={scheduleModalState.booking}
                    onClose={() => setScheduleModalState({ isOpen: false, booking: null })}
                    onSave={handleScheduleSave}
                />
            )}
        </>
    );
};

export default ManageDemos;