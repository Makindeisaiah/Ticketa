import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Receipt, 
  Bell, 
  Sliders, 
  Boxes, 
  Scale, 
  ArrowLeft, 
  Upload, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  ExternalLink,
  Copy,
  Check,
  Ticket,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  LogOut
} from 'lucide-react';

type SettingsSubpage = 
  | 'grid'
  | 'organization-profile'
  | 'team-permissions'
  | 'account-security'
  | 'payments-payouts'
  | 'billing-subscription'
  | 'notifications'
  | 'default-event-settings'
  | 'integrations'
  | 'legal-compliance';

interface SettingsTabProps {
  onLogout?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onLogout }) => {
  const { orders } = useEventContext();
  const calculatedTotalEarnings = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const [activeSubpage, setActiveSubpage] = useState<SettingsSubpage>('grid');
  const [paymentsTab, setPaymentsTab] = useState<'overview' | 'payouts' | 'refunds'>('overview');

  // Organization Info State
  const [orgName, setOrgName] = useState('Event Organizer');
  const [orgType, setOrgType] = useState('Company');
  const [orgDesc, setOrgDesc] = useState('Live event and ticketing management organization.');
  const [orgCountry, setOrgCountry] = useState('Nigeria');
  const [orgCity, setOrgCity] = useState('Lagos');
  const [orgAddress, setOrgAddress] = useState('146 Freedom Way, Victoria Island');
  const [supportEmail, setSupportEmail] = useState('contact@ticketa.com');
  const [phone, setPhone] = useState('+2349048372638');
  const [website, setWebsite] = useState('ticketa.com');
  const [instagram, setInstagram] = useState('flytimefest');
  const [facebook, setFacebook] = useState('flytimefest');
  const [twitter, setTwitter] = useState('flytimefest');

  // Team Members State
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Makinde Isaiah', email: 'info@makindeisaiah.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Makinde Isaiah', email: 'info@makindeisaiah.com', role: 'Organizer', status: 'Active' },
    { id: '3', name: 'Makinde Isaiah', email: 'info@makindeisaiah.com', role: 'Finance', status: 'Active' },
    { id: '4', name: 'Makinde Isaiah', email: 'info@makindeisaiah.com', role: 'Gate Staff', status: 'Pending' },
    { id: '5', name: 'Makinde Isaiah', email: 'info@makindeisaiah.com', role: 'Support', status: 'Active' },
  ]);

  // Flutterwave Config State
  const [showFlwModal, setShowFlwModal] = useState(false);
  const [flwPublicKey, setFlwPublicKey] = useState('FLWPUBK_TEST-SANDBOXDEMOKEY-X');
  const [flwSecretKey, setFlwSecretKey] = useState('FLWSECK_TEST-••••••••••••••••');
  const [flwMode, setFlwMode] = useState<'Test' | 'Live'>('Test');

  // Toast / notification state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00C896] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Grid View */}
      {activeSubpage === 'grid' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Monitor event entry, team access, payments, and global organizer settings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Organization Profile */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Organization Profile</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your organization details and public organizer information.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('organization-profile')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Update Profile
              </button>
            </div>

            {/* 2. Team & Permissions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Team & Permissions</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Invite team member and control access across your event.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('team-permissions')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Manage Team
              </button>
            </div>

            {/* 3. Account & Security */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Account & Security</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Secure your account and manage login preferences.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('account-security')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Security Settings
              </button>
            </div>

            {/* 4. Payments & Payouts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Payments & Payouts</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Setup how you receive earnings from ticket sales.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('payments-payouts')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Configure Payments
              </button>
            </div>

            {/* 5. Billing & Subscription */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Billing & Subscription</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage your subscription plan and billing information.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('billing-subscription')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Manage Subscription
              </button>
            </div>

            {/* 6. Notification */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Notification</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Control how and when you receive platform alerts.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('notifications')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Manage Notifications
              </button>
            </div>

            {/* 7. Default Event Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Default Event Settings</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Set default rules applied to newly created events.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('default-event-settings')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Edit Defaults
              </button>
            </div>

            {/* 8. Integrations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Integrations</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Connect external tools to extend your event workflow.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('integrations')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                View Integrations
              </button>
            </div>

            {/* 9. Legal & Compliance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Legal & Compliance</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Manage legal requirements and compliance settings.
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('legal-compliance')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4"
              >
                Manage Legal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUBPAGE 1: Organization Profile */}
      {activeSubpage === 'organization-profile' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
            </button>
            <span>/</span>
            <span className="text-slate-900 font-extrabold">Organization Info</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs font-semibold">
              <h2 className="text-base font-extrabold text-slate-900">Organization Info</h2>
              
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
                  FF
                </div>
                <div>
                  <button className="px-3 py-1.5 bg-[#00C896] text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" /> Upload New Logo
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or GIF. 500x500px recommend</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Organizer Type</label>
                <select
                  value={orgType}
                  onChange={e => setOrgType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                >
                  <option value="Company">Company</option>
                  <option value="Individual">Individual</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={orgDesc}
                  onChange={e => setOrgDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3">Address</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Country</label>
                    <input type="text" value={orgCountry} onChange={e => setOrgCountry(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">City / State</label>
                    <input type="text" value={orgCity} onChange={e => setOrgCity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Business Address</label>
                    <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs font-semibold">
                <h2 className="text-base font-extrabold text-slate-900">Contact Details</h2>
                <div>
                  <label className="block text-slate-700 mb-1">Support Email</label>
                  <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Website</label>
                  <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Instagram</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">Verification Status</h3>
                <div className="space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Verified Organizer</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Email Verified</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Phone number verified</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> Website verified</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> All social account verified</div>
                </div>
              </div>

              <button
                onClick={() => showToast('Organization details updated successfully!')}
                className="w-full py-3 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-md"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 2: Team & Permissions */}
      {activeSubpage === 'team-permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Team & Permissions
            </button>
            <button
              onClick={() => showToast('Invite link generated!')}
              className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Invite Team Member
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">Team Members</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                            MI
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{m.name}</div>
                            <div className="text-[10px] text-slate-400">{m.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            m.role === 'Admin' ? 'bg-amber-100 text-amber-800' :
                            m.role === 'Organizer' ? 'bg-lime-100 text-lime-800' :
                            m.role === 'Finance' ? 'bg-purple-100 text-purple-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            m.status === 'Active' ? 'bg-emerald-100 text-[#00C896]' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button className="p-1.5 text-slate-400 hover:text-slate-800"><Edit className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">Permission Levels</h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-amber-800">Admin</div>
                  <p className="text-[10px] text-slate-500">Full platform access, team management, payouts, billing.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-lime-800">Organizer</div>
                  <p className="text-[10px] text-slate-500">Create & manage events, set pricing, view sales.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-purple-800">Finance / Accountant</div>
                  <p className="text-[10px] text-slate-500">View revenue, payouts, refund approvals.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-blue-800">Check-in Staff</div>
                  <p className="text-[10px] text-slate-500">Scan ticket passes & gate manual check-ins.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 3: Account & Security */}
      {activeSubpage === 'account-security' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Account & Security
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">Account Info</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 mb-1">Name</label>
                <input type="text" defaultValue="Makinde Isaiah" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Email</label>
                <input type="email" defaultValue="info@makindeisaiah.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-900">Password</h4>
                <p className="text-[10px] text-slate-400">Last changed 3 months ago</p>
              </div>
              <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs">
                Change Password
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="font-extrabold text-slate-900">Two-Factor Authentication (2FA)</h4>
              <p className="text-[10px] text-slate-500">Add an extra layer of security using an Authenticator app or SMS code.</p>
              <button 
                onClick={() => showToast('2FA settings enabled')} 
                className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm mt-1"
              >
                Manage 2FA
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-extrabold text-slate-900">Devices & Activity</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Chrome - Windows (Lagos, Nigeria)</div>
                  <div className="text-[10px] text-slate-400">Active now</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#00C896] font-bold rounded text-[10px]">Active</span>
              </div>
            </div>

            {onLogout && (
              <div className="pt-4 border-t border-rose-100 space-y-2">
                <h4 className="font-extrabold text-rose-600">Account Session</h4>
                <p className="text-[10px] text-slate-500">Log out of your organizer session on this browser.</p>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Log Out of Organizer Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBPAGE 4: Payments & Payouts */}
      {/* SUBPAGE 4: Payments & Payouts */}
      {activeSubpage === 'payments-payouts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 border-b border-slate-200 w-full sm:w-auto">
              <button 
                onClick={() => setPaymentsTab('overview')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${paymentsTab === 'overview' ? 'border-[#00C896] text-[#00C896]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Overview
              </button>
              <button 
                onClick={() => setPaymentsTab('payouts')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${paymentsTab === 'payouts' ? 'border-[#00C896] text-[#00C896]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Payouts
              </button>
              <button 
                onClick={() => setPaymentsTab('refunds')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${paymentsTab === 'refunds' ? 'border-[#00C896] text-[#00C896]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Refunds & Fees
              </button>
            </div>
            
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
            </button>
          </div>

          {paymentsTab === 'overview' && (
            <div className="space-y-6">
              {/* QuickPay Banner */}
              <div className="bg-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-black text-xs">QP</div>
                  <span className="text-emerald-900 font-semibold text-sm">QuickPay is connected for processing payments</span>
                </div>
                <button className="px-4 py-2 bg-[#00C896] text-white rounded-xl text-xs font-bold hover:bg-[#00b386] transition shrink-0">
                  Manage QuickPay Account
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Ticket className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Available Balance</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">₦{Math.round(calculatedTotalEarnings * 0.975).toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><CheckCircle2 className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Pending Balance</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">₦0</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Receipt className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Total Earning</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">₦{calculatedTotalEarnings.toLocaleString()}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Clock className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Next Payout Date</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">Post-Event Payout</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-6">
                  {/* Payment Gateways */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">Payment Gateways</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">QP</div>
                        <span className="font-extrabold text-slate-900">QuickPay</span>
                      </div>
                      <button className="px-4 py-2 bg-[#00C896] text-white rounded-xl text-xs font-bold hover:bg-[#00b386] transition">Manage</button>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">Connected gateway that processes ticket payments.</p>
                  </div>

                  {/* Payout Destination */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">Payout Destination</h3>
                    <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-[10px] font-bold">GTBank</div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">GTBank **** 5399</div>
                          <div className="text-xs text-slate-500">Account Holder: Event Organizer</div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-[#00C896] text-white rounded-lg text-xs font-bold hover:bg-[#00b386] transition">Edit</button>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Payment secured and encrypted via QuickPay
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Payment History</h3>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search payouts..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                    </div>
                    <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                      <option>Filter: All</option>
                    </select>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                      <thead>
                        <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2 font-extrabold rounded-l-lg">Date</th>
                          <th className="px-3 py-2 font-extrabold">Amount</th>
                          <th className="px-3 py-2 font-extrabold">Bank Account</th>
                          <th className="px-3 py-2 font-extrabold">Status</th>
                          <th className="px-3 py-2 font-extrabold text-center rounded-r-lg"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { date: 'Nov 19, 2025', amount: '₦1,466,866,000', bank: 'GTBank **** 5399', status: 'Pending' },
                          { date: 'Oct 10, 2025', amount: '₦850,538,000', bank: 'GTBank **** 5399', status: 'Paid' },
                          { date: 'July 30, 2025', amount: '₦904,866,000', bank: 'GTBank **** 5399', status: 'Paid' },
                          { date: 'Mar 27, 2025', amount: '₦450,100,000', bank: 'GTBank **** 5399', status: 'Paid' },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-3 text-slate-500">{row.date}</td>
                            <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                            <td className="px-3 py-3">{row.bank}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500">Showing 1 to 4 of 20</span>
                    <div className="flex items-center gap-1">
                      <button className="w-6 h-6 rounded flex items-center justify-center bg-amber-400 text-white"><ChevronLeft className="w-4 h-4" /></button>
                      <button className="w-6 h-6 rounded flex items-center justify-center bg-[#00C896] text-white font-bold text-[10px]">1</button>
                      <button className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-[10px]">2</button>
                      <button className="w-6 h-6 rounded flex items-center justify-center bg-amber-400 text-white"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentsTab === 'payouts' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Col */}
              <div className="lg:col-span-5 space-y-6">
                {/* Payout Settings */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">Payout Settings</h3>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                      <Calendar className="w-4 h-4 text-slate-500" /> Post-Event Payout
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3 ml-6">Funds are released automatically after your event is completed</p>
                    <ul className="space-y-1.5 text-xs text-[#00C896] font-bold ml-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Funds released 48 hours after event end date</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Refund & fees deducted before payout</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Payout sent to your connected bank account</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Funds Locked - Next payout calculated based on event end date
                  </div>
                </div>

                {/* Payout Summary */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="bg-[#00C896] text-white p-4 font-extrabold text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Total Paid Out
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-3xl font-black text-slate-900 font-mono">₦{Math.round(calculatedTotalEarnings * 0.975).toLocaleString()}</div>
                    <p className="text-xs font-semibold text-slate-500">Next payout calculated on event end date</p>
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Funds Locked
                    </div>
                    <button className="text-[#00C896] text-[10px] font-bold flex items-center gap-1 hover:underline">
                      Next payout calculated based on event end date <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col */}
              <div className="lg:col-span-7 space-y-6">
                {/* Payout Destination */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">Payout Destination</h3>
                  <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded flex items-center justify-center text-white text-xs font-bold">GTBank</div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">GTBank **** 5399</div>
                        <div className="text-xs text-slate-500">Event Organizer</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-[#00C896] text-white rounded text-xs font-bold">NGN</div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 mb-1">Country</span>
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <div className="w-4 h-3 bg-green-600 flex"><div className="w-1/3 bg-white h-full mx-auto" /></div>
                      Nigeria
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">Payment History</h3>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Search payouts..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                    </div>
                    <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                      <option>Filter: All</option>
                    </select>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                      <thead>
                        <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2 font-extrabold rounded-l-lg">Payout Date</th>
                          <th className="px-3 py-2 font-extrabold">Amount</th>
                          <th className="px-3 py-2 font-extrabold">Bank Account</th>
                          <th className="px-3 py-2 font-extrabold">Status</th>
                          <th className="px-3 py-2 font-extrabold text-center rounded-r-lg"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { date: 'Nov 19, 2025', amount: '₦1,466,866,000', bank: 'GTBank **** 5399', status: 'Pending' },
                          { date: 'Oct 10, 2025', amount: '₦850,538,000', bank: 'GTBank **** 5399', status: 'Paid' },
                          { date: 'July 30, 2025', amount: '₦904,866,000', bank: 'GTBank **** 5399', status: 'Paid' },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-3 text-slate-500">{row.date}</td>
                            <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                            <td className="px-3 py-3">{row.bank}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">View</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentsTab === 'refunds' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Refund Rules */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900">Refund Rules</h3>
                    <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">Edit Refund Rules</button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Calendar className="w-4 h-4 text-[#00C896]" /> Refund Window
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">Up to 1 day before the event</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Receipt className="w-4 h-4 text-[#00C896]" /> Refund Fees
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">Organizer pays refund fees</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <CreditCard className="w-4 h-4 text-[#00C896]" /> Refund Method
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">Refund to original payment method</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Building2 className="w-4 h-4 text-[#00C896]" /> Partial Refunds
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">Allowed (custom amount)</div>
                    </div>
                  </div>
                </div>

                {/* Fees Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 flex flex-col justify-center">
                  <h3 className="text-base font-extrabold text-slate-900">Fees Breakdown</h3>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">Total Refunded</span>
                    <span className="font-mono text-sm font-black text-slate-900">₦3,653,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">5% per paid ticket</span>
                    <span className="text-xs font-bold text-slate-900">245 Tickets</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">₦10 + 2% per paid ticket</span>
                    <span className="text-xs font-bold text-slate-900">₦1,567,000</span>
                  </div>
                </div>
              </div>

              {/* Payment History (Refunds) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-900 mb-4">Payment History</h3>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search payouts..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                  </div>
                  <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                    <option>Filter: All</option>
                  </select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                    <thead>
                      <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                        <th className="px-3 py-2 font-extrabold rounded-l-lg">Refund Date</th>
                        <th className="px-3 py-2 font-extrabold">Ticket ID</th>
                        <th className="px-3 py-2 font-extrabold">Amount</th>
                        <th className="px-3 py-2 font-extrabold">Reason</th>
                        <th className="px-3 py-2 font-extrabold">Status</th>
                        <th className="px-3 py-2 font-extrabold text-center rounded-r-lg">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { date: 'Nov 19, 2025', ticket: 'TKA-4553353', amount: '₦1,466,866,000', reason: 'Event Canceled', status: 'Pending' },
                        { date: 'Oct 10, 2025', ticket: 'TKA-4553473', amount: '₦850,538,000', reason: 'Scheduling Conflict', status: 'Paid' },
                        { date: 'July 30, 2025', ticket: 'TKA-4553474', amount: '₦904,866,000', reason: 'Medical Emergency', status: 'Paid' },
                        { date: 'Mar 27, 2025', ticket: 'TKA-4677786', amount: '₦450,100,000', reason: 'Event Canceled', status: 'Paid' },
                        { date: 'Mar 27, 2025', ticket: 'TKA-7757890', amount: '₦450,100,000', reason: 'Scheduling Conflict', status: 'Paid' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-slate-500">{row.date}</td>
                          <td className="px-3 py-3 font-mono text-slate-900">{row.ticket}</td>
                          <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                          <td className="px-3 py-3">{row.reason}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === 'Pending' ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
      {/* SUBPAGE 5: Billing & Subscription */}
      {activeSubpage === 'billing-subscription' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Billing & Subscription
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#00C896] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">Pro Plan</h3>
                <span className="px-2.5 py-1 bg-emerald-100 text-[#00C896] font-extrabold rounded-full text-[10px]">Current Plan</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">₦250,000 <span className="text-xs text-slate-500 font-normal">/ month</span></div>
              <ul className="text-xs space-y-2 text-slate-600 font-semibold">
                <li>✓ Unlimited active events</li>
                <li>✓ Reduced ticket fees (2.5%)</li>
                <li>✓ Advanced check-ins (QR + manual)</li>
                <li>✓ Team & permissions module</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 opacity-75">
              <h3 className="text-lg font-black text-slate-900">Starter Plan</h3>
              <div className="text-2xl font-black text-slate-900 font-mono">FREE</div>
              <ul className="text-xs space-y-2 text-slate-600 font-semibold">
                <li>✓ 1 active event limit</li>
                <li>✓ Standard ticket fees (5%)</li>
                <li>✓ Basic check-ins</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 6: Notifications */}
      {activeSubpage === 'notifications' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Notifications
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">Event Notifications</h2>
            
            {[
              { label: 'Event published / unpublished', email: true, app: true },
              { label: 'Event approved / rejected', email: true, app: true },
              { label: 'Low ticket capacity warnings', email: true, app: true },
              { label: 'Payout processed confirmation', email: true, app: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-800">{item.label}</span>
                <div className="flex space-x-4">
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked={item.email} /> Email</label>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked={item.app} /> In-App</label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBPAGE 7: Default Event Settings */}
      {activeSubpage === 'default-event-settings' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Default Event Settings
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">Default Rules for New Events</h2>
            <div>
              <label className="block text-slate-700 mb-1">Default Event Details</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option>Public Event</option>
                <option>Private Event</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Time Zone</label>
              <input type="text" defaultValue="(GMT+1) West Central Africa" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <button onClick={() => showToast('Defaults saved')} className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm">
              Save Defaults
            </button>
          </div>
        </div>
      )}

      {/* SUBPAGE 8: Integrations */}
      {activeSubpage === 'integrations' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Integrations
          </button>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
             <h2 className="text-base font-extrabold text-slate-900">Connected Apps</h2>
             <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Mailchimp</div>
                  <div className="text-slate-500">Sync attendees to lists</div>
                </div>
                <button className="px-3 py-1.5 border border-slate-200 bg-white font-bold rounded-lg hover:bg-slate-100">Connect</button>
             </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 9: Legal & Compliance */}
      {activeSubpage === 'legal-compliance' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings / Legal & Compliance
          </button>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
             <h2 className="text-base font-extrabold text-slate-900">Legal Documents</h2>
             <p className="text-slate-500">Update your terms and conditions for ticket buyers.</p>
             <textarea className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Terms & Conditions..."></textarea>
             <button className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl shadow-sm">Save Documents</button>
          </div>
        </div>
      )}
    </div>
  );
};
