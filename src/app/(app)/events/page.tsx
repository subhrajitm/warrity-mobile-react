"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { Calendar, Clock, Plus, Trash2, Edit, Search, Filter, Tag } from 'lucide-react';
import { format, parseISO, isBefore, isToday, isFuture } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: events, isLoading, error, refetch } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!token) throw new Error("User not authenticated");
      
      try {
        return await apiClient<Event[]>('/events', { token });
      } catch (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }
    },
    enabled: !!token
  });

  const queryClient = useQueryClient();

  // Use mutation for delete operation
  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => apiClient(`/events/${eventId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event deleted",
        description: "Event has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = (id: string) => {
    if (!token) return;
    deleteMutation.mutate(id);
  };

  // Filter events based on search query and selected tab
  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const eventDate = parseISO(event.date);
    
    switch (selectedTab) {
      case "upcoming":
        return isFuture(eventDate) || isToday(eventDate);
      case "past":
        return isBefore(eventDate, new Date()) && !isToday(eventDate);
      default:
        return true; // "all" tab
    }
  }) : [];

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "meeting":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "appointment":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "reminder":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "deadline":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const renderEventsList = () => {
    if (!filteredEvents || filteredEvents.length === 0) {
      return (
        <div className="bg-gray-900 rounded-xl p-6 text-center">
          <p className="text-gray-400 mb-4">No events found</p>
          <Button 
            className="bg-lime-300 text-black hover:bg-lime-400"
            asChild
          >
            <Link href="/events/add">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Event
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredEvents.map((event) => {
          const eventDate = parseISO(event.date);
          const isPastEvent = isBefore(eventDate, new Date()) && !isToday(eventDate);
          
          return (
            <Card key={event._id} className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-700 transition-colors duration-200">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{event.title}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs ${getEventTypeColor(event.type)}`}
                    >
                      {event.type || 'Event'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-800"
                      asChild
                    >
                      <Link href={`/events/${event._id}/edit`}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === event._id ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-2">
                <p className="text-gray-400 text-xs line-clamp-2">{event.description}</p>
              </CardContent>
              <CardFooter className="px-4 py-3 flex justify-between items-center border-t border-gray-800 bg-gray-900/50">
                <div className="flex items-center text-xs text-gray-400 gap-3">
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-lime-300" />
                    <span className={isPastEvent ? "text-gray-500" : ""}>
                      {format(eventDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1.5 h-3.5 w-3.5 text-lime-300" />
                    <span className={isPastEvent ? "text-gray-500" : ""}>
                      {event.time}
                    </span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className="space-y-3">
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-10 w-full bg-gray-800 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="pb-2 flex justify-between">
              <Skeleton className="h-5 w-3/4 bg-gray-800" />
              <Skeleton className="h-5 w-16 bg-gray-800" />
            </div>
            <div className="py-2">
              <Skeleton className="h-3 w-full mb-2 bg-gray-800" />
              <Skeleton className="h-3 w-2/3 bg-gray-800" />
            </div>
            <div className="pt-2 flex justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20 bg-gray-800" />
                <Skeleton className="h-3 w-20 bg-gray-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="bg-gray-900 rounded-xl p-6 text-center">
      <p className="text-red-500 mb-4">Failed to load events</p>
      <Button 
        onClick={() => refetch()}
        className="bg-lime-300 text-black hover:bg-lime-400"
      >
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl font-bold">Events</h1>
        <Button className="bg-lime-300 text-black hover:bg-lime-400 w-full sm:w-auto" asChild>
          <Link href="/events/add">
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Link>
        </Button>
      </div>

      <div className="mb-6 space-y-4">
        {/* Search and filter */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search events..."
            className="pl-10 bg-gray-900 border-gray-800 focus-visible:ring-lime-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="bg-gray-900/60 backdrop-blur-sm w-full justify-start p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-lime-300 data-[state=active]:text-black px-3 py-1.5 text-xs h-auto"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-lime-300 data-[state=active]:text-black px-3 py-1.5 text-xs h-auto"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="data-[state=active]:bg-lime-300 data-[state=active]:text-black px-3 py-1.5 text-xs h-auto"
            >
              Past Events
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? renderLoadingState() : error ? renderErrorState() : renderEventsList()}
    </div>
  );
}
