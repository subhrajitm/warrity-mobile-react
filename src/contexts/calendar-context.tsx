import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';

interface CalendarEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'warranty' | 'service' | 'reminder' | 'other';
  relatedItemId?: string; // ID of warranty or service item
  createdAt: string;
  updatedAt: string;
}

interface CalendarContextType {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: (startDate?: string, endDate?: string, type?: string) => Promise<void>;
  getEventById: (id: string) => Promise<CalendarEvent | null>;
  createEvent: (eventData: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  updateEvent: (id: string, eventData: Partial<CalendarEvent>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<boolean>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { token, isAuthenticated } = useAuth();

  // Fetch calendar events with optional filtering
  const fetchEvents = async (
    startDate?: string,
    endDate?: string,
    type?: string
  ) => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view calendar events');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (type) queryParams.append('type', type);
      
      const response = await apiClient<{ events: CalendarEvent[] }>(
        `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        { token }
      );
      
      setEvents(response.events);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Failed to fetch calendar events. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single event by ID
  const getEventById = async (id: string): Promise<CalendarEvent | null> => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view event details');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const event = await apiClient<CalendarEvent>(
        `/events/${id}`,
        { token }
      );
      
      return event;
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Failed to fetch event details. Please try again later.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new calendar event
  const createEvent = async (eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to create an event');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newEvent = await apiClient<CalendarEvent>(
        '/events',
        { 
          method: 'POST',
          data: eventData,
          token 
        }
      );
      
      // Update the events list with the new event
      setEvents(prev => [newEvent, ...prev]);
      
      return newEvent;
    } catch (err) {
      console.error('Error creating calendar event:', err);
      const errorMessage = 'Failed to create calendar event. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing calendar event
  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to update an event');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updatedEvent = await apiClient<CalendarEvent>(
        `/events/${id}`,
        { 
          method: 'PUT',
          data: eventData,
          token 
        }
      );
      
      // Update the events list with the updated event
      setEvents(prev => 
        prev.map(event => 
          event._id === id ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } catch (err) {
      console.error('Error updating calendar event:', err);
      const errorMessage = 'Failed to update calendar event. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a calendar event
  const deleteEvent = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to delete an event');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient(
        `/events/${id}`,
        { 
          method: 'DELETE',
          token 
        }
      );
      
      // Remove the deleted event from the events list
      setEvents(prev => prev.filter(event => event._id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting calendar event:', err);
      const errorMessage = 'Failed to delete calendar event. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchEvents();
    }
  }, [isAuthenticated, token]);

  const value = {
    events,
    isLoading,
    error,
    fetchEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
