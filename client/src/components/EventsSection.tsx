import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Users, Calendar, Ticket } from 'lucide-react';
import { Event } from '@shared/schema';
import TicketPurchase from './TicketPurchase';

const EventsSection = () => {
  const [eventType, setEventType] = useState('all');

  const { data: events = [], isLoading, error } = useQuery<Event[]>({
    queryKey: ['/api/events/upcoming?limit=3'],
  });

  const filteredEvents = eventType === 'all' 
    ? events 
    : events.filter((event: Event) => event.eventType === eventType);

  const handleFilterChange = (type: string) => {
    setEventType(type);
  };

  if (isLoading) {
    return (
      <section id="events" className="py-16 md:py-24 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-12">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-dark rounded-sm p-4 animate-pulse">
                <div className="w-full h-64 bg-gray-800 mb-4"></div>
                <div className="h-6 bg-gray-800 mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-800 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !events) {
    return (
      <section id="events" className="py-16 md:py-24 bg-[#1A1A1A]">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="font-bold text-3xl md:text-4xl mb-6">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <div className="bg-dark p-6 rounded-sm">
            <h3 className="text-xl font-bold mb-2">Failed to load events</h3>
            <p className="text-gray-400 mb-4">Please try again later</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 md:py-24 bg-[#1A1A1A]">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex justify-between items-center mb-12">
          <h2 className="font-bold text-3xl md:text-4xl">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <div className="hidden md:flex space-x-4">
            <button 
              className={`px-4 py-2 ${eventType === 'all' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </button>
            <button 
              className={`px-4 py-2 ${eventType === 'festival' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
              onClick={() => handleFilterChange('festival')}
            >
              Festivals
            </button>
            <button 
              className={`px-4 py-2 ${eventType === 'club' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
              onClick={() => handleFilterChange('club')}
            >
              Clubs
            </button>
            <button 
              className={`px-4 py-2 ${eventType === 'livestream' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
              onClick={() => handleFilterChange('livestream')}
            >
              Livestreams
            </button>
          </div>
        </div>

        <div className="flex overflow-x-auto md:hidden space-x-4 mb-8 pb-2">
          <button 
            className={`whitespace-nowrap px-4 py-2 ${eventType === 'all' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
            onClick={() => handleFilterChange('all')}
          >
            All
          </button>
          <button 
            className={`whitespace-nowrap px-4 py-2 ${eventType === 'festival' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
            onClick={() => handleFilterChange('festival')}
          >
            Festivals
          </button>
          <button 
            className={`whitespace-nowrap px-4 py-2 ${eventType === 'club' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
            onClick={() => handleFilterChange('club')}
          >
            Clubs
          </button>
          <button 
            className={`whitespace-nowrap px-4 py-2 ${eventType === 'livestream' ? 'bg-primary text-dark' : 'bg-dark hover:bg-primary hover:text-dark'} text-white transition-colors rounded-sm`}
            onClick={() => handleFilterChange('livestream')}
          >
            Livestreams
          </button>
        </div>

        {filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event: Event) => (
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
                    <p className="text-gray-300">{event.location}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">{event.attending.toLocaleString()} attending</span>
                  </div>
                  <Link to={`/events/${event.id}`} className="text-primary hover:text-white transition-colors font-medium text-sm">
                    Details
                  </Link>
                </div>
                
                {/* Show ticket purchase button for events without external links */}
                {!event.link && new Date(event.date) > new Date() && (
                  <div className="mt-3 flex items-center">
                    <Ticket className="h-4 w-4 text-primary mr-1" />
                    <TicketPurchase 
                      event={event} 
                      buttonText="Quick Purchase" 
                      buttonSize="sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-dark p-6 rounded-sm text-center">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-gray-400 mb-4">There are no upcoming events in this category</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link to="/events" className="inline-block bg-primary hover:bg-primary/80 text-dark px-8 py-3 rounded-sm font-medium transition-colors uppercase">
            View All Events
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
