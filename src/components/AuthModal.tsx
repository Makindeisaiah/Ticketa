import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { X, UserPlus, LogIn, CheckCircle2, User, Mail, Phone, Lock, Sparkles, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signup' | 'login';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'signup' }) => {
  const { registerUser, loginUser, currentUser, logoutUser } = useEventContext();
  const [mode, setMode] = useState<'signup' | 'login'>(defaultMode);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all fields (Full Name, Email, and Phone).');
      return;
    }

    registerUser({ fullName, email, phone });
    onClose();
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
            {mode === 'signup' ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {currentUser 
              ? `Account Profile` 
              : mode === 'signup' 
                ? 'Create Ticketa Account' 
                : 'Sign In to Ticketa'
            }
          </h2>
          <p className="text-xs text-slate-400">
            {currentUser
              ? 'Manage your pass wallet, contact info and order history'
              : mode === 'signup'
                ? 'Register a fresh account with a clean ticket pass profile'
                : 'Access your ticket wallet and order passes'
            }
          </p>
        </div>

        {/* Mode Selector Switcher */}
        {!currentUser && (
          <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                mode === 'signup' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Error message */}
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
                  <h3 className="font-bold text-white text-sm">{currentUser.fullName}</h3>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-800/80 text-xs">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Orders</span>
                  <span className="font-bold text-emerald-400">{currentUser.totalOrders}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Spent</span>
                  <span className="font-bold text-teal-300">₦{currentUser.totalSpent.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logoutUser();
                onClose();
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition"
            >
              Sign Out of Account
            </button>
          </div>
        ) : mode === 'signup' ? (
          /* Sign Up Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Chukwuma Isaiah"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
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
              <label className="block text-xs font-bold text-slate-300 mb-1">Phone Number (for SMS Passes)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  placeholder="+234 812 345 6789"
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
              <span>Create Account (Clean Slate)</span>
            </button>
          </form>
        ) : (
          /* Sign In Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Registered Email Address</label>
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
              <span>Sign In to Account</span>
            </button>
          </form>
        )}

        {/* Security Footer Note */}
        <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-2 border-t border-slate-800/80">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Real-time Sync with Firebase Firestore & Twilio SMS Service</span>
        </div>

      </div>
    </div>
  );
};
