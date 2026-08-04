import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { EventItem } from '../../types';

// Subcomponents
import { OrganizerSidebar, OrganizerTabType } from './OrganizerSidebar';
import { OrganizerHeader } from './OrganizerHeader';
import { OrganizerLogin } from './OrganizerLogin';
import { OverviewTab } from './OverviewTab';
import { EventsTab } from './EventsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { TicketSalesTab } from './TicketSalesTab';
import { UsersTab } from './UsersTab';
import { CheckInsTab } from './CheckInsTab';
import { SettingsTab } from './SettingsTab';
import { RefundsTab } from './RefundsTab';
import { CreateEventModal } from './CreateEventModal';
import { DeleteEventModal } from './DeleteEventModal';
import { RevenueWithdrawModal } from './RevenueWithdrawModal';
import { OrganizerCheckInModal } from './OrganizerCheckInModal';
import { NotificationCenterModal } from '../NotificationCenterModal';
import { ThermalPrinterModal } from '../ThermalPrinterModal';

export const OrganizerDashboard: React.FC = () => {
  const { 
    events, 
    orders, 
    allTickets, 
    currentOrganizer,
    loginOrganizer,
    createNewEvent, 
    updateEvent,
    deleteEvent,
    seedLiveSales,
    logoutOrganizer
  } = useEventContext();

  const [organizerAuth, setOrganizerAuth] = useState<{ isLoggedIn: boolean; name: string; email: string }>(() => {
    const saved = localStorage.getItem('organizer_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing organizer session:', e);
      }
    }
    return { isLoggedIn: false, name: '', email: '' };
  });

  // Ensure currentOrganizer in context matches logged-in organizer session
  React.useEffect(() => {
    if (organizerAuth.isLoggedIn && organizerAuth.email) {
      if (!currentOrganizer || currentOrganizer.email.toLowerCase() !== organizerAuth.email.toLowerCase()) {
        loginOrganizer(organizerAuth.email);
      }
    }
  }, [organizerAuth.isLoggedIn, organizerAuth.email, currentOrganizer, loginOrganizer]);

  // Filter data specifically for the logged-in organizer to ensure fresh account for new hosts
  const organizerEvents = React.useMemo(() => {
    return events.filter(e => {
      if (currentOrganizer) {
        if (e.organizerId && e.organizerId === currentOrganizer.id) return true;
        if (e.organizerName && e.organizerName.toLowerCase() === currentOrganizer.organizationName.toLowerCase()) return true;
      }
      if (organizerAuth.name) {
        if (e.organizerName && e.organizerName.toLowerCase() === organizerAuth.name.toLowerCase()) return true;
      }
      return false;
    });
  }, [events, currentOrganizer, organizerAuth.name]);

  const organizerEventIds = React.useMemo(() => new Set(organizerEvents.map(e => e.id)), [organizerEvents]);
  const organizerOrders = React.useMemo(() => orders.filter(o => organizerEventIds.has(o.eventId)), [orders, organizerEventIds]);
  const organizerTickets = React.useMemo(() => allTickets.filter(t => organizerEventIds.has(t.eventId)), [allTickets, organizerEventIds]);

  const [activeTab, setActiveTab] = useState<OrganizerTabType>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [revenueModalEvent, setRevenueModalEvent] = useState<EventItem | null>(null);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  const [deletingEvent, setDeletingEvent] = useState<EventItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleOpenDeleteModal = (evt: EventItem) => {
    setDeletingEvent(evt);
    setIsDeleteModalOpen(true);
  };

  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [checkInModalMode, setCheckInModalMode] = useState<'scan' | 'manual'>('scan');
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);

  const handleOpenCheckInModal = (mode: 'scan' | 'manual' = 'scan') => {
    setCheckInModalMode(mode);
    setIsCheckInModalOpen(true);
  };

  // Quick Action Handlers
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (evt: EventItem) => {
    setEditingEvent(evt);
    setIsCreateModalOpen(true);
  };

  const handleOpenRevenueModal = (eventId: string) => {
    const found = organizerEvents.find(e => e.id === eventId) || organizerEvents[0] || events[0];
    if (found) {
      setRevenueModalEvent(found);
      setIsRevenueModalOpen(true);
    }
  };

  const handleEventFormSubmit = async (eventData: EventItem) => {
    if (editingEvent || events.some(e => e.id === eventData.id)) {
      await updateEvent(eventData);
    } else {
      await createNewEvent(eventData);
    }
    setEditingEvent(null);
  };

  const handleLoginSuccess = (data: { name: string; email: string }) => {
    const newSession = { isLoggedIn: true, name: data.name, email: data.email };
    setOrganizerAuth(newSession);
    localStorage.setItem('organizer_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    logoutOrganizer();
    const loggedOutSession = { isLoggedIn: false, name: '', email: '' };
    setOrganizerAuth(loggedOutSession);
    localStorage.setItem('organizer_session', JSON.stringify(loggedOutSession));
  };

  if (!organizerAuth.isLoggedIn) {
    return <OrganizerLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      
      {/* Left Navigation Sidebar */}
      <OrganizerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
        organizerName={organizerAuth.name}
        organizerEmail={organizerAuth.email}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        
        {/* Top Header Bar */}
        <OrganizerHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onCreateEventClick={handleOpenCreateModal}
          onSeedLiveSales={seedLiveSales}
          onOpenNotifs={() => setIsNotifModalOpen(true)}
          onOpenPrinter={() => setIsPrinterModalOpen(true)}
          onLogout={handleLogout}
          organizerName={organizerAuth.name}
          organizerEmail={organizerAuth.email}
        />

        {/* Dashboard Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. Dashboard Overview Tab */}
          {activeTab === 'dashboard' && (
            <OverviewTab
              events={organizerEvents}
              orders={organizerOrders}
              allTickets={organizerTickets}
              organizerName={organizerAuth.name || 'Organizer'}
              onSelectEvent={(id) => handleOpenRevenueModal(id)}
              onNavigateToEvents={() => setActiveTab('events')}
              onNavigateToSales={() => setActiveTab('ticket-sales')}
              onSeedLiveSales={seedLiveSales}
              onCreateEventClick={handleOpenCreateModal}
            />
          )}

          {/* 2. Events Management Tab */}
          {activeTab === 'events' && (
            <EventsTab
              events={organizerEvents}
              orders={organizerOrders}
              allTickets={organizerTickets}
              onCreateEventClick={handleOpenCreateModal}
              onSelectEvent={(id) => handleOpenRevenueModal(id)}
              onViewRevenue={(id) => handleOpenRevenueModal(id)}
              onEditEvent={(evt) => handleOpenEditModal(evt)}
              onDeleteEvent={(evt) => handleOpenDeleteModal(evt)}
            />
          )}

          {/* 3. Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab events={organizerEvents} orders={organizerOrders} allTickets={organizerTickets} />
          )}

          {/* 4. Ticket Sales Tab */}
          {activeTab === 'ticket-sales' && (
            <TicketSalesTab
              events={organizerEvents}
              orders={organizerOrders}
              allTickets={organizerTickets}
            />
          )}

          {/* 5. Users & Customers Tab */}
          {activeTab === 'users' && (
            <UsersTab />
          )}

          {/* 6. Check-Ins Tab */}
          {activeTab === 'check-ins' && (
            <CheckInsTab
              events={organizerEvents}
              allTickets={organizerTickets}
              onOpenScanner={() => handleOpenCheckInModal('scan')}
              onOpenManualCheckIn={() => handleOpenCheckInModal('manual')}
            />
          )}

          {/* 7. Refunds Tab */}
          {activeTab === 'refunds' && (
            <RefundsTab />
          )}

          {/* 8. Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsTab onLogout={handleLogout} />
          )}

        </main>
      </div>

      {/* Create / Edit Event Modal Wizard */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleEventFormSubmit}
        editingEvent={editingEvent}
      />

      {/* Revenue Breakdown & Withdrawal Modal */}
      <RevenueWithdrawModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        event={revenueModalEvent}
        orders={organizerOrders}
      />

      {/* Delete Event Safety Modal */}
      <DeleteEventModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        event={deletingEvent}
        orders={organizerOrders}
        allTickets={organizerTickets}
        onConfirmDelete={deleteEvent}
      />

      {/* Organizer Scanner & Check-In Modal */}
      <OrganizerCheckInModal
        isOpen={isCheckInModalOpen}
        initialMode={checkInModalMode}
        onClose={() => setIsCheckInModalOpen(false)}
        events={organizerEvents}
        allTickets={organizerTickets}
      />

      {/* Notification Dispatch Center Modal */}
      <NotificationCenterModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      {/* Thermal Wristband & Badge Printer Modal */}
      <ThermalPrinterModal
        isOpen={isPrinterModalOpen}
        onClose={() => setIsPrinterModalOpen(false)}
        selectedTicket={allTickets[0]}
      />

    </div>
  );
};
