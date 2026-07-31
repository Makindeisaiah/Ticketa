import React, { useState } from 'react';
import { 
  Ticket, ShieldCheck, ArrowRight, Lock, Mail, Building2, Phone, CheckCircle2, 
  Globe, Calendar, Eye, EyeOff, Building, User, CreditCard, ChevronDown, 
  Check, Sparkles, AlertCircle, Shield
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { OrganizerPayoutAccount } from '../../types';

interface OrganizerLoginProps {
  onLoginSuccess: (organizerData: { name: string; email: string }) => void;
}

export const OrganizerLogin: React.FC<OrganizerLoginProps> = ({ onLoginSuccess }) => {
  const { loginOrganizer, registerOrganizer } = useEventContext();
  
  // High level mode: 'onboarding' (multi-step registration) or 'login'
  const [mode, setMode] = useState<'onboarding' | 'login'>('onboarding');
  
  // Onboarding step (1 to 4)
  const [step, setStep] = useState<number>(1);
  const [payoutSubStep, setPayoutSubStep] = useState<'choice' | 'details'>('choice');

  // STEP 1 STATE: Account credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // STEP 2 STATE: Organization details
  const [organizationName, setOrganizationName] = useState('');
  const [organizerType, setOrganizerType] = useState('Event Agency');
  const [country, setCountry] = useState('Nigeria');
  const [phone, setPhone] = useState('');

  // STEP 3 STATE: Payout & KYC verification details
  const [bankName, setBankName] = useState('Guaranty Trust Bank');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);
  const [holderType, setHolderType] = useState<'Individual' | 'Business / Organization'>('Business / Organization');
  const [taxOrRegistrationNumber, setTaxOrRegistrationNumber] = useState('ND65478477664');
  const [isPayoutConfigured, setIsPayoutConfigured] = useState(false);

  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // ERRORS
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-resolve account name when 10 digits entered
  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    
    if (cleaned.length === 10) {
      setIsResolvingAccount(true);
      setAccountResolved(false);
      setTimeout(() => {
        setIsResolvingAccount(false);
        setAccountResolved(true);
        if (!accountName) {
          setAccountName(fullName.trim() || 'Makinde Isaiah Oluwatoyin');
        }
      }, 700);
    } else {
      setAccountResolved(false);
    }
  };

  // Handle Step 1 Submit
  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }
    setStep(2);
  };

  // Handle Step 2 Submit
  const handleStep2Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!organizationName.trim()) {
      setErrorMsg('Please enter your Organization / Brand Name.');
      return;
    }
    setStep(3);
    setPayoutSubStep('choice');
  };

  // Handle Save Payout Details
  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!bankName) {
      setErrorMsg('Please select a bank.');
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit account number.');
      return;
    }
    setIsPayoutConfigured(true);
    setStep(4);
  };

  // Complete Registration & Sign In
  const handleCompleteRegistration = () => {
    let payoutAccountObj: OrganizerPayoutAccount | undefined = undefined;
    if (isPayoutConfigured) {
      payoutAccountObj = {
        country: country || 'Nigeria',
        currency: 'NGN',
        bankName: bankName,
        accountNumber: accountNumber,
        accountName: accountName || fullName || 'Verified Host',
        holderType: holderType,
        taxOrRegistrationNumber: holderType === 'Business / Organization' ? taxOrRegistrationNumber : undefined,
        isVerified: true
      };
    }

    const orgUser = registerOrganizer({
      organizationName: organizationName.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+234 800 000 0000',
      category: 'Concerts & Festivals',
      organizerType: organizerType,
      country: country,
      payoutAccount: payoutAccountObj,
      verificationStatus: 'Verified'
    });

    if (orgUser) {
      onLoginSuccess({
        name: orgUser.organizationName,
        email: orgUser.email
      });
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    const orgUser = loginOrganizer(loginEmail.trim());
    if (orgUser) {
      onLoginSuccess({
        name: orgUser.organizationName,
        email: orgUser.email
      });
    } else {
      // Create fallback session for login demo
      onLoginSuccess({
        name: loginEmail.split('@')[0].toUpperCase() + ' Productions',
        email: loginEmail.trim()
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#1F445B] text-slate-800 flex flex-col justify-center items-center p-3 sm:p-6 font-sans">
      
      {/* Outer Card Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4">
        
        {/* TOP BRAND HEADER BAR */}
        <div className="pt-6 px-6 sm:px-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#00C896] text-white flex items-center justify-center font-bold shadow-md shadow-[#00C896]/20">
              <Ticket className="w-5 h-5 rotate-[-12deg]" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">TICKETA</span>
            <span className="text-[10px] font-bold text-[#00C896] bg-[#00C896]/10 px-2.5 py-0.5 rounded-full uppercase border border-[#00C896]/20">
              Organizer Portal
            </span>
          </div>

          <button
            onClick={() => {
              if (mode === 'onboarding') {
                setMode('login');
              } else {
                setMode('onboarding');
                setStep(1);
              }
              setErrorMsg('');
            }}
            className="text-xs font-bold text-[#00C896] hover:underline"
          >
            {mode === 'onboarding' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        {/* ERROR NOTIFICATION ALERT */}
        {errorMsg && (
          <div className="mx-6 sm:mx-10 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN BODY AREA */}
        {mode === 'login' ? (
          /* STANDARD SIGN IN SCREEN */
          <div className="p-6 sm:p-10 max-w-md mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Sign in to your Organizer Portal</h2>
              <p className="text-xs text-slate-500 mt-1">Manage events, track ticket sales, and view real-time gate attendance metrics.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="organizer@company.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#00C896] focus:ring-[#00C896]"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#00C896] hover:underline font-bold">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs transition shadow-lg shadow-[#00C896]/20 cursor-pointer"
              >
                Sign In to Dashboard
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2">
              Don't have an organizer account?{' '}
              <button
                type="button"
                onClick={() => { setMode('onboarding'); setStep(1); }}
                className="text-[#00C896] font-bold hover:underline"
              >
                Register as Host
              </button>
            </div>
          </div>
        ) : (
          /* ONBOARDING FLOW (4 STEPS) */
          <div className="p-6 sm:p-10">
            
            {/* GRID LAYOUT: Left Form | Right Illustration */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* LEFT COLUMN: FORM CONTENT */}
              <div className="md:col-span-7 space-y-5">
                
                {/* STEP 1: CREATE YOUR ORGANIZER ACCOUNT */}
                {step === 1 && (
                  <>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Create Your Organizer Account
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Set up your organizer account to start selling tickets and managing events.
                      </p>
                    </div>

                    <form onSubmit={handleStep1Continue} className="space-y-3.5">
                      {/* Full Name */}
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                      </div>

                      {/* Email Address */}
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                      </div>

                      {/* Password */}
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Confirm Password */}
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition cursor-pointer"
                      >
                        Continue
                      </button>
                    </form>

                    <div className="text-center text-xs text-slate-500 pt-1">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#00C896] font-bold hover:underline"
                      >
                        Log in
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2: TELL US ABOUT YOUR ORGANIZATION */}
                {step === 2 && (
                  <>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Tell us about your organization
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Help us understand who you are to offer the best event management experience.
                      </p>
                    </div>

                    <form onSubmit={handleStep2Continue} className="space-y-3.5">
                      {/* Organization Name */}
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="Organization Name"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                      </div>

                      {/* Organizer Type */}
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={organizerType}
                          onChange={(e) => setOrganizerType(e.target.value)}
                          className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] appearance-none transition"
                        >
                          <option value="Event Agency">Event Agency</option>
                          <option value="Individual Host">Individual Host</option>
                          <option value="Corporate Brand">Corporate Brand</option>
                          <option value="Concert & Festival Promoter">Concert & Festival Promoter</option>
                          <option value="Tech & Summit Host">Tech & Summit Host</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Country */}
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] appearance-none transition"
                        >
                          <option value="Nigeria">🇳🇬 Nigeria</option>
                          <option value="Ghana">🇬🇭 Ghana</option>
                          <option value="Kenya">🇰🇪 Kenya</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="South Africa">🇿🇦 South Africa</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Phone Number with country flag */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0">
                          <span>🇳🇬</span>
                          <span>+234</span>
                        </div>
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition"
                        />
                      </div>

                      <div className="pt-2 flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition cursor-pointer"
                        >
                          Continue
                        </button>
                      </div>
                    </form>

                    <div className="text-center text-xs text-slate-500 pt-1">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#00C896] font-bold hover:underline"
                      >
                        Log in
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 3: PAYOUT & KYC VERIFICATION */}
                {step === 3 && (
                  <>
                    {payoutSubStep === 'choice' ? (
                      /* CHOICE CARDS */
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Set Up How You'll Get Paid
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Add your payout details to receive ticket sales earnings safely.
                          </p>
                        </div>

                        {/* Option 1: Set Up Payout Now */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#00C896]/50 transition-all space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">Set Up Payout Now</h3>
                              <p className="text-xs text-slate-500">Connect your bank account to receive earnings.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPayoutSubStep('details')}
                            className="w-full py-2.5 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-sm transition"
                          >
                            Add Bank Account
                          </button>
                        </div>

                        {/* Option 2: Skip for Now */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">Skip for Now</h3>
                              <p className="text-xs text-slate-500">Set up payout later in the dashboard settings.</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPayoutConfigured(false);
                              setStep(4);
                            }}
                            className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                          >
                            Skip for Now
                          </button>
                        </div>

                        <div className="text-center text-xs text-slate-500 pt-1">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="text-[#00C896] font-bold hover:underline"
                          >
                            Log in
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* DETAILED BANK & KYC FORM */
                      <form onSubmit={handleSavePayout} className="space-y-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Set up your payout account
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            This is where we'll send your ticket sales revenue
                          </p>
                        </div>

                        {/* Country & Currency Section */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Country & Currency
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              <span>🇳🇬</span>
                              <span>Nigeria</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              <div className="w-4 h-4 rounded-full bg-[#00C896] text-white text-[9px] font-bold flex items-center justify-center">₦</div>
                              <span>NGN</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank Account Details */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Bank Account Details
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Bank Name Dropdown */}
                            <div>
                              <select
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                              >
                                <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTCO)</option>
                                <option value="Access Bank">Access Bank</option>
                                <option value="Zenith Bank">Zenith Bank</option>
                                <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                                <option value="Kuda Microfinance Bank">Kuda Microfinance Bank</option>
                                <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
                                <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
                              </select>
                            </div>

                            {/* Account Number */}
                            <div>
                              <input
                                type="text"
                                maxLength={10}
                                placeholder="Account number"
                                value={accountNumber}
                                onChange={(e) => handleAccountNumberChange(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                              />
                            </div>
                          </div>

                          {/* Account Name Auto-verification */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Account name"
                              value={accountName}
                              onChange={(e) => setAccountName(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                            />
                            {isResolvingAccount && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#00C896] font-bold animate-pulse">
                                Verifying...
                              </span>
                            )}
                            {accountResolved && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Verified Account</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Account Holder Type & KYC Verification */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            Account Holder Type & Legitimacy Check
                          </span>

                          <div className="flex items-center space-x-4 text-xs">
                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="holderType"
                                checked={holderType === 'Individual'}
                                onChange={() => setHolderType('Individual')}
                                className="text-[#00C896] focus:ring-[#00C896]"
                              />
                              <span>Individual</span>
                            </label>

                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="holderType"
                                checked={holderType === 'Business / Organization'}
                                onChange={() => setHolderType('Business / Organization')}
                                className="text-[#00C896] focus:ring-[#00C896]"
                              />
                              <span>Business / Organization</span>
                            </label>
                          </div>

                          {holderType === 'Individual' ? (
                            <input
                              type="text"
                              placeholder="Full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
                            />
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Business Name"
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
                              />
                              <input
                                type="text"
                                placeholder="CAC / Tax ID (e.g. ND65478477664)"
                                value={taxOrRegistrationNumber}
                                onChange={(e) => setTaxOrRegistrationNumber(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
                              />
                            </div>
                          )}
                        </div>

                        {/* Security notice */}
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Your bank details are encrypted and securely stored.</span>
                        </div>

                        <div className="pt-2 flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPayoutConfigured(false);
                              setStep(4);
                            }}
                            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition"
                          >
                            Skip for now
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition cursor-pointer"
                          >
                            Save bank account
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* STEP 4: YOUR ORGANIZER ACCOUNT IS READY */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Your organizer account is ready</span>
                        <CheckCircle2 className="w-6 h-6 text-[#00C896]" />
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        You can now start organizing events, selling tickets, and managing payouts on your dashboard.
                      </p>
                    </div>

                    {/* Legitimacy Verified Banner */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <Shield className="w-4 h-4 text-[#00C896]" />
                        <span>Host Verification Completed</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Your brand account <strong className="font-extrabold">{organizationName}</strong> is verified. Anti-fraud checks cleared successfully.
                      </p>
                    </div>

                    {/* Summary Badges */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Organizer Name:</span>
                        <span className="font-bold text-slate-800">{organizationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Category / Type:</span>
                        <span className="font-bold text-slate-800">{organizerType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payout Status:</span>
                        <span className="font-bold text-[#00C896]">
                          {isPayoutConfigured ? `Bank Account Linked (${bankName})` : 'Pending (Configure in Settings)'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteRegistration}
                      className="w-full py-3.5 bg-[#00C896] hover:bg-[#00b084] text-white font-extrabold rounded-xl text-xs shadow-lg shadow-[#00C896]/25 transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: ILLUSTRATION AREA */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-6 p-4">
                
                {/* Dynamic SVG Vector Graphics matching wireframes */}
                <div className="w-full max-w-xs aspect-square flex items-center justify-center">
                  {step === 1 && (
                    /* Step 1 Illustration: Girl at desk managing ticketing */
                    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="150" cy="150" r="130" fill="#E6F7F2" />
                      <rect x="70" y="160" width="160" height="70" rx="12" fill="#FFFFFF" stroke="#00C896" strokeWidth="3" />
                      <rect x="90" y="175" width="70" height="40" rx="6" fill="#00C896" opacity="0.2" />
                      <path d="M120 120 C120 80, 180 80, 180 120" stroke="#2D5F7C" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="150" cy="115" r="30" fill="#FFE2D1" />
                      <path d="M135 110 Q150 100 165 110" stroke="#4B382A" strokeWidth="3" fill="none" />
                      <circle cx="140" cy="115" r="3" fill="#333" />
                      <circle cx="160" cy="115" r="3" fill="#333" />
                      <path d="M145 125 Q150 132 155 125" stroke="#E56B6B" strokeWidth="2.5" fill="none" />
                      <rect x="65" y="110" width="30" height="20" rx="4" fill="#00C896" />
                      <path d="M72 120 L88 120" stroke="#FFF" strokeWidth="2" />
                      <circle cx="215" cy="100" r="22" fill="#FFEAA7" />
                      <path d="M207 100 L213 106 L223 94" stroke="#D63031" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}

                  {step === 2 && (
                    /* Step 2 Illustration: Organization Storefront & Checklist */
                    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="150" cy="150" r="130" fill="#EBF9F5" />
                      {/* Storefront */}
                      <path d="M110 130 L190 130 L180 190 L120 190 Z" fill="#00C896" opacity="0.2" />
                      <rect x="120" y="140" width="60" height="60" rx="8" fill="#FFFFFF" stroke="#00C896" strokeWidth="3" />
                      <path d="M110 140 L190 140 L185 155 L115 155 Z" fill="#00C896" />
                      {/* Ticket Badge */}
                      <rect x="75" y="170" width="65" height="35" rx="6" fill="#FFEAA7" stroke="#FDCB6E" strokeWidth="2" />
                      <text x="83" y="192" fill="#D35400" fontSize="11" fontWeight="bold font-mono">TICKET</text>
                      {/* Clipboard */}
                      <rect x="190" y="160" width="45" height="55" rx="5" fill="#FFFFFF" stroke="#2D5F7C" strokeWidth="2" />
                      <rect x="200" y="155" width="25" height="8" rx="2" fill="#2D5F7C" />
                      <circle cx="200" cy="175" r="3" fill="#00C896" />
                      <line x1="207" y1="175" x2="225" y2="175" stroke="#2D5F7C" strokeWidth="2" />
                      <circle cx="200" cy="190" r="3" fill="#00C896" />
                      <line x1="207" y1="190" x2="225" y2="190" stroke="#2D5F7C" strokeWidth="2" />
                    </svg>
                  )}

                  {step === 3 && (
                    /* Step 3 Illustration: Payout & Mobile Banking Connect */
                    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="150" cy="150" r="130" fill="#E6F7F2" />
                      {/* Smartphone */}
                      <rect x="120" y="90" width="80" height="140" rx="16" fill="#1E293B" stroke="#00C896" strokeWidth="4" />
                      <rect x="128" y="105" width="64" height="110" rx="8" fill="#FFFFFF" />
                      <rect x="136" y="125" width="48" height="24" rx="4" fill="#00C896" />
                      <text x="142" y="141" fill="#FFFFFF" fontSize="9" fontWeight="bold">Connect Bank</text>
                      {/* Shield Security */}
                      <path d="M210 110 C210 110 235 110 235 130 C235 160 210 175 210 175 C210 175 185 160 185 130 C185 110 210 110 210 110 Z" fill="#00C896" opacity="0.9" />
                      <path d="M202 140 L208 146 L218 134" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Coins */}
                      <circle cx="95" cy="190" r="16" fill="#FFEAA7" stroke="#FDCB6E" strokeWidth="2" />
                      <circle cx="95" cy="190" r="11" fill="#FDCB6E" />
                      <text x="92" y="194" fill="#D35400" fontSize="12" fontWeight="bold">₦</text>
                    </svg>
                  )}

                  {step === 4 && (
                    /* Step 4 Illustration: Completed Dashboard & Mobile Scanner */
                    <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="150" cy="150" r="130" fill="#EBF9F5" />
                      {/* Desktop */}
                      <rect x="80" y="90" width="140" height="100" rx="10" fill="#FFFFFF" stroke="#00C896" strokeWidth="3" />
                      <rect x="80" y="90" width="140" height="20" rx="8" fill="#00C896" />
                      <line x1="100" y1="125" x2="150" y2="125" stroke="#2D5F7C" strokeWidth="4" strokeLinecap="round" />
                      <line x1="100" y1="145" x2="200" y2="145" stroke="#00C896" strokeWidth="4" strokeLinecap="round" />
                      <line x1="100" y1="165" x2="170" y2="165" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round" />
                      {/* Phone Scanner */}
                      <rect x="185" y="140" width="55" height="90" rx="10" fill="#1E293B" stroke="#00C896" strokeWidth="3" />
                      <rect x="192" y="152" width="41" height="66" rx="5" fill="#FFFFFF" />
                      <line x1="200" y1="175" x2="225" y2="175" stroke="#00C896" strokeWidth="3" />
                      <line x1="200" y1="182" x2="225" y2="182" stroke="#2D5F7C" strokeWidth="2" />
                    </svg>
                  )}
                </div>

                {/* STEP PROGRESS DOTS INDICATOR: 1 - 2 - 3 - 4 */}
                <div className="flex items-center space-x-3">
                  {[1, 2, 3, 4].map((s) => (
                    <React.Fragment key={s}>
                      <button
                        type="button"
                        onClick={() => {
                          if (s < step) setStep(s);
                        }}
                        className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                          step === s
                            ? 'bg-[#00C896] text-white shadow-md shadow-[#00C896]/30 scale-110 ring-4 ring-[#00C896]/20'
                            : step > s
                            ? 'bg-[#00C896] text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {step > s ? <Check className="w-4 h-4 text-white" /> : s}
                      </button>
                      {s < 4 && (
                        <div
                          className={`w-6 h-0.5 rounded-full transition-colors ${
                            step > s ? 'bg-[#00C896]' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* FOOTER BAR */}
        <div className="bg-slate-50 border-t border-slate-100 py-3 px-6 text-center text-slate-400 text-[11px] flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>Ticketa Legitimacy & Anti-Fraud Host Verification System</span>
        </div>

      </div>

    </div>
  );
};
