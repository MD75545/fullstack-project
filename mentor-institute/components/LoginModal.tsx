import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import SearchableDropdown from './SearchableDropdown';
import { indianDistricts } from '../data/indianDistricts';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
  showSignUp?: boolean;
}

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 1.274-4.057 5.064-7 9.542-7 .847 0 1.673.123 2.458.35M18.828 14.172a4 4 0 11-5.656-5.656M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
    </svg>
);

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess, showSignUp = false }) => {
    const [view, setView] = useState<'login' | 'signup' | 'signupSuccess'>('login');
    
    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
    
    // Signup state
    const [signupData, setSignupData] = useState({
        name: '',
        mobile: '',
        email: '',
        dob: '',
        gender: '',
        school: '',
        city: '',
        idCard: null as File | null,
        agreeTerms: false,
    });
    // Fix: Corrected the type for signupErrors state to allow string values for all properties.
    const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof typeof signupData, string>>>({});
    
    const { login } = useAuth();

   const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError('');
  
  try {
    console.log('LoginModal: Starting login process...');
    console.log('LoginModal: Email:', loginEmail);
    
    const success = await login(loginEmail, loginPassword);
    console.log('LoginModal: Login result:', success);
    
    if (success) {
      console.log('LoginModal: Login successful, calling onSuccess');
      onSuccess();
    } else {
      console.log('LoginModal: Login failed, showing error');
      setLoginError('Invalid email or password.');
    }
  } catch (error) {
    console.error('LoginModal: Login error:', error);
    setLoginError('Login failed. Please try again.');
  }
};
    
    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSignupData(prev => ({ ...prev, idCard: e.target.files![0] }));
        }
    };

    const validateSignup = () => {
        // Fix: Corrected the type for the local errors object.
        const errors: Partial<Record<keyof typeof signupData, string>> = {};
        if (!signupData.name.trim()) errors.name = "Name is required.";
        if (!signupData.mobile.trim()) errors.mobile = "Mobile number is required.";
        else if (!/^\d{10}$/.test(signupData.mobile)) errors.mobile = "Mobile must be 10 digits.";

        if (signupData.dob) {
            const today = new Date();
            const birthDate = new Date(signupData.dob);
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 18) {
                errors.dob = "You must be at least 18 years old.";
            }
        } else {
            // DOB is optional, but if empty, clear error
            delete errors.dob;
        }

        if (!signupData.agreeTerms) errors.agreeTerms = "You must agree to the terms.";

        setSignupErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateSignup()) {
            console.log("Signup form submitted (simulated):", signupData);
            setView('signupSuccess');
        }
    };
    
    const renderLoginView = () => (
        <>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to continue.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                    <label htmlFor="modal-email">Email</label>
                    <input id="modal-email" type="email" required className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" placeholder="Email address" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                </div>
                <div className="relative">
                    <label htmlFor="modal-password">Password</label>
                    <input id="modal-password" type={showPassword ? 'text' : 'password'} required className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-purple focus:border-brand-purple sm:text-sm" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                     <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                </div>
                {loginError && <div className="text-red-500 text-sm text-center">{loginError}</div>}
                <div className="flex items-center justify-between text-sm">
                    {showSignUp && (
                        <p className="text-gray-600">No account? <button type="button" onClick={() => setView('signup')} className="font-medium text-brand-purple">Sign up</button></p>
                    )}
                    <button type="button" onClick={() => setIsForgotPasswordModalOpen(true)} className="font-medium text-brand-purple hover:text-purple-700">Forgot password?</button>
                </div>
                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-purple">Sign in</button>
            </form>
        </>
    );
    
    const renderSignupView = () => (
        <>
            <h2 className="text-2xl font-bold text-brand-navy mb-4">Create Account</h2>
            <form onSubmit={handleSignupSubmit} className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="name">Full Name <span className="text-red-500">*</span></label>
                        <input id="name" name="name" type="text" required value={signupData.name} onChange={handleSignupChange} className="mt-1 w-full input-style" />
                        {signupErrors.name && <p className="text-red-500 text-xs">{signupErrors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></label>
                        <input id="mobile" name="mobile" type="tel" required value={signupData.mobile} onChange={handleSignupChange} className="mt-1 w-full input-style" />
                        {signupErrors.mobile && <p className="text-red-500 text-xs">{signupErrors.mobile}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input id="email" name="email" type="email" value={signupData.email} onChange={handleSignupChange} className="mt-1 w-full input-style" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label htmlFor="dob">Date of Birth</label>
                        <input id="dob" name="dob" type="date" value={signupData.dob} onChange={handleSignupChange} className="mt-1 w-full input-style" />
                        {signupErrors.dob && <p className="text-red-500 text-xs">{signupErrors.dob}</p>}
                    </div>
                     <div>
                        <label htmlFor="gender">Gender</label>
                        <select id="gender" name="gender" value={signupData.gender} onChange={(e) => setSignupData(p => ({...p, gender: e.target.value}))} className="mt-1 w-full input-style">
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="school">School/College</label>
                    <input id="school" name="school" type="text" value={signupData.school} onChange={handleSignupChange} className="mt-1 w-full input-style" />
                </div>
                 <div>
                    <label htmlFor="city">City</label>
                    <SearchableDropdown id="city" options={indianDistricts} value={signupData.city} onChange={(val) => setSignupData(p => ({...p, city: val}))} required={false} />
                </div>
                <div>
                     <label htmlFor="idCard" className="block text-sm">Upload ID Card (School/Aadhaar)</label>
                     <input type="file" name="idCard" id="idCard" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-brand-purple hover:file:bg-purple-100"/>
                </div>
                <div>
                    <div className="flex items-start">
                        <input id="agreeTerms" name="agreeTerms" type="checkbox" checked={signupData.agreeTerms} onChange={handleSignupChange} className="h-4 w-4 text-brand-purple focus:ring-brand-purple border-gray-300 rounded mt-1" />
                        <label htmlFor="agreeTerms" className="ml-2 block text-sm">I agree to the terms and conditions <span className="text-red-500">*</span></label>
                    </div>
                    {signupErrors.agreeTerms && <p className="text-red-500 text-xs">{signupErrors.agreeTerms}</p>}
                </div>
                <div className="pt-2 flex items-center justify-between">
                    <button type="button" onClick={() => setView('login')} className="text-sm font-medium text-brand-purple">Already have an account?</button>
                    <button type="submit" className="flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-brand-purple hover:bg-opacity-90">Sign Up</button>
                </div>
            </form>
        </>
    );

    const renderSuccessView = () => (
        <div className="text-center py-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h2 className="mt-4 text-2xl font-bold text-brand-navy">Signup Successful!</h2>
            <p className="mt-2 text-gray-700">You can now log in with your credentials.</p>
            <button onClick={() => setView('login')} className="mt-6 px-6 py-2 bg-brand-navy text-white font-semibold rounded-md shadow-md hover:bg-opacity-90">
                Go to Login
            </button>
        </div>
    );

    return (
        <>
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {view === 'login' && renderLoginView()}
                {view === 'signup' && renderSignupView()}
                {view === 'signupSuccess' && renderSuccessView()}
            </div>
        </div>
        {isForgotPasswordModalOpen && <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />}
        </>
    );
};

export default LoginModal;