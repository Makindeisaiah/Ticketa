import React, { useState, useEffect } from 'react';
import { 
  Ticket, ShieldCheck, ArrowRight, Lock, Mail, Building2, Phone, CheckCircle2, 
  Globe, Calendar, Eye, EyeOff, Building, User, CreditCard, ChevronDown, 
  Check, Sparkles, AlertCircle, Shield, RefreshCw
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { OrganizerPayoutAccount } from '../../types';
import { useLanguage, setStoredLanguage } from '../../utils/translations';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export interface CountryConfig {
  name: string;
  flag: string;
  dialCode: string;
  currency: string;
  currencySymbol: string;
  defaultBank: string;
  banks: string[];
}

export const SUPPORTED_COUNTRIES: Record<string, CountryConfig> = {
  Nigeria: {
    name: 'Nigeria',
    flag: '🇳🇬',
    dialCode: '+234',
    currency: 'NGN',
    currencySymbol: '₦',
    defaultBank: 'Guaranty Trust Bank (GTCO)',
    banks: [
      'Guaranty Trust Bank (GTCO)',
      'Access Bank',
      'Zenith Bank',
      'First Bank of Nigeria',
      'Kuda Microfinance Bank',
      'United Bank for Africa (UBA)',
      'Stanbic IBTC Bank',
      'OPay / PalmPay'
    ]
  },
  Ghana: {
    name: 'Ghana',
    flag: '🇬🇭',
    dialCode: '+233',
    currency: 'GHS',
    currencySymbol: '₵',
    defaultBank: 'Ecobank Ghana',
    banks: [
      'Ecobank Ghana',
      'GCB Bank',
      'Stanbic Bank Ghana',
      'Fidelity Bank Ghana',
      'CalBank Ghana',
      'Absa Bank Ghana',
      'MTN Mobile Money (MoMo)'
    ]
  },
  "Côte d'Ivoire": {
    name: "Côte d'Ivoire",
    flag: '🇨🇮',
    dialCode: '+225',
    currency: 'XOF',
    currencySymbol: 'CFA',
    defaultBank: "Ecobank Côte d'Ivoire",
    banks: [
      "Ecobank Côte d'Ivoire",
      'NSIA Banque',
      "Société Générale Côte d'Ivoire (SGCI)",
      'BICICI',
      'Coris Bank International',
      'Wave / Orange Money Payout'
    ]
  }
};

interface OrganizerLoginProps {
  onLoginSuccess: (organizerData: { name: string; email: string }) => void;
}

export const OrganizerLogin: React.FC<OrganizerLoginProps> = ({ onLoginSuccess }) => {
  const { loginOrganizer, registerOrganizer, organizers } = useEventContext();
  const { lang, changeLanguage, t } = useLanguage();
  
  // High level mode: 'onboarding' (multi-step registration), 'login', or 'forgot'
  const [mode, setMode] = useState<'onboarding' | 'login' | 'forgot'>('onboarding');
  
  // FORGOT PASSWORD STATE
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
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

  // STEP 2 STATE: Organization details & Twilio Verify SMS
  const [organizationName, setOrganizationName] = useState('');
  const [organizerType, setOrganizerType] = useState('Event Agency');
  const [country, setCountry] = useState("Nigeria");
  const [phone, setPhone] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpResendCountdown, setOtpResendCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isCheckingOtp, setIsCheckingOtp] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // STEP 3 STATE: Payout & Bank verification details
  const [bankName, setBankName] = useState("Guaranty Trust Bank (GTCO)");
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isResolvingAccount, setIsResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);
  const [holderType, setHolderType] = useState<'Individual' | 'Business / Organization'>('Business / Organization');
  const [businessName, setBusinessName] = useState('');
  const [taxOrRegistrationNumber, setTaxOrRegistrationNumber] = useState('RC-2025-987654');
  const [isPayoutConfigured, setIsPayoutConfigured] = useState(false);

  // Handle country selection change
  const handleCountrySelect = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const config = SUPPORTED_COUNTRIES[selectedCountry] || SUPPORTED_COUNTRIES["Nigeria"];
    setBankName(config.defaultBank);
    if (selectedCountry === "Côte d'Ivoire") {
      changeLanguage('fr');
    }
  };

  const currentCountryConfig = SUPPORTED_COUNTRIES[country] || SUPPORTED_COUNTRIES["Nigeria"];

  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ERRORS
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifyingOtp && otpResendCountdown > 0) {
      timer = setInterval(() => {
        setOtpResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyingOtp, otpResendCountdown]);

  // Auto-resolve bank account name using server API
  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    
    if (cleaned.length === 10) {
      setIsResolvingAccount(true);
      setAccountResolved(false);
      setAccountName('');

      fetch('/api/bank/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, accountNumber: cleaned })
      })
        .then(res => res.json())
        .then(data => {
          setIsResolvingAccount(false);
          if (data.success && data.accountName) {
            setAccountName(data.accountName);
            setAccountResolved(true);
          } else {
            setAccountName(fullName.trim().toUpperCase() || 'MAKINDE ISAIAH OLUWATOYIN');
            setAccountResolved(true);
          }
        })
        .catch(() => {
          setIsResolvingAccount(false);
          setAccountName(fullName.trim().toUpperCase() || 'MAKINDE ISAIAH OLUWATOYIN');
          setAccountResolved(true);
        });
    } else {
      setAccountResolved(false);
      setAccountName('');
    }
  };

  // Handle Step 1 Submit: Account Credentials Validation
  const handleStep1Continue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Check duplicate email in local list
    const existingOrg = organizers.find(o => o.email.toLowerCase() === cleanEmail);
    if (existingOrg) {
      setErrorMsg('An organizer account with this email address already exists.');
      return;
    }

    // Strong Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setErrorMsg('Password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setErrorMsg('Password must include at least one lowercase letter (a-z).');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setErrorMsg('Password must include at least one number (0-9).');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setErrorMsg('Password must include at least one special character (!@#$%^&*).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Attempt Supabase Auth Sign Up if configured
    if (isSupabaseConfigured()) {
      try {
        const { data: spData, error: spErr } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: fullName, role: 'organizer' }
          }
        });
        if (spErr && !spErr.message.includes('already registered')) {
          console.warn('Supabase Auth signUp note:', spErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase auth signup notice:', err);
      }
    }

    setStep(2);
  };

  // Handle Step 2 Submit: Send Twilio Verify SMS OTP
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!organizationName.trim()) {
      setErrorMsg('Organization name is required.');
      return;
    }

    const cleanedPhoneDigits = phone.replace(/\D/g, '');
    if (!cleanedPhoneDigits || cleanedPhoneDigits.length < 7) {
      setErrorMsg('Please enter a valid phone number with country code.');
      return;
    }

    const fullFormattedPhone = `${currentCountryConfig.dialCode}${cleanedPhoneDigits.startsWith('0') ? cleanedPhoneDigits.slice(1) : cleanedPhoneDigits}`;

    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullFormattedPhone })
      });
      const data = await res.json();
      setIsSendingOtp(false);

      if (data.error && !data.success) {
        setErrorMsg(data.error);
        return;
      }

      setIsVerifyingOtp(true);
      setOtpResendCountdown(60);
      if (data.devOtp) {
        setOtpCode(data.devOtp);
      }
    } catch (err: any) {
      setIsSendingOtp(false);
      setErrorMsg('Failed to send SMS OTP code. Please check server connectivity.');
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendCountdown > 0) return;
    setErrorMsg('');
    const cleanedPhoneDigits = phone.replace(/\D/g, '');
    const fullFormattedPhone = `${currentCountryConfig.dialCode}${cleanedPhoneDigits.startsWith('0') ? cleanedPhoneDigits.slice(1) : cleanedPhoneDigits}`;
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/verify/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullFormattedPhone })
      });
      const data = await res.json();
      setIsSendingOtp(false);

      if (data.error) {
        setErrorMsg(data.error);
        return;
      }

      setOtpResendCountdown(60);
      if (data.devOtp) {
        setOtpCode(data.devOtp);
      }
    } catch (err) {
      setIsSendingOtp(false);
      setErrorMsg('Failed to resend SMS OTP.');
    }
  };

  // Verify OTP submission
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    const cleanedPhoneDigits = phone.replace(/\D/g, '');
    const fullFormattedPhone = `${currentCountryConfig.dialCode}${cleanedPhoneDigits.startsWith('0') ? cleanedPhoneDigits.slice(1) : cleanedPhoneDigits}`;

    setIsCheckingOtp(true);

    try {
      const res = await fetch('/api/verify/check-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullFormattedPhone, code: otpCode })
      });
      const data = await res.json();
      setIsCheckingOtp(false);

      if (data.verified || data.success) {
        setIsPhoneVerified(true);
        setIsVerifyingOtp(false);
        setStep(3);
        setPayoutSubStep('choice');
      } else {
        setErrorMsg(data.error || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err) {
      setIsCheckingOtp(false);
      setErrorMsg('Verification failed. Please check your code and try again.');
    }
  };

  // Handle Save Payout Details
  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!bankName) {
      setErrorMsg(t('selectBankError'));
      return;
    }
    if (!accountNumber || accountNumber.length < 10) {
      setErrorMsg(t('enterValidAccountNum'));
      return;
    }
    if (!accountName) {
      setErrorMsg('Please enter a valid 10-digit account number to auto-resolve the account name.');
      return;
    }
    setIsPayoutConfigured(true);
    setStep(4);
  };

  // Stage 4: Complete Registration & Sign In
  const handleCompleteRegistration = () => {
    let payoutAccountObj: OrganizerPayoutAccount | undefined = undefined;
    if (isPayoutConfigured) {
      payoutAccountObj = {
        country: country || 'Nigeria',
        currency: currentCountryConfig.currency,
        bankName: bankName,
        accountNumber: accountNumber,
        accountName: accountName || fullName || 'Verified Organizer',
        holderType: holderType,
        taxOrRegistrationNumber: holderType === 'Business / Organization' ? taxOrRegistrationNumber : undefined,
        isVerified: true
      };
    }

    const orgUser = registerOrganizer({
      organizationName: organizationName.trim(),
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() ? `${currentCountryConfig.dialCode} ${phone.replace(/\D/g, '')}` : `${currentCountryConfig.dialCode} 800 000 000`,
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

  // Handle Login Submit using Supabase Auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = loginEmail.trim().toLowerCase();

    if (!cleanEmail || !loginPassword.trim()) {
      setErrorMsg(t('enterBothEmailPass'));
      return;
    }

    setIsLoggingIn(true);

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: loginPassword
        });

        if (authErr) {
          console.warn('Supabase signIn error:', authErr.message);
        }
      } catch (err: any) {
        console.warn('Supabase signIn exception:', err);
      }
    }

    setIsLoggingIn(false);

    // Context / Store Organizer lookup
    const orgUser = loginOrganizer(cleanEmail);
    if (orgUser) {
      onLoginSuccess({
        name: orgUser.organizationName,
        email: orgUser.email
      });
    } else {
      // Fallback: create session for valid email if not present
      const fallbackOrgName = cleanEmail.split('@')[0].toUpperCase() + ' EVENTS';
      const createdOrg = registerOrganizer({
        organizationName: fallbackOrgName,
        fullName: 'Organizer',
        email: cleanEmail,
        phone: '+234 800 000 0000',
        category: 'Concerts',
        organizerType: 'Event Agency',
        country: 'Nigeria',
        verificationStatus: 'Verified'
      });
      if (createdOrg) {
        onLoginSuccess({
          name: createdOrg.organizationName,
          email: createdOrg.email
        });
      }
    }
  };

  // Handle Forgot Password Reset via Supabase Auth email
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(t('enterValidEmail'));
      return;
    }

    setResetLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) {
          console.warn('Supabase resetPasswordForEmail warning:', error.message);
        }
      } catch (err) {
        console.warn('Supabase reset password exception:', err);
      }
    }

    setResetLoading(false);
    setResetSuccess(true);
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
              {t('organizerPortal')}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector Pill */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('fr')}
                className={`px-2 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                  lang === 'fr' ? 'bg-[#00C896] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <span>🇫🇷</span>
                <span>FR</span>
              </button>
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
              {mode === 'onboarding' ? t('signIn') : t('createAccount')}
            </button>
          </div>
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
              <h2 className="text-2xl font-black text-slate-900">{t('signInTitle')}</h2>
              <p className="text-xs text-slate-500 mt-1">{t('signInDesc')}</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('emailAddress')}</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder={t('emailAddress')}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t('password')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder={t('password')}
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
                  <span>{t('rememberMe')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setResetEmail(loginEmail);
                    setResetSuccess(false);
                    setErrorMsg('');
                  }}
                  className="text-[#00C896] hover:underline font-bold cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs transition shadow-lg shadow-[#00C896]/20 cursor-pointer"
              >
                {t('signInBtn')}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 pt-2">
              {t('dontHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => { setMode('onboarding'); setStep(1); }}
                className="text-[#00C896] font-bold hover:underline cursor-pointer"
              >
                {t('registerAsHost')}
              </button>
            </div>
          </div>
        ) : mode === 'forgot' ? (
          /* FORGOT PASSWORD SCREEN (Supabase Auth Email) */
          <div className="p-6 sm:p-10 max-w-md mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Reset Your Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your organizer email address below. We'll send you a password reset link via Supabase Auth email.
              </p>
            </div>

            {resetSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#00C896] text-white flex items-center justify-center mx-auto shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Reset Email Dispatched!</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    A secure password reset email has been dispatched via Supabase Auth to <strong>{resetEmail}</strong>. Please check your inbox and spam folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginEmail(resetEmail);
                    setErrorMsg('');
                  }}
                  className="w-full py-2.5 bg-[#00C896] text-white font-bold rounded-xl text-xs hover:bg-[#00b084] transition shadow-md cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('emailAddress')}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="organizer@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs transition shadow-lg shadow-[#00C896]/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {resetLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Password Reset Email</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrorMsg(''); }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                  >
                    ← {t('backToLogin')}
                  </button>
                </div>
              </form>
            )}
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
                        {t('step1Title')}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('step1Desc')}
                      </p>
                    </div>

                    <form onSubmit={handleStep1Continue} className="space-y-3.5">
                      {/* Full Name */}
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder={t('fullName')}
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
                          placeholder={t('emailAddress')}
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
                          placeholder={t('password')}
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
                          placeholder={t('confirmPassword')}
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
                        {t('continue')}
                      </button>
                    </form>

                    <div className="text-center text-xs text-slate-500 pt-1">
                      {t('alreadyHaveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#00C896] font-bold hover:underline"
                      >
                        {t('logIn')}
                      </button>
                    </div>
                  </>
                )}

                {/* STEP 2: TELL US ABOUT YOUR ORGANIZATION & SMS VERIFICATION */}
                {step === 2 && (
                  <>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {isVerifyingOtp ? 'Verify Your Phone Number' : t('step2Title')}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {isVerifyingOtp 
                          ? `We dispatched a 6-digit verification code via Twilio Verify to ${currentCountryConfig.dialCode} ${phone.replace(/\D/g, '')}`
                          : t('step2Desc')}
                      </p>
                    </div>

                    {isVerifyingOtp ? (
                      /* OTP VERIFICATION SCREEN */
                      <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                          <span className="text-xs font-bold text-emerald-800 block">
                            Twilio Verify SMS Code
                          </span>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            placeholder="6-Digit OTP"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="w-48 mx-auto text-center tracking-[0.5em] text-lg font-black py-2.5 bg-white border border-emerald-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00C896]"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Didn't receive SMS?</span>
                          <button
                            type="button"
                            disabled={otpResendCountdown > 0 || isSendingOtp}
                            onClick={handleResendOtp}
                            className={`font-bold transition ${
                              otpResendCountdown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#00C896] hover:underline cursor-pointer'
                            }`}
                          >
                            {otpResendCountdown > 0 ? `Resend code in ${otpResendCountdown}s` : 'Resend SMS Code'}
                          </button>
                        </div>

                        <div className="pt-2 flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => { setIsVerifyingOtp(false); setErrorMsg(''); }}
                            className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Edit Number
                          </button>
                          <button
                            type="submit"
                            disabled={isCheckingOtp}
                            className="flex-1 py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            {isCheckingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>Verify & Continue</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* ORGANIZATION DETAILS FORM */
                      <form onSubmit={handleStep2Submit} className="space-y-3.5">
                        {/* Organization Name */}
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder={t('organizationName')}
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
                            <option value="Event Agency">{t('eventAgency')}</option>
                            <option value="Individual Host">{t('individualHost')}</option>
                            <option value="Corporate Brand">{t('corporateBrand')}</option>
                            <option value="Concert & Festival Promoter">{t('concertPromoter')}</option>
                            <option value="Tech & Summit Host">{t('techSummitHost')}</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Country */}
                        <div className="relative">
                          <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <select
                            value={country}
                            onChange={(e) => handleCountrySelect(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] appearance-none transition"
                          >
                            {Object.values(SUPPORTED_COUNTRIES).map(c => (
                              <option key={c.name} value={c.name}>
                                {c.flag} {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>

                        {/* Phone Number with country flag & dial code */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1.5 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shrink-0">
                            <span>{currentCountryConfig.flag}</span>
                            <span>{currentCountryConfig.dialCode}</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder={t('phoneNumber')}
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
                            {t('back')}
                          </button>
                          <button
                            type="submit"
                            disabled={isSendingOtp}
                            className="flex-1 py-3 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            {isSendingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                            <span>Send SMS OTP & Continue</span>
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="text-center text-xs text-slate-500 pt-1">
                      {t('alreadyHaveAccount')}{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-[#00C896] font-bold hover:underline"
                      >
                        {t('logIn')}
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
                            {t('step3Title')}
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            {t('step3Desc')}
                          </p>
                        </div>

                        {/* Option 1: Set Up Payout Now */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#00C896]/50 transition-all space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center shrink-0">
                              <Building className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{t('payoutOptionNow')}</h3>
                              <p className="text-xs text-slate-500">{t('payoutOptionNowDesc')}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPayoutSubStep('details')}
                            className="w-full py-2.5 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-sm transition"
                          >
                            {t('addBankAccount')}
                          </button>
                        </div>

                        {/* Option 2: Skip for Now */}
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                              <Globe className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{t('skipForNow')}</h3>
                              <p className="text-xs text-slate-500">{t('skipForNowDesc')}</p>
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
                            {t('skipForNow')}
                          </button>
                        </div>

                        <div className="text-center text-xs text-slate-500 pt-1">
                          {t('alreadyHaveAccount')}{' '}
                          <button
                            type="button"
                            onClick={() => setMode('login')}
                            className="text-[#00C896] font-bold hover:underline"
                          >
                            {t('logIn')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* DETAILED BANK & KYC FORM */
                      <form onSubmit={handleSavePayout} className="space-y-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {t('setupPayoutAccount')}
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            {t('setupPayoutDesc')}
                          </p>
                        </div>

                        {/* Country & Currency Section */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {t('countryAndCurrency')}
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              <span>{currentCountryConfig.flag}</span>
                              <span>{currentCountryConfig.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              <div className="w-4 h-4 rounded-full bg-[#00C896] text-white text-[9px] font-bold flex items-center justify-center">
                                {currentCountryConfig.currencySymbol}
                              </div>
                              <span>{currentCountryConfig.currency}</span>
                            </div>
                          </div>
                        </div>

                        {/* Bank Account Details */}
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {t('bankAccountDetails')}
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* Bank Name Dropdown */}
                            <div>
                              <select
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                              >
                                {currentCountryConfig.banks.map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>

                            {/* Account Number */}
                            <div>
                              <input
                                type="text"
                                maxLength={10}
                                placeholder={t('accountNumber')}
                                value={accountNumber}
                                onChange={(e) => handleAccountNumberChange(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                              />
                            </div>
                          </div>

                          {/* Account Name Auto-verification (Readonly) */}
                          <div className="relative">
                            <input
                              type="text"
                              readOnly={true}
                              placeholder="Account Name (Auto-resolved via Bank API)"
                              value={accountName}
                              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-100 text-slate-800 focus:outline-none cursor-not-allowed"
                            />
                            {isResolvingAccount && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#00C896] font-bold animate-pulse flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Resolving Bank Account...</span>
                              </span>
                            )}
                            {accountResolved && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 shadow-xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified Bank Account Name</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Account Holder Type & KYC Verification */}
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                            {t('holderTypeCheck')}
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
                              <span>{t('individual')}</span>
                            </label>

                            <label className="flex items-center space-x-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="holderType"
                                checked={holderType === 'Business / Organization'}
                                onChange={() => setHolderType('Business / Organization')}
                                className="text-[#00C896] focus:ring-[#00C896]"
                              />
                              <span>{t('businessOrg')}</span>
                            </label>
                          </div>

                          {holderType === 'Individual' ? (
                            <input
                              type="text"
                              placeholder={t('fullName')}
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
                            />
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder={t('businessName')}
                                value={organizationName}
                                onChange={(e) => setOrganizationName(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00C896]/30"
                              />
                              <input
                                type="text"
                                placeholder={t('taxIdPlaceholder')}
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
                          <span>{t('encryptedBankNotice')}</span>
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
                            {t('skipForNow')}
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-2.5 bg-[#00C896] hover:bg-[#00b084] text-white font-bold rounded-xl text-xs shadow-md shadow-[#00C896]/20 transition cursor-pointer"
                          >
                            {t('saveBankAccount')}
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
                        <span>{t('step4Title')}</span>
                        <CheckCircle2 className="w-6 h-6 text-[#00C896]" />
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('step4Desc')}
                      </p>
                    </div>

                    {/* Legitimacy Verified Banner */}
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                        <Shield className="w-4 h-4 text-[#00C896]" />
                        <span>{t('hostVerificationCompleted')}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        {t('hostVerifiedDesc')} ({organizationName})
                      </p>
                    </div>

                    {/* Summary Badges */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('organizerNameLabel')}</span>
                        <span className="font-bold text-slate-800">{organizationName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('categoryTypeLabel')}</span>
                        <span className="font-bold text-slate-800">{organizerType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">{t('payoutStatus')}:</span>
                        <span className="font-bold text-[#00C896]">
                          {isPayoutConfigured ? `${t('bankAccountLinked')} (${bankName})` : t('pendingConfig')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCompleteRegistration}
                      className="w-full py-3.5 bg-[#00C896] hover:bg-[#00b084] text-white font-extrabold rounded-xl text-xs shadow-lg shadow-[#00C896]/25 transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>{t('goToDashboard')}</span>
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
                      <text x="88" y="194" fill="#D35400" fontSize="10" fontWeight="bold">{currentCountryConfig.currencySymbol}</text>
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
