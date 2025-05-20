"use client";

import React from 'react';
import CalendarView from '@/components/calendar/calendar-view';
import { CalendarProvider } from '@/contexts/calendar-context';
import { WarrantyProvider } from '@/contexts/warranty-context';

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <WarrantyProvider>
        <CalendarView />
      </WarrantyProvider>
    </CalendarProvider>
  );
}
