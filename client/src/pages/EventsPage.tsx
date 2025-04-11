import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { Event } from '@shared/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TicketPurchase from '@/components/TicketPurchase';

const EventsPage = () => {
  const { data: events, isLoading, error } = useQuery({
    queryKey: ['/api/events'],
  });
  
  // Get current date
  const today = new Date();
  
  // Separate upcoming and past events
  const upcomingEvents = events ? events.filter((event: Event) => new Date(event.date) >= today) : [];
  const pastEvents = events ? events.filter((event: Event) => new Date(event.date) < today) : [];
  
  // Separate events by type
  const festivalEvents = events ? events.filter((event: Event) => event.eventType === 'festival') : [];
  const clubEvents = events ? events.filter((event: Event) => event.eventType === 'club') : [];
  const livestreamEvents = events ? events.filter((event: Event) => event.eventType === 'livestream') : [];
  
  return (
    <>
      <Helmet>
        <title>Events | Full Fuel TV</title>
        <meta name="description" content="Find upcoming electronic music events, festivals, club nights and livestreams from around the world." />
      </Helmet>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 bg-[#121212]">
          <div className="container mx-auto px-6 md:px-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Upcoming <span className="text-primary">Events</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mb-12">
              Discover the hottest electronic music events, festivals, and club nights happening around the world.
            </p>
          </div>
        </section>
        
        {/* Events Tabs */}
        <section className="py-12 bg-dark">
          <div className="container mx-auto px-6 md:px-12">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#1A1A1A] rounded-sm p-6 animate-pulse">
                    <div className="h-8 bg-gray-800 mb-4 w-1/3"></div>
                    <div className="h-6 bg-gray-800 mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-800 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-[#1A1A1A] p-6 rounded-sm">
                <h3 className="text-xl font-bold mb-2">Failed to load events</h3>
                <p className="text-gray-400 mb-4">Please try again later</p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-8 bg-[#1A1A1A] p-1 rounded-sm">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-dark">All Events</TabsTrigger>
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-primary data-[state=active]:text-dark">Upcoming</TabsTrigger>
                  <TabsTrigger value="past" className="data-[state=active]:bg-primary data-[state=active]:text-dark">Past</TabsTrigger>
                  <TabsTrigger value="festivals" className="data-[state=active]:bg-primary data-[state=active]:text-dark">Festivals</TabsTrigger>
                  <TabsTrigger value="clubs" className="data-[state=active]:bg-primary data-[state=active]:text-dark">Clubs</TabsTrigger>
                  <TabsTrigger value="livestreams" className="data-[state=active]:bg-primary data-[state=active]:text-dark">Livestreams</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-0">
                  <EventsGrid events={events} />
                </TabsContent>
                
                <TabsContent value="upcoming" className="mt-0">
                  <EventsGrid events={upcomingEvents} />
                </TabsContent>
                
                <TabsContent value="past" className="mt-0">
                  <EventsGrid events={pastEvents} />
                </TabsContent>
                
                <TabsContent value="festivals" className="mt-0">
                  <EventsGrid events={festivalEvents} />
                </TabsContent>
                
                <TabsContent value="clubs" className="mt-0">
                  <EventsGrid events={clubEvents} />
                </TabsContent>
                
                <TabsContent value="livestreams" className="mt-0">
                  <EventsGrid events={livestreamEvents} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

// Helper component to display a grid of events
const EventsGrid = ({ events }: { events: Event[] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="bg-[#1A1A1A] p-8 text-center rounded-sm">
        <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No events found</h3>
        <p className="text-gray-400">Check back soon for updates</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {events.map((event: Event) => (
        <div key={event.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
          <div className="relative overflow-hidden mb-4">
            <img 
              src={event.imageUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'}
              alt={event.title} 
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-0 left-0 m-4 bg-primary px-3 py-1">
              <span className="font-mono text-dark text-sm uppercase font-bold">
                {new Date(event.date).toLocaleDateString('en-US', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-3 w-3 text-primary" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm">{event.attending.toLocaleString()} attending</span>
            </div>
            <Link href={`/events/${event.id}`}>
              <a className="text-primary hover:text-white transition-colors font-medium text-sm">Details</a>
            </Link>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-block px-2 py-1 text-xs rounded-sm 
              ${event.eventType === 'festival' ? 'bg-purple-900/30 text-purple-400' : 
                event.eventType === 'club' ? 'bg-blue-900/30 text-blue-400' : 
                'bg-green-900/30 text-green-400'}`}
            >
              {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
            </span>
            
            {/* Only show ticket button for events with no external link and future dates */}
            {!event.link && new Date(event.date) > new Date() && (
              <div className="flex items-center">
                <Ticket className="h-4 w-4 text-primary mr-1" />
                <TicketPurchase 
                  event={event} 
                  buttonText="Buy Tickets" 
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsPage;
