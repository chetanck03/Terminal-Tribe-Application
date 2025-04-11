import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, Grid, List, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/ui/page-header";
import { EventCard } from "@/components/ui/event-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import axios from "axios";

// Define event type interface
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image?: string;
  category?: string;
  attendees?: number;
  createdBy?: {
    id: string;
    name: string;
  };
}

const EventListItem = ({ event }: { event: Event }) => {
  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <Card className="card-hover">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-48 h-48 sm:h-full">
          <img 
            src={event.image || "https://via.placeholder.com/300x200?text=No+Image"} 
            alt={event.title}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="flex flex-col justify-between p-4 flex-1">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              {event.category && <Badge className="bg-campus-blue">{event.category}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground mt-2">{formatDate(event.date)}</p>
            <p className="text-sm text-muted-foreground">{event.location}</p>
            {event.attendees != null && <p className="text-sm mt-2">{event.attendees} attending</p>}
          </div>
          <div className="mt-4">
            <Link to={`/events/${event.id}`}>
              <Button variant="outline">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Events = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [events, setEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin, user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        
        // Current date for filtering
        const now = new Date();
        
        // Split events into upcoming and past
        const allEvents = response.data;
        const upcoming = allEvents.filter(
          (event: Event) => new Date(event.date) >= now
        );
        const past = allEvents.filter(
          (event: Event) => new Date(event.date) < now
        );
        
        // If logged in, filter my events
        if (isAuthenticated && user) {
          const mine = allEvents.filter(
            (event: Event) => event.createdBy?.id === user.id
          );
          setMyEvents(mine);
        }
        
        setEvents(upcoming);
        setPastEvents(past);
        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [isAuthenticated, user]);

  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Upcoming Events" 
        description="Discover and join events happening around campus"
      >
        {isAdmin && (
          <Link to="/events/new">
            <Button className="w-full md:w-auto gap-1">
              <PlusCircle size={16} /> Add Event
            </Button>
          </Link>
        )}
      </PageHeader>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter size={16} /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>All Categories</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Technology</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Music</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Career</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Entertainment</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Academic</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Culture</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Time Period</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>All Time</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Week</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Month</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>This Year</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border rounded-md p-1 flex">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-0">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading events...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : filteredEvents.length === 0 ? (
            <Card>
              <CardHeader>No events found</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">There are no upcoming events at this time.</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="my-events" className="mt-0">
          {!isAuthenticated ? (
            <Card>
              <CardHeader>You need to sign in</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Please sign in to see your events.</p>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading your events...</p>
              </CardContent>
            </Card>
          ) : myEvents.length === 0 ? (
            <Card>
              <CardHeader>You haven't created any events yet</CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Create your first event to see it here.</p>
                {isAdmin && (
                  <Link to="/events/new">
                    <Button>Create an Event</Button>
                  </Link>
                )}
                {!isAdmin && (
                  <p className="text-muted-foreground">Only administrators can create events.</p>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {myEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-0">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">Loading past events...</p>
              </CardContent>
            </Card>
          ) : pastEvents.length === 0 ? (
            <Card>
              <CardHeader>No past events found</CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Past events will appear here.</p>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {pastEvents.map((event) => (
                <EventListItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Events;
