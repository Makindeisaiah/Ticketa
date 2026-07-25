import React, { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import { EventItem } from '../../types';

// Subcomponents
import { OrganizerSidebar, OrganizerTabType } from './OrganizerSidebar';
import { OrganizerHeader } from './OrganizerHeader';
import { OverviewTab } from './OverviewTab';
import { EventsTab } from './EventsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { TicketSalesTab } from './TicketSalesTab';
import { UsersTab } from './UsersTab';
import { CheckInsTab } from './CheckInsTab';
import { SettingsTab } from './SettingsTab';
import { CreateEventModal } from './CreateEventModal';
import { RevenueWithdrawModal } from './RevenueWithdrawModal';

export const OrganizerDashboard: React.FC = () => {
  const { 
    events, 
    orders, 
    allTickets, 
    createNewEvent, 
    seedLiveSales 
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<OrganizerTabType>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const [revenueModalEvent, setRevenueModalEvent] = useState<EventItem | null>(null);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

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
    const found = events.find(e => e.id === eventId) || events[0];
    if (found) {
      setRevenueModalEvent(found);
      setIsRevenueModalOpen(true);
    }
  };

  const handleEventFormSubmit = (newEventData: EventItem) => {
    createNewEvent(newEventData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      
      {/* Left Navigation Sidebar */}
      <OrganizerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
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
        />

        {/* Dashboard Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* 1. Dashboard Overview Tab */}
          {activeTab === 'dashboard' && (
            <OverviewTab
              events={events}
              orders={orders}
              allTickets={allTickets}
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
              events={events}
              onCreateEventClick={handleOpenCreateModal}
              onSelectEvent={(id) => handleOpenRevenueModal(id)}
              onViewRevenue={(id) => handleOpenRevenueModal(id)}
              onEditEvent={(evt) => handleOpenEditModal(evt)}
            />
          )}

          {/* 3. Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab events={events} />
          )}

          {/* 4. Ticket Sales Tab */}
          {activeTab === 'ticket-sales' && (
            <TicketSalesTab
              events={events}
              orders={orders}
              allTickets={allTickets}
            />
          )}

          {/* 5. Users & Customers Tab */}
          {activeTab === 'users' && (
            <UsersTab />
          )}

          {/* 6. Check-Ins Tab */}
          {activeTab === 'check-ins' && (
            <CheckInsTab
              events={events}
              allTickets={allTickets}
            />
          )}

          {/* 6. Settings Tab */}
          {activeTab === 'settings' && (
            <SettingsTab />
          )}

        </main>
      </div>

      {/* Create / Edit Event Modal Wizard */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleEventFormSubmit}
        editingEvent={editingEvent}
      />

      {/* Revenue Breakdown & Withdrawal Modal */}
      <RevenueWithdrawModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        event={revenueModalEvent}
      />

    </div>
  );
};
