import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { AttendeeWeb } from './components/AttendeeWeb/AttendeeWeb';
import { AttendeeMobile } from './components/AttendeeMobile/AttendeeMobile';
import { OrganizerDashboard } from './components/OrganizerDashboard/OrganizerDashboard';
import { StaffCheckIn } from './components/StaffCheckIn/StaffCheckIn';
import { DevSuite } from './components/DevSuite';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Routes>
        {/* 1. Attendee Website Application (Public e-Commerce Portal) */}
        <Route path="/" element={<AttendeeWeb />} />
        <Route path="/events/:eventId" element={<AttendeeWeb />} />

        {/* 2. Attendee Mobile Application (Digital Wallet & Passes) */}
        <Route path="/mobile" element={<AttendeeMobile />} />

        {/* 3. Event Organizer Dashboard Application (B2B Admin Portal) */}
        <Route path="/organizer/*" element={<OrganizerDashboard />} />

        {/* 4. Gate Check-in Staff Scanner Application (Venue Gate Validator) */}
        <Route path="/scanner" element={<StaffCheckIn />} />

        {/* 5. Internal Dev Suite & Testing Hub (Gated behind dev route) */}
        <Route path="/_internal" element={<DevSuite />} />
        <Route path="/dev-suite" element={<DevSuite />} />
        <Route path="/apps" element={<DevSuite />} />

        {/* Catch-all redirect to public attendee homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <EventProvider>
        <MainLayout />
      </EventProvider>
    </BrowserRouter>
  );
}
