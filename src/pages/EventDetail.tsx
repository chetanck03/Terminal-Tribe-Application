import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Edit, Trash2, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import axios from "axios";

// Define Event type
interface Event {
  id: string;
  title: string;
  description: string;
  content?: string;
  date: string;
  location: string;
  image?: string;
  category?: string;
  status: string;
  createdBy: {
    id: string;
    name: string;
  };
  attendees?: Array<{
    user: {
      id: string;
      name: string;
    };
    status: string;
  }>;
}

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAttending, setIsAttending] = useState(false);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [joinLoading, setJoinLoading] = useState(false);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [registrationForm, setRegistrationForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const { toast } = useToast();
  const { user, isAdmin, isAuthenticated } = useAuth();

  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/events/${id}`);
        setEvent(response.data);
        
        // Check if current user is attending
        if (isAuthenticated && user && response.data.attendees) {
          const isUserAttending = response.data.attendees.some(
            (attendee: any) => attendee.user.id === user.id
          );
          setIsAttending(isUserAttending);
          setAttendeeCount(response.data.attendees.length);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchEventDetails();
    }
  }, [id, isAuthenticated, user]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Handle registration form input changes
  const handleRegistrationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle registration form submission
  const handleRegistrationSubmit = async () => {
    if (!registrationForm.name || !registrationForm.email || !registrationForm.phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setJoinLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsAttending(true);
      setAttendeeCount(prev => prev + 1);
      setShowRegistrationDialog(false);
      
      toast({
        title: "Success",
        description: "You have successfully registered for this event!"
      });
      
      // Reset form
      setRegistrationForm({
        name: "",
        email: "",
        phone: ""
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to register for the event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoinLoading(false);
    }
  };

  // Modified handleAttendanceToggle
  const handleAttendanceToggle = async () => {
    if (isAttending) {
      try {
        setJoinLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsAttending(false);
        setAttendeeCount(prev => prev - 1);
        toast({
          title: "Success",
          description: "You have successfully left this event."
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to leave the event. Please try again.",
          variant: "destructive"
        });
      } finally {
        setJoinLoading(false);
      }
    } else {
      setShowRegistrationDialog(true);
    }
  };

  // Delete event handler
  const handleDeleteEvent = async () => {
    try {
      await axios.delete(`/api/events/${id}`);
      toast({
        title: "Event Deleted",
        description: "The event has been successfully deleted."
      });
      // Navigate to events page
      window.location.href = "/events";
    } catch (err: any) {
      console.error("Error deleting event:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Event Details" description="Loading event information...">
          <Link to="/events">
            <Button variant="outline" className="gap-1">
              <ArrowLeft size={16} /> Back to Events
            </Button>
          </Link>
        </PageHeader>
        <div className="my-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Event Details" description="There was a problem loading this event">
          <Link to="/events">
            <Button variant="outline" className="gap-1">
              <ArrowLeft size={16} /> Back to Events
            </Button>
          </Link>
        </PageHeader>
        <Card className="my-8">
          <CardContent className="py-6">
            <p className="text-center text-red-500">{error || "Event not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userCanEdit = isAuthenticated && 
    (isAdmin || (user && event.createdBy.id === user.id));

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={event.title} 
        description={`Hosted by ${event.createdBy.name}`}
      >
        <div className="flex gap-2">
          <Link to="/events">
            <Button variant="outline" className="gap-1">
              <ArrowLeft size={16} /> Back to Events
            </Button>
          </Link>
          
          {userCanEdit && (
            <div className="flex gap-2">
              <Link to={`/events/${event.id}/edit`}>
                <Button variant="outline" className="gap-1">
                  <Edit size={16} /> Edit
                </Button>
              </Link>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-1">
                    <Trash2 size={16} /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </PageHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
          {event.image && (
            <div className="mb-6 rounded-lg overflow-hidden h-64 md:h-96">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <Card>
            <CardContent className="p-6">
              {event.category && (
                <Badge className="mb-4 bg-campus-blue">
                  {event.category}
                </Badge>
              )}
              
              <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
              
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-muted-foreground" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-muted-foreground" />
                  <span>{formatTime(event.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-muted-foreground" />
                  <span>{attendeeCount} people attending</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">About this event</h3>
              <div className="space-y-4">
                <p>{event.description}</p>
                {event.content && event.content !== event.description && (
                  <p>{event.content}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Join Event</h3>
              
              <div className="mb-4">
                <p className="text-sm mb-2">Date and Time</p>
                <p className="font-medium">{formatDate(event.date)}</p>
                <p className="font-medium">{formatTime(event.date)}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm mb-2">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
              
              <Button
                className="w-full"
                variant={isAttending ? "outline" : "default"}
                disabled={joinLoading}
                onClick={handleAttendanceToggle}
              >
                {joinLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                    Processing...
                  </div>
                ) : isAttending ? (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Registered - Click to Leave
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Register for Event
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for {event?.title}</DialogTitle>
            <DialogDescription>
              Please fill in your details to register for this event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter your full name"
                  className="pl-9"
                  value={registrationForm.name}
                  onChange={handleRegistrationInput}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-9"
                  value={registrationForm.email}
                  onChange={handleRegistrationInput}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  className="pl-9"
                  value={registrationForm.phone}
                  onChange={handleRegistrationInput}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegistrationSubmit} disabled={joinLoading}>
              {joinLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  Processing...
                </div>
              ) : (
                "Complete Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail; 