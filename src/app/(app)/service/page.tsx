"use client";

import React from 'react';
import ServiceDirectory from '@/components/service/service-directory';
import { ServiceProvider } from '@/contexts/service-context';

export default function ServicePage() {
  return (
    <ServiceProvider>
      <ServiceDirectory />
    </ServiceProvider>
  );
}
