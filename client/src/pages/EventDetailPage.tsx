import { Helmet } from 'react-helmet';
import { Link, useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users, Clock, ChevronLeft, Share2, ExternalLink } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Event } from '@shared/schema';
import TicketPurchase from '@/components/TicketPurchase';

const EventDetailPage = () => {
  const [match, params] = useRoute('/events/:id');
  const eventId = params?.id;
  
  // Direct query for the event data
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId,
  });
  
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });
  
  // Get similar events (excluding current one)
  const similarEvents = events 
    ? events
        .filter((e: Event) => e.id !== eventId && e.eventType === event?.eventType)
        .slice(0, 3)
    : [];
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 pb-12 bg-dark min-h-screen">
          <div className="container mx-auto px-6 md:px-12">
            <div className="w-full h-[40vh] bg-[#1A1A1A] animate-pulse mb-8"></div>
            <div className="h-8 bg-[#1A1A1A] w-3/4 animate-pulse mb-4"></div>
            <div className="h-4 bg-[#1A1A1A] w-1/2 animate-pulse mb-8"></div>
            <div className="h-32 bg-[#1A1A1A] animate-pulse"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (error || !event) {
    return (
      <>
        <Header />
        <main className="pt-20 pb-12 bg-dark min-h-screen">
          <div className="container mx-auto px-6 md:px-12">
            <div className="bg-[#1A1A1A] p-6 rounded-sm">
              <h3 className="text-xl font-bold mb-2">Failed to load event</h3>
              <p className="text-gray-400 mb-4">Please try again later</p>
              <Link href="/events">
                <a className="text-primary hover:underline">Back to events</a>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  // Format date
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Format time
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <>
      <Helmet>
        <title>{event.title} | Full Fuel TV</title>
        <meta name="description" content={event.description} />
      </Helmet>
      <Header />
      <main className="pt-20 pb-12 bg-dark">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-6">
            <Link href="/events">
              <a className="inline-flex items-center text-gray-400 hover:text-primary">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to events
              </a>
            </Link>
          </div>
          
          {/* Event Hero */}
          <div className="relative h-[40vh] md:h-[50vh] rounded-sm overflow-hidden mb-8">
            <img 
              src={event.imageUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'}
              alt={event.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-8">
              <div className="inline-block bg-primary px-3 py-1 mb-4 self-start">
                <span className="font-mono text-dark text-sm uppercase font-bold">
                  {new Date(event.date).toLocaleDateString('en-US', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{event.title}</h1>
              <div className="flex items-center space-x-2 text-gray-300 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.location}</span>
              </div>
              
              {!event.link && (
                <div className="mt-3">
                  <TicketPurchase event={event} buttonText="Get Tickets" />
                </div>
              )}
            </div>
          </div>
          
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="bg-[#1A1A1A] p-6 rounded-sm mb-8">
                <h2 className="font-bold text-xl mb-4">About This Event</h2>
                <p className="text-gray-300 whitespace-pre-line mb-6">{event.description}</p>
                
                <div className="flex gap-4">
                  <button className="flex items-center gap-2 bg-dark hover:bg-[#252525] px-4 py-2 rounded-sm transition-colors">
                    <Share2 className="h-4 w-4 text-primary" />
                    Share
                  </button>
                  {event.link && (
                    <a 
                      href={event.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-2 bg-dark hover:bg-[#252525] px-4 py-2 rounded-sm transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary" />
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-[#1A1A1A] p-6 rounded-sm mb-6">
                <h3 className="font-bold text-lg mb-4">Event Details</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Date & Time</p>
                      <p className="text-gray-400">{formattedDate}</p>
                      <p className="text-gray-400">{formattedTime}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-400">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Attendance</p>
                      <p className="text-gray-400">{event.attending.toLocaleString()} people attending</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Event Type</p>
                      <p className="text-gray-400 capitalize">{event.eventType}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Prominent Ticket Purchase Button */}
              <div className="mt-6 space-y-4">
                {!event.link && (
                  <div className="bg-primary/10 p-4 rounded-sm border border-primary text-center">
                    <h3 className="font-bold text-lg mb-1">Tickets Available</h3>
                    <p className="text-sm text-gray-300 mb-3">Secure your spot at {event.title} now!</p>
                    <TicketPurchase event={event} buttonText="Get Tickets Now" />
                  </div>
                )}
                
                {event.link && (
                  <div className="space-y-3">
                    <Button className="w-full bg-primary hover:bg-primary/80 text-dark">
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full h-full flex items-center justify-center"
                      >
                        Visit Event Website
                      </a>
                    </Button>
                    
                    {/* Ticket Purchase Button - Positioned right under the Visit Website button */}
                    <TicketPurchase 
                      event={event} 
                      buttonText="Get Tickets" 
                      buttonVariant="outline"
                      className="w-full" 
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Similar Events */}
          {similarEvents.length > 0 && (
            <div className="mt-12">
              <h2 className="font-bold text-2xl mb-6">Similar Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarEvents.map((similarEvent: Event) => (
                  <div key={similarEvent.id} className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/20">
                    <Link href={`/events/${similarEvent.id}`}>
                      <a>
                        <div className="relative overflow-hidden mb-4">
                          <img 
                            src={similarEvent.imageUrl || 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3'}
                            alt={similarEvent.title} 
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute top-0 left-0 m-4 bg-primary px-3 py-1">
                            <span className="font-mono text-dark text-sm uppercase font-bold">
                              {new Date(similarEvent.date).toLocaleDateString('en-US', { 
                                day: '2-digit', 
                                month: 'short' 
                              })}
                            </span>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{similarEvent.title}</h3>
                          </div>
                        </div>
                      </a>
                    </Link>
                    
                    {/* Ticket purchase for similar events */}
                    {!similarEvent.link && new Date(similarEvent.date) > new Date() && (
                      <div className="flex items-center mt-2">
                        <TicketPurchase 
                          event={similarEvent} 
                          buttonText="Quick Tickets" 
                          buttonSize="sm"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default EventDetailPage;
