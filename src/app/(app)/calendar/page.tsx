"use client";

import React from 'react';
import CalendarView from '@/components/calendar/calendar-view';
import { CalendarProvider } from '@/contexts/calendar-context';
import { WarrantyProvider } from '@/contexts/warranty-context';

// This component prevents duplicate API calls by only rendering the CalendarView
// when both providers are ready
const CalendarWithProviders = () => {
  return <CalendarView />;
};

export default function CalendarPage() {
  // Use the existing providers from the app layout if possible
  // This prevents nested providers from making duplicate API calls
  return (
    <CalendarProvider>
      <WarrantyProvider>
        <CalendarWithProviders />
      </WarrantyProvider>
    </CalendarProvider>
  );
}
