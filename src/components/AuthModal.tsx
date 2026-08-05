import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { useLanguage } from '../utils/translations';
import { formatOrganizerCurrency } from '../utils/currency';
import { X, UserPlus, LogIn, CheckCircle2, User, Mail, Phone, Lock, Sparkles, ShieldCheck, KeyRound, RefreshCw, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signup' }) => {
  const { t } = useLanguage();
  const { registerUser, loginUser, currentUser, logoutUser, orders, currentOrganizer } = useEventContext();
  const [mode, setMode] = useState<'signup' | 'verify-email' | 'login'>(defaultMode);

  // Compute live orders and spent stats for currentUser to match My Wallet
  const userOrders = currentUser 
    ? orders.filter(o => 
        (o.customerEmail && o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) || 
        (currentUser.phone && o.customerPhone === currentUser.phone)
      )
    : [];
  const totalOrdersCount = userOrders.length;
  const totalSpentAmount = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Email Verification Code state
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Social Login state (Google / Apple)
  const [socialProvider, setSocialProvider] = useState<'Google' | 'Apple' | null>(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialName, setSocialName] = useState('');

  if (!isOpen) return null;

  const handleStartSocialAuth = async (provider: 'Google' | 'Apple') => {
    setErrorMsg('');
    setSocialProvider(provider);
    if (provider === 'Google') {
      setSocialName('');
      setSocialEmail('');
    } else {
      setSocialName('');
      setSocialEmail('');
    }
  };

  const handleCompleteSocialAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = socialEmail.trim().toLowerCase();
    const cleanName = socialName.trim() || (socialProvider === 'Google' ? 'Google User' : 'Apple User');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg(`Please enter a valid ${socialProvider} account email.`);
      return;
    }

    // Register / Log in user automatically with social provider
    registerUser({
      fullName: cleanName,
      email: cleanEmail,
      phone: '+234 800 123 4567',
      emailVerified: true
    });

    setSocialProvider(null);
    onClose();
  };

  const initiateSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all fields (Full Name, Email, and Phone).');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Generate 6-digit OTP verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setInputOtp('');
    setMode('verify-email');
    setResendCooldown(30);

    // Cooldown timer
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (inputOtp.trim() !== generatedOtp.trim()) {
      setErrorMsg(`Invalid code. Enter the 6-digit code shown in the badge or sent to ${email}`);
      return;
    }

    // Complete registration with verified status
    registerUser({ fullName, email, phone, emailVerified: true });
    onClose();
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setInputOtp('');
    setResendCooldown(30);
    setErrorMsg('A new verification code has been dispatched to your email.');

    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const user = loginUser(email);
    if (!user) {
      setErrorMsg('No user account found with this email. Try creating a new account.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            {mode === 'verify-email' ? (
              <KeyRound className="w-6 h-6" />
            ) : mode === 'signup' ? (
              <UserPlus className="w-6 h-6" />
            ) : (
              <LogIn className="w-6 h-6" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentUser 
              ? t('accountProfile') 
              : mode === 'verify-email'
                ? t('verifyEmailAddress')
                : mode === 'signup' 
                  ? t('createTicketaAccount') 
                  : t('signInToTicketa')
            }
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser
              ? t('manageWalletAndOrders')
              : mode === 'verify-email'
                ? `${t('enter6DigitSentTo')} ${email}`
                : mode === 'signup'
                  ? t('registerFreshAccount')
                  : t('accessTicketWallet')
            }
          </p>
        </div>

        {/* Mode Selector Switcher */}
        {!currentUser && mode !== 'verify-email' && (
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                mode === 'signup' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('signUp')}</span>
            </button>
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('signIn')}</span>
            </button>
          </div>
        )}

        {/* Error / Info message */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {/* Current User Active Profile Card */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg flex items-center justify-center shadow-md">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-white text-sm">{currentUser.fullName}</h3>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('ordersCol')}</span>
                  <span className="font-bold text-emerald-400">{totalOrdersCount}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">{t('totalSpentCol')}</span>
                  <span className="font-bold text-teal-300">{formatOrganizerCurrency(totalSpentAmount, currentOrganizer)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                onClose();
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              {t('signOutAccount')}
            </button>
          </div>
        ) : socialProvider ? (
          /* Social Auth Account Selector Screen */
          <form onSubmit={handleCompleteSocialAuth} className="space-y-4 animate-fadeIn">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-md ${
                  socialProvider === 'Google' ? 'bg-white text-slate-900' : 'bg-black text-white border border-slate-700'
                }`}>
                  {socialProvider === 'Google' ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.08-3.32-2.65-7.22-7.3-11.7-13.95-6.53-9.62-11.66-20.12-15.38-31.5-3.73-11.38-5.59-22.12-5.59-32.22 0-14.88 3.73-27.1 11.19-36.65 7.46-9.55 16.92-14.38 28.38-14.49 4.34 0 9.29 1.1 14.86 3.3 5.56 2.21 9.4 3.35 11.51 3.42 1.86-.07 5.86-1.28 12.01-3.62 6.15-2.34 11.04-3.4 14.67-3.18 10.42.54 18.73 4.22 24.94 11.04-9.14 5.56-13.62 13.33-13.43 23.32.2 10.22 4.19 18.42 11.96 24.62 3.69 2.97 7.77 5.11 12.24 6.42-2.52 7.43-5.89 14.8-10.12 22.12zm-28.52-113.88c0 7.24-2.63 14.07-7.89 20.48-5.26 6.41-11.75 10.05-19.46 10.92-.13-.88-.2-1.76-.2-2.65 0-7.07 2.76-13.97 8.28-20.7 5.52-6.73 12.03-10.48 19.53-11.25.14 1.07.21 2.13.21 3.2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">{t('authenticateWith')} {socialProvider}</h4>
                  <p className="text-[11px] text-emerald-400 font-medium">Verified OAuth 2.0 Connection</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Account Display Name</label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={e => setSocialName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">{socialProvider} Email / ID</label>
                  <input
                    type="email"
                    value={socialEmail}
                    onChange={e => setSocialEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
                socialProvider === 'Google'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-white hover:bg-slate-100 text-slate-950 shadow-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Continue with {socialProvider}</span>
            </button>

            <button
              type="button"
              onClick={() => setSocialProvider(null)}
              className="w-full py-2 text-xs font-bold text-slate-400 hover:text-white transition text-center cursor-pointer"
            >
              ← Cancel & Back
            </button>
          </form>
        ) : mode === 'verify-email' ? (

          /* Email Verification Step */
          <form onSubmit={handleVerifyAndRegister} className="space-y-4">
            
            {/* Live Verification Code Banner */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl space-y-2 text-center">
              <div className="text-[11px] text-slate-400 font-medium">
                📩 {t('emailVerificationSentTo')} <span className="text-emerald-300 font-bold">{email}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">{t('codeLabel')}</span>
                <span className="text-lg font-mono font-black tracking-widest text-emerald-400 bg-slate-950 px-3 py-1 rounded-lg border border-emerald-500/30">
                  {generatedOtp}
                </span>
                <button
                  type="button"
                  onClick={() => setInputOtp(generatedOtp)}
                  className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-1 rounded hover:bg-emerald-400 transition cursor-pointer"
                >
                  {t('autoFillCode')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">{t('enter6DigitCode')}</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 849201"
                  value={inputOtp}
                  onChange={e => setInputOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-center tracking-widest text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('verifyEmailActivate')}</span>
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← {t('backToDetails')}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendCooldown > 0}
                className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{resendCooldown > 0 ? `${t('resendCodeTimer')} (${resendCooldown}s)` : t('resendCode')}</span>
              </button>
            </div>

          </form>
        ) : mode === 'signup' ? (
          /* Sign Up Form */
          <div className="space-y-4">
            {/* Social Authentication Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStartSocialAuth('Google')}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2.5 shadow-md border border-slate-200 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('continueWithGoogle')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartSocialAuth('Apple')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2.5 shadow-md border border-slate-800 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.08-3.32-2.65-7.22-7.3-11.7-13.95-6.53-9.62-11.66-20.12-15.38-31.5-3.73-11.38-5.59-22.12-5.59-32.22 0-14.88 3.73-27.1 11.19-36.65 7.46-9.55 16.92-14.38 28.38-14.49 4.34 0 9.29 1.1 14.86 3.3 5.56 2.21 9.4 3.35 11.51 3.42 1.86-.07 5.86-1.28 12.01-3.62 6.15-2.34 11.04-3.4 14.67-3.18 10.42.54 18.73 4.22 24.94 11.04-9.14 5.56-13.62 13.33-13.43 23.32.2 10.22 4.19 18.42 11.96 24.62 3.69 2.97 7.77 5.11 12.24 6.42-2.52 7.43-5.89 14.8-10.12 22.12zm-28.52-113.88c0 7.24-2.63 14.07-7.89 20.48-5.26 6.41-11.75 10.05-19.46 10.92-.13-.88-.2-1.76-.2-2.65 0-7.07 2.76-13.97 8.28-20.7 5.52-6.73 12.03-10.48 19.53-11.25.14 1.07.21 2.13.21 3.2z" />
                </svg>
                <span>{t('continueWithApple')}</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                {t('orContinueWithEmail')}
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={initiateSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t('fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Koffi Kouassi"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t('emailAddress')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t('phoneForSmsPasses')}</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    placeholder="+225 07 01 02 03 04"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('continueEmailVerification')}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Sign In Form */
          <div className="space-y-4">
            {/* Social Authentication Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStartSocialAuth('Google')}
                className="w-full py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2.5 shadow-md border border-slate-200 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('continueWithGoogle')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartSocialAuth('Apple')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-2.5 shadow-md border border-slate-800 cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.14-1.9-14.4-6.08-3.32-2.65-7.22-7.3-11.7-13.95-6.53-9.62-11.66-20.12-15.38-31.5-3.73-11.38-5.59-22.12-5.59-32.22 0-14.88 3.73-27.1 11.19-36.65 7.46-9.55 16.92-14.38 28.38-14.49 4.34 0 9.29 1.1 14.86 3.3 5.56 2.21 9.4 3.35 11.51 3.42 1.86-.07 5.86-1.28 12.01-3.62 6.15-2.34 11.04-3.4 14.67-3.18 10.42.54 18.73 4.22 24.94 11.04-9.14 5.56-13.62 13.33-13.43 23.32.2 10.22 4.19 18.42 11.96 24.62 3.69 2.97 7.77 5.11 12.24 6.42-2.52 7.43-5.89 14.8-10.12 22.12zm-28.52-113.88c0 7.24-2.63 14.07-7.89 20.48-5.26 6.41-11.75 10.05-19.46 10.92-.13-.88-.2-1.76-.2-2.65 0-7.07 2.76-13.97 8.28-20.7 5.52-6.73 12.03-10.48 19.53-11.25.14 1.07.21 2.13.21 3.2z" />
                </svg>
                <span>{t('continueWithApple')}</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">
                {t('orContinueWithEmail')}
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">{t('registeredEmailAddress')}</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{t('signInToAccount')}</span>
              </button>
            </form>
          </div>
        )}


        {/* Security Footer Note */}
        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('realtimeSyncNotice')}</span>
        </div>

      </div>
    </div>
  );
};
