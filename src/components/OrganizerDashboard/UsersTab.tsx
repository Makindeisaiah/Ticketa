import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Ticket, 
  CheckCircle2, 
  ShoppingBag, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowUpRight, 
  X, 
  Download,
  CreditCard,
  ChevronRight,
  Building2,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { TicketaUser, OrganizerUser, Order } from '../../types';

export const UsersTab: React.FC = () => {
  const { users, organizers, orders, registerUser, registerOrganizer } = useEventContext();
  
  const [activeRoleTab, setActiveRoleTab] = useState<'attendees' | 'organizers'>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buyers' | 'verified'>('all');
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<TicketaUser | null>(null);
  
  // Add User Modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  // Add Organizer Modal state
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgCategory, setNewOrgCategory] = useState('Concerts & Festivals');

  // Attendee Metrics
  const totalUsersCount = users.length;
  const activeBuyersCount = users.filter(u => orders.some(o => o.customerEmail.toLowerCase() === u.email.toLowerCase())).length;
  const totalSpentByUsers = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const verifiedCount = users.filter(u => u.status === 'Verified').length;

  // Organizer Metrics
  const totalOrganizersCount = organizers.length;
  const verifiedOrganizersCount = organizers.filter(o => o.status === 'Verified').length;

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const userOrdersCount = orders.filter(o => o.customerEmail.toLowerCase() === u.email.toLowerCase()).length;
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'buyers') return userOrdersCount > 0;
    if (filterType === 'verified') return u.status === 'Verified';
    return true;
  });

  // Filtered Organizers
  const filteredOrganizers = organizers.filter(o => {
    return (
      o.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.category && o.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    registerUser({
      fullName: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+234 800 000 0000'
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserOpen(false);
  };

  const handleAddOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOrgEmail.trim()) return;

    registerOrganizer({
      organizationName: newOrgName.trim(),
      email: newOrgEmail.trim(),
      phone: newOrgPhone.trim() || '+234 800 000 0000',
      category: newOrgCategory
    });

    setNewOrgName('');
    setNewOrgEmail('');
    setNewOrgPhone('');
    setIsAddOrgOpen(false);
  };

  const getUserOrders = (userEmail: string): Order[] => {
    return orders.filter(o => o.customerEmail.toLowerCase() === userEmail.toLowerCase());
  };

  const handleExportCSV = () => {
    if (activeRoleTab === 'attendees') {
      const headers = ['Full Name', 'Email', 'Phone', 'Date Registered', 'Total Orders', 'Total Spent (NGN)', 'Status'];
      const rows = filteredUsers.map(u => [
        `"${u.fullName}"`,
        `"${u.email}"`,
        `"${u.phone}"`,
        `"${u.registeredAt}"`,
        u.totalOrders,
        u.totalSpent,
        `"${u.status}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ticketa_attendees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Organization Name', 'Email', 'Phone', 'Category', 'Date Registered', 'Status'];
      const rows = filteredOrganizers.map(o => [
        `"${o.organizationName}"`,
        `"${o.email}"`,
        `"${o.phone}"`,
        `"${o.category || ''}"`,
        `"${o.registeredAt}"`,
        `"${o.status}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `ticketa_organizers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Role Navigation Toggle (Attendee Users vs Organizer Users) */}
      <div className="flex items-center space-x-2 bg-slate-200/80 p-1 rounded-2xl w-fit border border-slate-300/60">
        <button
          onClick={() => { setActiveRoleTab('attendees'); setSearchQuery(''); }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeRoleTab === 'attendees'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-[#00C896]" />
          <span>Attendee Users ({users.length})</span>
        </button>
        <button
          onClick={() => { setActiveRoleTab('organizers'); setSearchQuery(''); }}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
            activeRoleTab === 'organizers'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#00C896]" />
          <span>Organizer Users ({organizers.length})</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {activeRoleTab === 'attendees' ? (
              <>
                <Users className="w-6 h-6 text-[#00C896]" />
                Attendee Users & Customers
              </>
            ) : (
              <>
                <Building2 className="w-6 h-6 text-[#00C896]" />
                Event Organizers & Hosts
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeRoleTab === 'attendees' 
              ? 'Manage ticket buyers, view purchase histories, and track active platform attendees (Stored in `users` collection).'
              : 'Manage host organizations, event planners, and verified organizers (Stored in `organizers` collection).'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          {activeRoleTab === 'attendees' ? (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00B084] text-white text-xs font-bold shadow-md shadow-[#00C896]/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Attendee User</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddOrgOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00B084] text-white text-xs font-bold shadow-md shadow-[#00C896]/20 transition-all"
            >
              <Building2 className="w-4 h-4" />
              <span>+ Register Organizer</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Metrics Cards */}
      {activeRoleTab === 'attendees' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
              <div className="p-2.5 bg-emerald-50 text-[#00C896] rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{totalUsersCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Registered across all devices</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Buyers</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{activeBuyersCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {totalUsersCount > 0 ? `${Math.round((activeBuyersCount / totalUsersCount) * 100)}% conversion rate` : '0%'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Revenue</span>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">₦{totalSpentByUsers.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 mt-1">Total spent on tickets</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Accounts</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{verifiedCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Verified phone/email users</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Organizers</span>
              <div className="p-2.5 bg-emerald-50 text-[#00C896] rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{totalOrganizersCount}</p>
            <p className="text-[11px] text-slate-500 mt-1">Registered event host accounts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Hosts</span>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-3">{verifiedOrganizersCount}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Identity verified hosts</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Table</span>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-lg font-black text-slate-900 mt-3">`organizers` Collection</p>
            <p className="text-[11px] text-slate-500 mt-1">Isolated from attendee `users`</p>
          </div>
        </div>
      )}

      {/* Search and Filters Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeRoleTab === 'attendees' ? "Search by attendee name, email, or phone..." : "Search by organization name, email, phone or category..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
          />
        </div>

        {activeRoleTab === 'attendees' && (
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setFilterType('buyers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === 'buyers'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ticket Buyers ({activeBuyersCount})
            </button>
            <button
              onClick={() => setFilterType('verified')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === 'verified'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Verified ({verifiedCount})
            </button>
          </div>
        )}
      </div>

      {/* Users / Organizers Table */}
      {activeRoleTab === 'attendees' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Customer</th>
                  <th className="py-3.5 px-6">Contact Information</th>
                  <th className="py-3.5 px-6">Date Registered</th>
                  <th className="py-3.5 px-6 text-center">Orders</th>
                  <th className="py-3.5 px-6 text-right">Total Spent</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No attendee users found</p>
                      <p className="text-xs text-slate-400 mt-1">Try tweaking your search or filter keywords.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const userOrders = getUserOrders(user.email);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
                                {user.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{user.fullName}</p>
                              <p className="text-[11px] text-slate-400">ID: {user.id}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 space-y-1">
                          <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-medium">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.registeredAt}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            userOrders.length > 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {userOrders.length} {userOrders.length === 1 ? 'Order' : 'Orders'}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right font-bold text-slate-900">
                          ₦{userOrders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            user.status === 'Verified'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            <CheckCircle2 className="w-3 h-3" />
                            {user.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedUserForHistory(user)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px] inline-flex items-center space-x-1 transition-colors"
                          >
                            <span>Purchase History ({userOrders.length})</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Organizers Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Organization / Host Name</th>
                  <th className="py-3.5 px-6">Official Contact</th>
                  <th className="py-3.5 px-6">Primary Category</th>
                  <th className="py-3.5 px-6">Date Registered</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Table Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No organizer hosts found</p>
                      <p className="text-xs text-slate-400 mt-1">Register a host account or adjust your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map(org => (
                    <tr key={org.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-950 text-[#00C896] font-black text-xs flex items-center justify-center border border-[#00C896]/30">
                            {org.organizationName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{org.organizationName}</p>
                            <p className="text-[11px] text-slate-400">ID: {org.id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center space-x-1.5 text-slate-700 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{org.email}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{org.phone}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          <Tag className="w-3 h-3 text-slate-400" />
                          {org.category || 'Concerts & Festivals'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{org.registeredAt}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {org.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-bold">
                          Firestore `organizers`
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Purchase History Modal */}
      {selectedUserForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#00C896] text-white font-black text-sm flex items-center justify-center shadow-md">
                  {selectedUserForHistory.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight">{selectedUserForHistory.fullName}</h3>
                  <p className="text-xs text-slate-300">{selectedUserForHistory.email} • {selectedUserForHistory.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Stat Summary */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Joined</span>
                  <p className="text-sm font-bold text-slate-800">{selectedUserForHistory.registeredAt}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                  <p className="text-sm font-bold text-slate-800">{getUserOrders(selectedUserForHistory.email).length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                  <p className="text-sm font-black text-[#00C896]">₦{selectedUserForHistory.totalSpent.toLocaleString()}</p>
                </div>
              </div>

              {/* Order List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Ticket className="w-4 h-4 text-[#00C896]" />
                  Purchased Ticket Orders
                </h4>

                {getUserOrders(selectedUserForHistory.email).length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="font-bold text-slate-600 text-xs">No orders recorded for this user yet.</p>
                  </div>
                ) : (
                  getUserOrders(selectedUserForHistory.email).map(order => (
                    <div key={order.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-[11px] font-mono font-bold text-slate-500">{order.id}</span>
                          <h5 className="font-bold text-slate-900 text-sm">{order.eventTitle}</h5>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-[#00C896]">₦{order.totalAmount.toLocaleString()}</span>
                          <p className="text-[10px] text-slate-400">{order.purchaseDate}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Passes Issued ({order.tickets.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.tickets.map(tkt => (
                            <div key={tkt.ticketCode} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-slate-900">{tkt.tierName}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{tkt.ticketCode}</p>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                tkt.status === 'CHECKED_IN'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {tkt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setSelectedUserForHistory(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00C896]" />
                Register New Ticketa User
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oluwaseun Davies"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. seun@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +234 812 345 6789"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00B084] text-white font-bold text-xs shadow-md shadow-[#00C896]/20 transition-all"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Organizer Modal */}
      {isAddOrgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00C896]" />
                Register New Organizer Host
              </h3>
              <button
                onClick={() => setIsAddOrgOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOrgSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Organization / Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flytime Fest Productions"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@flytime.com"
                  value={newOrgEmail}
                  onChange={(e) => setNewOrgEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +234 802 123 4567"
                  value={newOrgPhone}
                  onChange={(e) => setNewOrgPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Category</label>
                <select
                  value={newOrgCategory}
                  onChange={(e) => setNewOrgCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]"
                >
                  <option value="Concerts & Festivals">Concerts & Festivals</option>
                  <option value="Tech Summits">Tech Summits</option>
                  <option value="Comedy & Theatre">Comedy & Theatre</option>
                  <option value="Sports & Gaming">Sports & Gaming</option>
                  <option value="Corporate & Networking">Corporate & Networking</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddOrgOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00B084] text-white font-bold text-xs shadow-md shadow-[#00C896]/20 transition-all"
                >
                  Register Host
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
