import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    console.log(`Password reset link sent to ${email} (simulated).`);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-labelledby="forgot-password-title" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        
        {isSubmitted ? (
            <div className="text-center py-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-brand-navy" id="forgot-password-title">Check your email</h2>
                <p className="mt-2 text-gray-700">If an account with that email address exists, we have sent a password reset link.</p>
                <button onClick={onClose} className="mt-6 px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90 transition-colors">
                    Close
                </button>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-brand-navy mb-4" id="forgot-password-title">Reset Password</h2>
                <p className="text-gray-600 mb-6">Enter your email address and we will send you a link to reset your password.</p>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="space-y-4">
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input
                        type="email"
                        name="email"
                        id="reset-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm"
                        placeholder="you@example.com"
                        />
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>
                    <div>
                        <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple"
                        >
                        Send Reset Link
                        </button>
                    </div>
                    </div>
                </form>
            </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;