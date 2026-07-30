import React, { useState } from 'react';
import { Ticket, ShieldCheck, ArrowRight, Lock, Mail, Building2, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { useEventContext } from '../../context/EventContext';

interface OrganizerLoginProps {
  onLoginSuccess: (organizerData: { name: string; email: string }) => void;
}

export const OrganizerLogin: React.FC<OrganizerLoginProps> = ({ onLoginSuccess }) => {
  const { loginOrganizer, registerOrganizer } = useEventContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [orgName, setOrgName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Concerts & Festivals');
  const [regPassword, setRegPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your organizer email and password.');
      return;
    }

    const orgUser = loginOrganizer(email.trim());
    if (orgUser) {
      onLoginSuccess({
        name: orgUser.organizationName,
        email: orgUser.email
      });
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in all required organization fields.');
      return;
    }

    const orgUser = registerOrganizer({
      organizationName: orgName.trim(),
      email: regEmail.trim(),
      phone: phone.trim(),
      category: category
    });

    if (orgUser) {
      onLoginSuccess({
        name: orgUser.organizationName,
        email: orgUser.email
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl shadow-xl">
            <div className="w-8 h-8 rounded-xl bg-[#00C896] text-white flex items-center justify-center font-bold shadow-md shadow-[#00C896]/30">
              <Ticket className="w-5 h-5 rotate-[-12deg]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">TICKETA</span>
            <span className="text-[10px] font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full uppercase border border-[#00C896]/20">
              Organizer
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Organizer Sign In' : 'Register Organization'}
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'login' 
              ? 'Access your event ticketing, sales metrics, and gate scanners.' 
              : 'Host concerts, tech summits, or festivals and get paid fast.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'login'
                ? 'bg-[#00C896] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              mode === 'register'
                ? 'bg-[#00C896] text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Host
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* SIGN IN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Organizer Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="info@yourcompany.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                  className="rounded border-slate-700 text-[#00C896] focus:ring-0 bg-slate-950" 
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={e => e.preventDefault()} className="text-[#00C896] hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00C896] hover:bg-[#00b386] text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-[#00C896]/20 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Organization Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Events Ltd"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Official Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="organizer@company.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Phone</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+234 800..."
                    className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#00C896]"
                >
                  <option value="Concerts & Festivals">Concerts & Festivals</option>
                  <option value="Tech Summits">Tech Summits</option>
                  <option value="Comedy & Theatre">Comedy & Theatre</option>
                  <option value="Sports & Gaming">Sports & Gaming</option>
                  <option value="Corporate & Networking">Corporate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Create strong password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#00C896] hover:bg-[#00b386] text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-[#00C896]/20 flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <span>Create Organizer Account</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-slate-500 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#00C896]" />
          <span>Encrypted Session & Verification Guaranteed</span>
        </div>

      </div>
    </div>
  );
};
