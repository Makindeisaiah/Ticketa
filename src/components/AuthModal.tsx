import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { useLanguage } from '../utils/translations';
import { X, UserPlus, LogIn, CheckCircle2, User, Mail, Phone, Lock, Sparkles, ShieldCheck, KeyRound, RefreshCw, Check } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signup' }) => {
  const { t } = useLanguage();
  const { registerUser, loginUser, currentUser, logoutUser, orders } = useEventContext();
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

  if (!isOpen) return null;

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
                  <span className="font-bold text-teal-300">{totalSpentAmount.toLocaleString()} FCFA</span>
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
        ) : (
          /* Sign In Form */
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
