import React, { useState, useMemo } from 'react';
import { demoBookings, users, courses } from '../../data/mockData';
import type { DemoBooking, Partner, Teacher, Student } from '../../types';
import PaymentModal from '../../components/PaymentModal';
import { useSearch } from '../../context/SearchContext';

// Schedule Modal Component (defined in-file to avoid creating new files)
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
    
    const teachers = users.filter(u => u.role === 'teacher') as Teacher[];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setScheduleData(prev => ({...prev, [name]: value}));
    }

    const handleSubmit = () => {
        onSave(booking.id, {
            date: scheduleData.date,
            time: scheduleData.time,
            teacherId: Number(scheduleData.teacherId) || undefined
        });
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-xl font-bold text-brand-navy mb-4">Schedule Demo</h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Demo Date</label>
                        <input type="date" name="date" id="date" value={scheduleData.date} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700">Demo Time</label>
                        <input type="time" name="time" id="time" value={scheduleData.time} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">Assign Teacher</label>
                        <select name="teacherId" id="teacherId" value={scheduleData.teacherId || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                            <option value="">Select a teacher...</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization})</option>)}
                        </select>
                    </div>
                </div>
                 <div className="mt-6 flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-brand-purple text-white rounded-md">Confirm & Schedule</button>
                </div>
            </div>
        </div>
    );
};


const ManageDemos: React.FC = () => {
    const [bookings, setBookings] = useState<DemoBooking[]>(demoBookings);
    const [paymentModalState, setPaymentModalState] = useState<{ isOpen: boolean; booking: DemoBooking | null }>({ isOpen: false, booking: null });
    const [scheduleModalState, setScheduleModalState] = useState<{ isOpen: boolean; booking: DemoBooking | null }>({ isOpen: false, booking: null });
    const { searchQuery } = useSearch();
    
    const allStatuses: DemoBooking['status'][] = ['Scheduled', 'Conducted', 'Postponed', 'Cancelled', 'Student Admitted'];

    const getCourseName = (courseId: number) => courses.find(c => c.id === courseId)?.title || 'Unknown';
    const getTeacherName = (teacherId?: number) => users.find(u => u.id === teacherId)?.name || 'N/A';
    
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
    }, [bookings, searchQuery]);

    const handleStatusChange = (bookingId: number, newStatus: DemoBooking['status']) => {
        const bookingIndex = demoBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex > -1) {
            const booking = demoBookings[bookingIndex];
            booking.status = newStatus;

            if (newStatus === 'Student Admitted') {
                const studentExists = users.some(u => u.email === booking.studentEmail && u.role === 'student');

                if (!studentExists) {
                    const newStudent: Student = {
                        id: Date.now(),
                        name: booking.studentName,
                        email: booking.studentEmail,
                        mobile: booking.studentMobile,
                        password: 'password', 
                        role: 'student',
                        courseId: booking.courseId,
                        teacherId: booking.teacherId, 
                        referredBy: booking.referredByAffiliateId,
                        displayName: 'real_name',
                    };
                    users.push(newStudent);
                }
            }

            if (newStatus === 'Student Admitted' && booking.referredByAffiliateId) {
                const affiliate = users.find(u => 'affiliateId' in u && u.affiliateId === booking.referredByAffiliateId) as Partner | Teacher | undefined;
                const course = courses.find(c => c.id === booking.courseId);
                if (affiliate && 'commissionPercentage' in affiliate && affiliate.commissionPercentage && course) {
                    booking.commissionAmount = course.price * (affiliate.commissionPercentage / 100);
                }
            }
            setBookings([...demoBookings]);
        }
    };

    const handleConfirmPayment = (bookingId: number, paymentData: { mode: string; description?: string; paidOn: string; paidAmount: number }) => {
        const bookingIndex = demoBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex > -1) {
            demoBookings[bookingIndex] = { ...demoBookings[bookingIndex], commissionPaid: true, paymentDetails: paymentData };
            setBookings([...demoBookings]);
        }
        setPaymentModalState({ isOpen: false, booking: null });
    };

    const handleScheduleSave = (bookingId: number, scheduleData: { date: string, time: string, teacherId?: number }) => {
        const bookingIndex = demoBookings.findIndex(b => b.id === bookingId);
        if (bookingIndex > -1) {
            demoBookings[bookingIndex] = {
                ...demoBookings[bookingIndex],
                status: 'Scheduled',
                scheduledDate: scheduleData.date,
                scheduledTime: scheduleData.time,
                teacherId: scheduleData.teacherId,
                studentNotified: false, 
            };
            setBookings([...demoBookings]);
        }
        setScheduleModalState({ isOpen: false, booking: null });
    };
    
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
                                            booking.commissionPaid && booking.paymentDetails ? (
                                                <div title={`Paid on ${booking.paymentDetails.paidOn}`}>
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
                                            <button onClick={() => setScheduleModalState({ isOpen: true, booking })} className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700">
                                                Accept
                                            </button>
                                        )}
                                         {booking.status === 'Scheduled' && (
                                            <button onClick={() => setScheduleModalState({ isOpen: true, booking })} className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-md hover:bg-yellow-600">
                                                Reschedule
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        No demo bookings found matching your search.
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
