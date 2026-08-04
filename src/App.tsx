import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { AttendeeWeb } from './components/AttendeeWeb/AttendeeWeb';
import { AttendeeMobile } from './components/AttendeeMobile/AttendeeMobile';
import { OrganizerDashboard } from './components/OrganizerDashboard/OrganizerDashboard';
import { StaffCheckIn } from './components/StaffCheckIn/StaffCheckIn';
import { DevSuite } from './components/DevSuite';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in App:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
              ⚠️
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-6">
              {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this.props as ErrorBoundaryProps).children;
  }
}

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
    <ErrorBoundary>
      <BrowserRouter>
        <EventProvider>
          <MainLayout />
        </EventProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
