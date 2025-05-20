import React, { useState, useEffect } from 'react';
import { useCalendar } from '@/contexts/calendar-context';
import { useWarranty } from '@/contexts/warranty-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { PlusIcon, CalendarIcon, ClockIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, isSameDay, parseISO, isAfter, isBefore, addDays } from 'date-fns';
import Link from 'next/link';

// Event form schema
const eventFormSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().min(2, { message: 'Description must be at least 2 characters' }),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  location: z.string().optional(),
  type: z.enum(['warranty', 'service', 'reminder', 'other']),
  relatedItemId: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

const CalendarView = () => {
  const { events, isLoading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendar();
  const { warranties } = useWarranty();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Initialize form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      location: '',
      type: 'reminder',
    },
  });
  
  // Fetch events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Reset form when dialog is opened/closed
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        title: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        location: '',
        type: 'reminder',
      });
      setIsEditing(false);
      setSelectedEvent(null);
    }
  }, [isDialogOpen, form]);
  
  // Set form values when editing an event
  useEffect(() => {
    if (selectedEvent && isEditing) {
      form.reset({
        title: selectedEvent.title,
        description: selectedEvent.description,
        startDate: parseISO(selectedEvent.startDate),
        endDate: parseISO(selectedEvent.endDate),
        location: selectedEvent.location || '',
        type: selectedEvent.type,
        relatedItemId: selectedEvent.relatedItemId || '',
      });
    }
  }, [selectedEvent, isEditing, form]);
  
  // Filter events for the selected date
  const eventsForSelectedDate = events.filter(event => 
    isSameDay(parseISO(event.startDate), selectedDate)
  );
  
  // Get upcoming events (next 30 days)
  const upcomingEvents = events
    .filter(event => 
      isAfter(parseISO(event.startDate), new Date()) && 
      isBefore(parseISO(event.startDate), addDays(new Date(), 30))
    )
    .sort((a, b) => 
      parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
    );
  
  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    try {
      if (isEditing && selectedEvent) {
        await updateEvent(selectedEvent._id, {
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        });
        toast({
          title: 'Success',
          description: 'Event updated successfully',
        });
      } else {
        await createEvent({
          ...data,
          startDate: data.startDate.toISOString(),
          endDate: data.endDate.toISOString(),
        });
        toast({
          title: 'Success',
          description: 'Event created successfully',
        });
      }
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving event:', err);
      toast({
        title: 'Error',
        description: 'Failed to save event',
        variant: 'destructive',
      });
    }
  };
  
  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    try {
      setIsDeleting(true);
      await deleteEvent(selectedEvent._id);
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete event',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Get event type badge
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'warranty':
        return <Badge variant="secondary">Warranty</Badge>;
      case 'service':
        return <Badge variant="primary">Service</Badge>;
      case 'reminder':
        return <Badge variant="warning">Reminder</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMMM d, yyyy');
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Update the event details below.' 
                  : 'Add a new event to your calendar.'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Event description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date*</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date*</FormLabel>
                        <DatePicker
                          date={field.value}
                          setDate={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warranty">Warranty</SelectItem>
                          <SelectItem value="service">Service</SelectItem>
                          <SelectItem value="reminder">Reminder</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(form.watch('type') === 'warranty' || form.watch('type') === 'service') && (
                  <FormField
                    control={form.control}
                    name="relatedItemId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Related Warranty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a warranty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {warranties.map((warranty) => (
                              <SelectItem key={warranty._id} value={warranty._id}>
                                {warranty.productName} ({warranty.productBrand})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <DialogFooter className="gap-2 sm:gap-0">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                      className="mr-auto"
                    >
                      {isDeleting ? <Spinner className="mr-2" /> : <TrashIcon className="mr-2 h-4 w-4" />}
                      Delete
                    </Button>
                  )}
                  <Button type="submit">
                    {isEditing ? 'Update Event' : 'Create Event'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                View and manage your warranty and service events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Events for {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : eventsForSelectedDate.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No events for this date.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          form.setValue('startDate', selectedDate);
                          form.setValue('endDate', selectedDate);
                          setIsDialogOpen(true);
                        }}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventsForSelectedDate.map((event) => (
                        <Card key={event._id} className="overflow-hidden">
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{event.title}</CardTitle>
                              {getEventTypeBadge(event.type)}
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <ClockIcon className="mr-2 h-4 w-4" />
                              {formatTime(event.startDate)}
                            </div>
                            {event.location && (
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <span className="mr-2">📍</span>
                                {event.location}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedEvent(event);
                                setIsEditing(true);
                                setIsDialogOpen(true);
                              }}
                            >
                              <PencilIcon className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming events.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <Card key={event._id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{event.title}</CardTitle>
                          {getEventTypeBadge(event.type)}
                        </div>
                        <CardDescription>
                          {formatDate(event.startDate)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsEditing(true);
                            setIsDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Event
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
