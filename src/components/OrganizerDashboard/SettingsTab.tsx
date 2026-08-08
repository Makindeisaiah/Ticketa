import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { useLanguage } from '../../utils/translations';
import { formatOrganizerCurrency, getOrganizerCurrencyConfig } from '../../utils/currency';
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
  LogOut,
  Database,
  X
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
  const { t } = useLanguage();
  const { orders, currentOrganizer, events } = useEventContext();
  const calculatedTotalEarnings = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  const [activeSubpage, setActiveSubpage] = useState<SettingsSubpage>('grid');
  const [paymentsTab, setPaymentsTab] = useState<'overview' | 'payouts' | 'refunds'>('overview');

  // Organization Info State
  const [orgName, setOrgName] = useState('Event Organizer');
  const [orgType, setOrgType] = useState('Company');
  const [orgDesc, setOrgDesc] = useState('Live event and ticketing management organization.');
  const [orgCountry, setOrgCountry] = useState("Côte d'Ivoire");
  const [orgCity, setOrgCity] = useState('Abidjan');
  const [orgAddress, setOrgAddress] = useState('Boulevard de la République, Plateau');
  const [supportEmail, setSupportEmail] = useState('contact@ticketa.com');
  const [phone, setPhone] = useState('+2250701020304');
  const [website, setWebsite] = useState('ticketa.com');
  const [instagram, setInstagram] = useState('flytimefest');
  const [facebook, setFacebook] = useState('flytimefest');
  const [twitter, setTwitter] = useState('flytimefest');

  // Team Members State & Modals
  interface TeamMemberItem {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Organizer' | 'Finance' | 'Gate Staff';
    status: 'Active' | 'Pending';
    assignedGate?: string;
    pin?: string;
  }

  const defaultAdminEmail = currentOrganizer?.email || 'makindeisaiah2002@gmail.com';
  const defaultAdminName = currentOrganizer?.organizationName || 'Organizer Admin';

  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>(() => {
    try {
      const saved = localStorage.getItem('tix_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out old demo members with info@makindeisaiah.com repeated
          const clean = parsed.filter((m: any) => m && m.email);
          if (clean.length > 0) return clean;
        }
      }
    } catch {}
    return [
      {
        id: 'owner-admin-1',
        name: defaultAdminName,
        email: defaultAdminEmail,
        role: 'Admin',
        status: 'Active',
        assignedGate: 'All Gates',
        pin: '1234'
      }
    ];
  });

  // Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMemberItem | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'Admin' | 'Organizer' | 'Finance' | 'Gate Staff'>('Gate Staff');
  const [formGate, setFormGate] = useState('Main Gate');
  const [formPin, setFormPin] = useState('1234');

  const saveTeamList = (newList: TeamMemberItem[]) => {
    setTeamMembers(newList);
    localStorage.setItem('tix_team_members', JSON.stringify(newList));
  };

  const handleOpenInvite = () => {
    setEditingMember(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Gate Staff');
    setFormGate('Main Gate');
    setFormPin(Math.floor(1000 + Math.random() * 9000).toString());
    setIsInviteModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMemberItem) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email);
    setFormRole(member.role);
    setFormGate(member.assignedGate || 'Main Gate');
    setFormPin(member.pin || '1234');
    setIsInviteModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formEmail.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (editingMember) {
      const updated = teamMembers.map(m => m.id === editingMember.id ? {
        ...m,
        name: formName.trim() || formEmail.split('@')[0],
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        assignedGate: formGate,
        pin: formPin
      } : m);
      saveTeamList(updated);
      showToast('Team member updated successfully!');
    } else {
      const newMember: TeamMemberItem = {
        id: `team-${Date.now()}`,
        name: formName.trim() || formEmail.split('@')[0],
        email: formEmail.trim().toLowerCase(),
        role: formRole,
        status: 'Active',
        assignedGate: formGate,
        pin: formPin
      };
      saveTeamList([...teamMembers, newMember]);
      showToast(`Invite created and details saved for ${newMember.email}!`);
    }

    setIsInviteModalOpen(false);
  };

  const handleDeleteMember = (id: string, email: string) => {
    if (email.toLowerCase() === defaultAdminEmail.toLowerCase()) {
      showToast('Cannot remove primary organizer account.');
      return;
    }
    const updated = teamMembers.filter(m => m.id !== id);
    saveTeamList(updated);
    showToast('Team member removed.');
  };

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('settingsHeader')}</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {t('settingsSub')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Organization Profile */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('orgProfileTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('orgProfileSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('organization-profile')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('updateProfile')}
              </button>
            </div>

            {/* 2. Team & Permissions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('teamPermissionsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('teamPermissionsSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('team-permissions')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('manageTeam')}
              </button>
            </div>

            {/* 3. Account & Security */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('accountSecurityTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('accountSecuritySub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('account-security')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('securitySettingsBtn')}
              </button>
            </div>

            {/* 4. Payments & Payouts */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('paymentsPayoutsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('paymentsPayoutsSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('payments-payouts')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('configurePaymentsBtn')}
              </button>
            </div>

            {/* 5. Billing & Subscription */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Receipt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('billingSubscriptionTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('billingSubscriptionSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('billing-subscription')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('manageSubscriptionBtn')}
              </button>
            </div>

            {/* 6. Notification */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Bell className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('notificationTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('notificationSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('notifications')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('manageNotificationsBtn')}
              </button>
            </div>

            {/* 7. Default Event Settings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Sliders className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('defaultEventSettingsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('defaultEventSettingsSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('default-event-settings')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('configureDefaultsBtn')}
              </button>
            </div>

            {/* 8. Integrations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Boxes className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('integrationsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('integrationsSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('integrations')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('viewIntegrationsBtn')}
              </button>
            </div>

            {/* 9. Legal & Compliance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00C896] flex items-center justify-center font-bold mb-3 border border-teal-100">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">{t('legalComplianceTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('legalComplianceSub')}
                </p>
              </div>
              <button
                onClick={() => setActiveSubpage('legal-compliance')}
                className="w-full py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-sm mt-4 cursor-pointer"
              >
                {t('manageLegalBtn')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUBPAGE 1: Organization Profile */}
      {activeSubpage === 'organization-profile' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')}
            </button>
            <span>/</span>
            <span className="text-slate-900 font-extrabold">{t('organizationInfo')}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs font-semibold">
              <h2 className="text-base font-extrabold text-slate-900">{t('organizationInfo')}</h2>
              
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-md">
                  FF
                </div>
                <div>
                  <button className="px-3 py-1.5 bg-[#00C896] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" /> {t('uploadNewLogo')}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">{t('logoDimensions')}</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('organizationName')}</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('organizerType')}</label>
                <select
                  value={orgType}
                  onChange={e => setOrgType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                >
                  <option value="Company">{t('corporateBrand')}</option>
                  <option value="Individual">{t('individualHost')}</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">{t('descriptionLabel')}</label>
                <textarea
                  rows={3}
                  value={orgDesc}
                  onChange={e => setOrgDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 mb-3">{t('addressHeader')}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-700 mb-1">{t('country')}</label>
                    <input type="text" value={orgCountry} onChange={e => setOrgCountry(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">{t('cityStateLabel')}</label>
                    <input type="text" value={orgCity} onChange={e => setOrgCity(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">{t('businessAddressLabel')}</label>
                    <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 text-xs font-semibold">
                <h2 className="text-base font-extrabold text-slate-900">{t('contactDetails')}</h2>
                <div>
                  <label className="block text-slate-700 mb-1">{t('supportEmail')}</label>
                  <input type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('phoneNumber')}</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('website')}</label>
                  <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">{t('instagram')}</label>
                  <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">{t('verificationStatus')}</h3>
                <div className="space-y-2 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {t('verifiedOrganizer')}</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {t('emailVerified')}</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {t('phoneVerified')}</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {t('websiteVerified')}</div>
                  <div className="flex items-center gap-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> {t('socialVerified')}</div>
                </div>
              </div>

              <button
                onClick={() => showToast('Organization details updated successfully!')}
                className="w-full py-3 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer"
              >
                {t('saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 2: Team & Permissions */}
      {activeSubpage === 'team-permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500 cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('teamPermissionsTitle')}
            </button>
            <button
              onClick={handleOpenInvite}
              className="px-4 py-2 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition"
            >
              <Plus className="w-4 h-4" /> {t('inviteTeamMember')}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-base font-extrabold text-slate-900">{t('teamMembers')}</h2>
                <span className="text-xs font-bold text-slate-400">{teamMembers.length} Authorized Users</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">{t('memberCol')}</th>
                      <th className="py-3 px-4">{t('roleCol')}</th>
                      <th className="py-3 px-4">Gate / PIN</th>
                      <th className="py-3 px-4">{t('statusColTableHeader')}</th>
                      <th className="py-3 px-4 text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.map(m => {
                      const initials = m.name ? m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'TM';
                      return (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                              {initials}
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
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                            <div>{m.assignedGate || 'Main Gate'}</div>
                            {m.pin && <div className="text-[10px] text-slate-400 font-sans">PIN: {m.pin}</div>}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              m.status === 'Active' ? 'bg-emerald-100 text-[#00C896]' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              title="Edit Member"
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id, m.email)}
                              title="Remove Member"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-extrabold text-slate-900">{t('permissionLevels')}</h2>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-amber-800">Admin</div>
                  <p className="text-[10px] text-slate-500">{t('adminRoleDesc')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-lime-800">Organizer</div>
                  <p className="text-[10px] text-slate-500">{t('organizerRoleDesc')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-purple-800">Finance / Accountant</div>
                  <p className="text-[10px] text-slate-500">{t('financeRoleDesc')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="font-extrabold text-blue-800">Gate Staff / Scanner</div>
                  <p className="text-[10px] text-slate-500">Scanner platform access to check in attendees using assigned gate credentials.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Modal Form for Invite / Edit Team Member */}
          {isInviteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">
                    {editingMember ? 'Edit Team Member' : 'Invite Team Member'}
                  </h3>
                  <button
                    onClick={() => setIsInviteModalOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Adewale"
                      value={formName}
                      onChange={e => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Email Address (Login ID)</label>
                    <input
                      type="email"
                      required
                      placeholder="samuel@eventorganizer.com"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Role & Permissions</label>
                    <select
                      value={formRole}
                      onChange={e => setFormRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none"
                    >
                      <option value="Admin">Admin (Full Access)</option>
                      <option value="Organizer">Organizer (Manage Events & Tickets)</option>
                      <option value="Finance">Finance (View Sales & Payouts)</option>
                      <option value="Gate Staff">Gate Staff / Scanner (Check-in Platform)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Assigned Gate / Entrance</label>
                    <select
                      value={formGate}
                      onChange={e => setFormGate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none"
                    >
                      <option value="All Gates">All Gates / General Access</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="VIP Entrance">VIP Entrance</option>
                      <option value="Gate A">Gate A</option>
                      <option value="Gate B">Gate B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Scanner PIN / Password</label>
                    <input
                      type="text"
                      required
                      placeholder="1234"
                      value={formPin}
                      onChange={e => setFormPin(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#00C896] rounded-xl text-slate-900 outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Staff will use this PIN to log into the scanner platform.</p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInviteModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#00C896] hover:bg-[#00b386] text-white font-extrabold rounded-xl text-xs transition shadow-md cursor-pointer"
                    >
                      {editingMember ? 'Save Changes' : 'Send Invite & Save'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUBPAGE 3: Account & Security */}
      {activeSubpage === 'account-security' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('accountSecurityTitle')}
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">{t('accountInfo')}</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 mb-1">{t('fullName')}</label>
                <input type="text" defaultValue="Makinde Isaiah" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">{t('emailAddress')}</label>
                <input type="email" defaultValue="info@makindeisaiah.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <div>
                <h4 className="font-extrabold text-slate-900">{t('password')}</h4>
                <p className="text-[10px] text-slate-400">{t('lastChangedMonthsAgo')}</p>
              </div>
              <button className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl text-xs cursor-pointer">
                {t('changePassword')}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="font-extrabold text-slate-900">{t('twoFactorAuth')}</h4>
              <p className="text-[10px] text-slate-500">{t('twoFactorDesc')}</p>
              <button 
                onClick={() => showToast('2FA settings enabled')} 
                className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm mt-1 cursor-pointer"
              >
                {t('manage2FA')}
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="font-extrabold text-slate-900">{t('devicesActivity')}</h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900">Chrome - Windows (Abidjan, Côte d'Ivoire)</div>
                  <div className="text-[10px] text-slate-400">{t('activeNow')}</div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#00C896] font-bold rounded text-[10px]">{t('activeBadge')}</span>
              </div>
            </div>

            {onLogout && (
              <div className="pt-4 border-t border-rose-100 space-y-2">
                <h4 className="font-extrabold text-rose-600">{t('accountSession')}</h4>
                <p className="text-[10px] text-slate-500">{t('logOutSessionDesc')}</p>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold rounded-xl text-xs transition flex items-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>{t('logOutOrganizerPortal')}</span>
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
                {t('overviewTab')}
              </button>
              <button 
                onClick={() => setPaymentsTab('payouts')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${paymentsTab === 'payouts' ? 'border-[#00C896] text-[#00C896]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {t('payoutsTab')}
              </button>
              <button 
                onClick={() => setPaymentsTab('refunds')} 
                className={`pb-3 px-1 text-sm font-bold border-b-2 transition ${paymentsTab === 'refunds' ? 'border-[#00C896] text-[#00C896]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                {t('refundsFeesTab')}
              </button>
            </div>
            
            <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')}
            </button>
          </div>

          {paymentsTab === 'overview' && (
            <div className="space-y-6">
              {/* QuickPay Banner */}
              <div className="bg-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-black text-xs">QP</div>
                  <span className="text-emerald-900 font-semibold text-sm">{t('quickPayConnected')}</span>
                </div>
                <button className="px-4 py-2 bg-[#00C896] text-white rounded-xl text-xs font-bold hover:bg-[#00b386] transition shrink-0">
                  {t('manageQuickPay')}
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Ticket className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{t('availableBalance')}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">{formatOrganizerCurrency(Math.round(calculatedTotalEarnings * 0.975), currentOrganizer)}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><CheckCircle2 className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{t('availableBalance')}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">{formatOrganizerCurrency(0, currentOrganizer)}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Receipt className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{t('totalEarning')}</span>
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">{formatOrganizerCurrency(calculatedTotalEarnings, currentOrganizer)}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/10 flex items-center justify-center text-[#00C896]"><Clock className="w-4 h-4" /></div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">{t('nextPayoutDate')}</span>
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">{t('postEventPayout')}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-6">
                  {/* Payment Gateways */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">{t('paymentGateways')}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm">QP</div>
                        <span className="font-extrabold text-slate-900">QuickPay</span>
                      </div>
                      <button className="px-4 py-2 bg-[#00C896] text-white rounded-xl text-xs font-bold hover:bg-[#00b386] transition">{t('viewMore')}</button>
                    </div>
                    <p className="text-xs text-slate-500 font-semibold">{t('connectedGatewayDesc')}</p>
                  </div>

                  {/* Payout Destination */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                    <h3 className="text-base font-extrabold text-slate-900">{t('payoutDestination')}</h3>
                    <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white text-[10px] font-bold">GTBank</div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">GTBank **** 5399</div>
                          <div className="text-xs text-slate-500">{t('accountHolderLabel')}</div>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 bg-[#00C896] text-white rounded-lg text-xs font-bold hover:bg-[#00b386] transition">{t('back')}</button>
                    </div>
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> {t('paymentSecuredNotice')}
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">{t('paymentHistory')}</h3>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder={t('searchPayoutsPlaceholder')} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                    </div>
                    <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                      <option>{t('allStatusFilter')}</option>
                    </select>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                      <thead>
                        <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2 font-extrabold rounded-l-lg">{t('dateStatus')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('totalAmount')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('payoutDestination')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('statusColTableHeader')}</th>
                          <th className="px-3 py-2 font-extrabold text-center rounded-r-lg"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { date: 'Nov 19, 2025', amount: formatOrganizerCurrency(1466866000, currentOrganizer), bank: 'GTBank **** 5399', status: t('pendingStatus') },
                          { date: 'Oct 10, 2025', amount: formatOrganizerCurrency(850538000, currentOrganizer), bank: 'GTBank **** 5399', status: t('paidStatus') },
                          { date: 'July 30, 2025', amount: formatOrganizerCurrency(904866000, currentOrganizer), bank: 'GTBank **** 5399', status: t('paidStatus') },
                          { date: 'Mar 27, 2025', amount: formatOrganizerCurrency(450100000, currentOrganizer), bank: 'GTBank **** 5399', status: t('paidStatus') },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-3 text-slate-500">{row.date}</td>
                            <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                            <td className="px-3 py-3">{row.bank}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === t('pendingStatus') ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">{t('viewMore')}</button>
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
                  <h3 className="text-base font-extrabold text-slate-900">{t('payoutSettings')}</h3>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1">
                      <Calendar className="w-4 h-4 text-slate-500" /> {t('postEventPayout')}
                    </div>
                    <p className="text-[10px] text-slate-500 mb-3 ml-6">{t('fundsReleasedAuto')}</p>
                    <ul className="space-y-1.5 text-xs text-[#00C896] font-bold ml-6">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> {t('fundsReleased48h')}</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> {t('refundFeesDeducted')}</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> {t('payoutSentToBank')}</li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4" /> {t('fundsLockedNotice')}
                  </div>
                </div>

                {/* Payout Summary */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="bg-[#00C896] text-white p-4 font-extrabold text-sm flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> {t('totalPaidOut')}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="text-3xl font-black text-slate-900 font-mono">{formatOrganizerCurrency(Math.round(calculatedTotalEarnings * 0.975), currentOrganizer)}</div>
                    <p className="text-xs font-semibold text-slate-500">{t('nextPayoutCalculatedEnd')}</p>
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4" /> {t('fundsLockedNotice')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Col */}
              <div className="lg:col-span-7 space-y-6">
                {/* Payout Destination */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">{t('payoutDestination')}</h3>
                  <div className="flex items-center justify-between border border-slate-200 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-700 rounded flex items-center justify-center text-white text-xs font-bold">Ecobank</div>
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">Ecobank **** 5399</div>
                        <div className="text-xs text-slate-500">Event Organizer</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-[#00C896] text-white rounded text-xs font-bold">{getOrganizerCurrencyConfig(currentOrganizer).code}</div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 mb-1">{t('country')}</span>
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      {currentOrganizer?.payoutAccount?.country || currentOrganizer?.country || "Côte d'Ivoire"}
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-slate-900 mb-4">{t('paymentHistory')}</h3>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder={t('searchPayoutsPlaceholder')} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                    </div>
                    <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                      <option>{t('allStatusFilter')}</option>
                    </select>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                      <thead>
                        <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2 font-extrabold rounded-l-lg">{t('dateStatus')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('totalAmount')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('payoutDestination')}</th>
                          <th className="px-3 py-2 font-extrabold">{t('statusColTableHeader')}</th>
                          <th className="px-3 py-2 font-extrabold text-center rounded-r-lg"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { date: 'Nov 19, 2025', amount: formatOrganizerCurrency(1466866000, currentOrganizer), bank: 'GTBank **** 5399', status: t('pendingStatus') },
                          { date: 'Oct 10, 2025', amount: formatOrganizerCurrency(850538000, currentOrganizer), bank: 'GTBank **** 5399', status: t('paidStatus') },
                          { date: 'July 30, 2025', amount: formatOrganizerCurrency(904866000, currentOrganizer), bank: 'GTBank **** 5399', status: t('paidStatus') },
                        ].map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-3 text-slate-500">{row.date}</td>
                            <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                            <td className="px-3 py-3">{row.bank}</td>
                            <td className="px-3 py-3">
                              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === t('pendingStatus') ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">{t('viewMore')}</button>
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
                    <h3 className="text-base font-extrabold text-slate-900">{t('refundRules')}</h3>
                    <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">{t('editRefundRules')}</button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Calendar className="w-4 h-4 text-[#00C896]" /> {t('refundWindow')}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{t('upToOneDayBefore')}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Receipt className="w-4 h-4 text-[#00C896]" /> {t('refundFeesLabel')}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{t('organizerPaysFees')}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <CreditCard className="w-4 h-4 text-[#00C896]" /> {t('refundMethodLabel')}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{t('refundToOriginalMethod')}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm mb-1">
                        <Building2 className="w-4 h-4 text-[#00C896]" /> {t('partialRefundsLabel')}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{t('allowedCustomAmount')}</div>
                    </div>
                  </div>
                </div>

                {/* Fees Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 flex flex-col justify-center">
                  <h3 className="text-base font-extrabold text-slate-900">{t('feesBreakdown')}</h3>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm font-bold text-slate-900">{t('totalRefundedLabel')}</span>
                    <span className="font-mono text-sm font-black text-slate-900">{formatOrganizerCurrency(3653000, currentOrganizer)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">{t('perPaidTicket5')}</span>
                    <span className="text-xs font-bold text-slate-900">245 Tickets</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-600">{t('perPaidTicketFix')}</span>
                    <span className="text-xs font-bold text-slate-900">{formatOrganizerCurrency(1567000, currentOrganizer)}</span>
                  </div>
                </div>
              </div>

              {/* Payment History (Refunds) */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-900 mb-4">{t('paymentHistory')}</h3>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder={t('searchPayoutsPlaceholder')} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#00C896]" />
                  </div>
                  <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none text-slate-600 outline-none">
                    <option>{t('allStatusFilter')}</option>
                  </select>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
                    <thead>
                      <tr className="bg-[#00C896] text-white uppercase text-[10px] tracking-wider">
                        <th className="px-3 py-2 font-extrabold rounded-l-lg">{t('dateStatus')}</th>
                        <th className="px-3 py-2 font-extrabold">{t('ticketType')}</th>
                        <th className="px-3 py-2 font-extrabold">{t('totalAmount')}</th>
                        <th className="px-3 py-2 font-extrabold">{t('refundReason')}</th>
                        <th className="px-3 py-2 font-extrabold">{t('statusColTableHeader')}</th>
                        <th className="px-3 py-2 font-extrabold text-center rounded-r-lg"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { date: 'Nov 19, 2025', ticket: 'TKA-4553353', amount: formatOrganizerCurrency(1466866000, currentOrganizer), reason: 'Event Canceled', status: t('pendingStatus') },
                        { date: 'Oct 10, 2025', ticket: 'TKA-4553473', amount: formatOrganizerCurrency(850538000, currentOrganizer), reason: 'Scheduling Conflict', status: t('paidStatus') },
                        { date: 'July 30, 2025', ticket: 'TKA-4553474', amount: formatOrganizerCurrency(904866000, currentOrganizer), reason: 'Medical Emergency', status: t('paidStatus') },
                        { date: 'Mar 27, 2025', ticket: 'TKA-4677786', amount: formatOrganizerCurrency(450100000, currentOrganizer), reason: 'Event Canceled', status: t('paidStatus') },
                        { date: 'Mar 27, 2025', ticket: 'TKA-7757890', amount: formatOrganizerCurrency(450100000, currentOrganizer), reason: 'Scheduling Conflict', status: t('paidStatus') },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3 py-3 text-slate-500">{row.date}</td>
                          <td className="px-3 py-3 font-mono text-slate-900">{row.ticket}</td>
                          <td className="px-3 py-3 font-mono text-slate-900">{row.amount}</td>
                          <td className="px-3 py-3">{row.reason}</td>
                          <td className="px-3 py-3">
                            <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${row.status === t('pendingStatus') ? 'bg-amber-400 text-white' : 'bg-[#00C896] text-white'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <button className="px-3 py-1 bg-[#00C896] text-white rounded text-[10px] font-bold hover:bg-[#00b386]">{t('viewMore')}</button>
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
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('billingSubscriptionTitle')}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border-2 border-[#00C896] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-slate-900">{t('proPlan')}</h3>
                <span className="px-2.5 py-1 bg-emerald-100 text-[#00C896] font-extrabold rounded-full text-[10px]">{t('currentPlan')}</span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{formatOrganizerCurrency(250000, currentOrganizer)} <span className="text-xs text-slate-500 font-normal">{t('monthUnit')}</span></div>
              <ul className="text-xs space-y-2 text-slate-600 font-semibold">
                <li>✓ {t('unlimitedEventsFeature')}</li>
                <li>✓ {t('reducedTicketFeesFeature')}</li>
                <li>✓ {t('advancedCheckInsFeature')}</li>
                <li>✓ {t('teamPermissionsFeature')}</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 opacity-75">
              <h3 className="text-lg font-black text-slate-900">{t('starterPlan')}</h3>
              <div className="text-2xl font-black text-slate-900 font-mono">{t('freeUnit')}</div>
              <ul className="text-xs space-y-2 text-slate-600 font-semibold">
                <li>✓ {t('oneActiveEventFeature')}</li>
                <li>✓ {t('standardFeesFeature')}</li>
                <li>✓ {t('basicCheckInsFeature')}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 6: Notifications */}
      {activeSubpage === 'notifications' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('notificationTitle')}
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">{t('eventNotifications')}</h2>
            
            {[
              { label: t('eventPublishedUnpublished'), email: true, app: true },
              { label: t('eventApprovedRejected'), email: true, app: true },
              { label: t('lowTicketCapacity'), email: true, app: true },
              { label: t('payoutProcessedConfirmation'), email: true, app: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-slate-800">{item.label}</span>
                <div className="flex space-x-4">
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked={item.email} /> Email</label>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked={item.app} /> {t('inApp')}</label>
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
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('defaultEventSettingsTitle')}
          </button>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
            <h2 className="text-base font-extrabold text-slate-900">{t('defaultRulesNewEvents')}</h2>
            <div>
              <label className="block text-slate-700 mb-1">{t('defaultEventDetails')}</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                <option>{t('publicEvent')}</option>
                <option>{t('privateEvent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 mb-1">{t('timeZone')}</label>
              <input type="text" defaultValue="(GMT+1) West Central Africa" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <button onClick={() => showToast('Defaults saved')} className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl text-xs shadow-sm">
              {t('saveDefaults')}
            </button>
          </div>
        </div>
      )}

      {/* SUBPAGE 8: Integrations */}
      {activeSubpage === 'integrations' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('integrationsTitle')}
          </button>

          {/* Integrated Database Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#00C896]" />
                  Local Server Database Engine
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  Your platform is powered by an integrated local file database engine persisting state cleanly in <code className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">/data/db.json</code>.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ● Active & Verified
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Automatic Persistence Features:</div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                  <li>Persistent account registration and organizer onboarding data</li>
                  <li>Real-time event creation, tier management, and publish updates</li>
                  <li>Instant local SMS OTP generation and account status verification</li>
                  <li>Nigerian bank account resolution using local deterministic resolution</li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    fetch('/api/db/sync')
                      .then(r => r.json())
                      .then(() => showToast('Server database verified and in sync!'))
                      .catch(() => showToast('Database sync check failed.'));
                  }}
                  className="px-4 py-2 bg-[#00C896] hover:bg-[#00b084] text-white font-extrabold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Verify Server Database Status
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
             <h2 className="text-base font-extrabold text-slate-900">{t('connectedApps')}</h2>
             <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-slate-900">Mailchimp</div>
                  <div className="text-slate-500">{t('syncAttendeesList')}</div>
                </div>
                <button className="px-3 py-1.5 border border-slate-200 bg-white font-bold rounded-lg hover:bg-slate-100">{t('connectBtn')}</button>
             </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 9: Legal & Compliance */}
      {activeSubpage === 'legal-compliance' && (
        <div className="space-y-6">
          <button onClick={() => setActiveSubpage('grid')} className="hover:text-[#00C896] flex items-center gap-1 text-xs font-bold text-slate-500">
            <ArrowLeft className="w-3.5 h-3.5" /> {t('backToSettings')} / {t('legalComplianceTitle')}
          </button>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 max-w-2xl text-xs font-semibold">
             <h2 className="text-base font-extrabold text-slate-900">{t('legalDocuments')}</h2>
             <p className="text-slate-500">{t('updateTermsAndConditions')}</p>
             <textarea className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Terms & Conditions..."></textarea>
             <button className="px-4 py-2 bg-[#00C896] text-white font-extrabold rounded-xl shadow-sm">{t('saveDocuments')}</button>
          </div>
        </div>
      )}
    </div>
  );
};
