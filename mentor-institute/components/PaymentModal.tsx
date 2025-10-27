import React, { useState } from 'react';
import type { DemoBooking } from '../types';

interface PaymentModalProps {
  booking: DemoBooking;
  onClose: () => void;
  onConfirm: (bookingId: number, paymentDetails: { mode: string; description?: string, paidOn: string, paidAmount: number }) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ booking, onClose, onConfirm }) => {
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<string>(String(booking.commissionAmount || ''));
    const [paidOn, setPaidOn] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState('');
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const numValue = Number(value);
        if (booking.commissionAmount && numValue > booking.commissionAmount) {
            setError(`Amount cannot exceed ₹${booking.commissionAmount.toLocaleString('en-IN')}`);
        } else {
            setError('');
        }
        setAmount(value);
    };

    const handleSubmit = () => {
        const paidAmount = Number(amount);
        if (!amount || isNaN(paidAmount) || paidAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (booking.commissionAmount && paidAmount > booking.commissionAmount) {
            setError(`Amount cannot exceed ₹${booking.commissionAmount.toLocaleString('en-IN')}`);
            return;
        }
        setError('');
        onConfirm(booking.id, { mode: paymentMode, description, paidOn, paidAmount });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 id="payment-modal-title" className="text-xl font-bold text-brand-navy">Confirm Commission Payment</h2>
                     <button onClick={onClose} className="text-gray-500 hover:text-gray-800" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="space-y-2 mb-6 text-sm text-gray-700 bg-gray-50 p-4 rounded-md border">
                    <p><strong>Student:</strong> {booking.studentName}</p>
                    <p><strong>Calculated Commission:</strong> <span className="font-bold text-gray-800">₹{booking.commissionAmount?.toLocaleString('en-IN')}</span></p>
                </div>

                <div className="space-y-4">
                     <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Payment Amount (INR)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={handleAmountChange}
                            max={booking.commissionAmount}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="paidOn" className="block text-sm font-medium text-gray-700">Payment Date</label>
                        <input
                            type="date"
                            id="paidOn"
                            value={paidOn}
                            onChange={(e) => setPaidOn(e.target.value)}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
                        <select id="paymentMode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm">
                            <option>UPI</option>
                            <option>Bank Transfer</option>
                            <option>Cash</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" placeholder="e.g., July Payout"></textarea>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
                
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Confirm Payment</button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;