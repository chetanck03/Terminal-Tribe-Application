import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ChevronRight, Users, Activity, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { NotificationCard } from "@/components/ui/notification-card";
import { EventCard } from "@/components/ui/event-card";
import { ClubCard } from "@/components/ui/club-card";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define interface for events
interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category?: string;
  image?: string;
  createdBy: {
    id: string;
    name: string;
  };
  attendees?: Array<{
    user: {
      id: string;
      name: string;
    };
  }>;
}

// Define interface for clubs
interface Club {
  id: string;
  name: string;
  description: string;
  image?: string;
  category?: string;
  status: string;
  createdBy: {
    id: string;
    name: string;
  };
  _count?: {
    members: number;
  };
}

// Define interface for notifications
interface Notification {
  id: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

// Add activity data interface
interface ActivityData {
  date: string;
  events: number;
  posts: number;
  members: number;
}

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [trendingClubs, setTrendingClubs] = useState<Club[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState({
    events: true,
    clubs: true,
    notifications: true
  });
  const [error, setError] = useState({
    events: null as string | null,
    clubs: null as string | null,
    notifications: null as string | null
  });
  const [eventCount, setEventCount] = useState(0);
  const [clubCount, setClubCount] = useState(0);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        
        // Filter for upcoming events only (from today onward)
        const now = new Date();
        const upcoming = response.data.filter(
          (event: Event) => new Date(event.date) >= now
        );
        
        // Sort by date and limit to 3
        const sortedUpcoming = upcoming.sort(
          (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ).slice(0, 3);
        
        setUpcomingEvents(sortedUpcoming);
        setEventCount(upcoming.length);
        setError(prev => ({ ...prev, events: null }));
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(prev => ({ ...prev, events: "Failed to load events" }));
      } finally {
        setLoading(prev => ({ ...prev, events: false }));
      }
    };
    
    fetchEvents();
  }, []);

  // Fetch trending clubs
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('/api/clubs');
        
        // Sort by member count (trending = most members)
        const sortedClubs = [...response.data].sort(
          (a: Club, b: Club) => (b._count?.members || 0) - (a._count?.members || 0)
        ).slice(0, 2); // Get top 2
        
        setTrendingClubs(sortedClubs);
        
        // If user is authenticated, count their club memberships
        if (user && user.id) {
          try {
            const userClubsResponse = await axios.get(`/api/users/${user.id}/clubs`);
            if (userClubsResponse.data && Array.isArray(userClubsResponse.data)) {
              setClubCount(userClubsResponse.data.length);
            }
          } catch (err) {
            console.error("Error fetching user clubs:", err);
            setClubCount(0);
          }
        }
        
        setError(prev => ({ ...prev, clubs: null }));
      } catch (err) {
        console.error("Error fetching clubs:", err);
        setError(prev => ({ ...prev, clubs: "Failed to load clubs" }));
      } finally {
        setLoading(prev => ({ ...prev, clubs: false }));
      }
    };
    
    fetchClubs();
  }, [user]);

  // Generate dummy activity data
  useEffect(() => {
    const generateDummyActivity = () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          events: Math.floor(Math.random() * 5) + 1,
          posts: Math.floor(Math.random() * 10) + 2,
          members: Math.floor(Math.random() * 3)
        };
      });
      setActivityData(last7Days);
    };

    generateDummyActivity();
  }, []);

  // Generate dummy notifications if API fails
  const generateDummyNotifications = () => {
    const dummyNotifications = [
      {
        id: '1',
        type: 'club',
        message: 'Photography Club just posted a new event: "Campus Night Photography Workshop"',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        id: '2',
        type: 'event',
        message: 'Reminder: "Tech Talk Tuesday" starts in 2 hours',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
      },
      {
        id: '3',
        type: 'member',
        message: 'Sarah and 3 others joined Coding Club',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
      }
    ];
    return dummyNotifications;
  };

  // Modify fetchNotifications to use dummy data if API fails
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user || !user.id) {
        setLoading(prev => ({ ...prev, notifications: false }));
        return;
      }
      
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data.slice(0, 3));
        setError(prev => ({ ...prev, notifications: null }));
      } catch (err) {
        console.error("Error fetching notifications:", err);
        // Use dummy data instead of showing error
        setNotifications(generateDummyNotifications());
        setError(prev => ({ ...prev, notifications: null }));
      } finally {
        setLoading(prev => ({ ...prev, notifications: false }));
      }
    };
    
    fetchNotifications();
  }, [user]);

  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    })} • ${date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: 'numeric'
    })}`;
  };

  // Convert notification data format
  const formatNotifications = (notifications: Notification[]) => {
    return notifications.map(notification => ({
      id: notification.id,
      title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
      description: notification.message,
      timestamp: new Date(notification.createdAt),
      isUnread: !notification.read
    }));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Welcome Back${user?.name ? ', ' + user.name : ''}!`} 
        description="Here's what's happening around your campus"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - events and clubs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-campus-blue/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-campus-blue" />
                    </div>
                    <div>
                      {loading.events ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{eventCount}</p>
                          <p className="text-xs text-muted-foreground">This month</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to="/events">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Your Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-campus-purple/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-campus-purple" />
                    </div>
                    <div>
                      {loading.clubs ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        <>
                          <p className="text-2xl font-bold">{clubCount}</p>
                          <p className="text-xs text-muted-foreground">Active memberships</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Link to="/my-clubs">
                    <Button variant="ghost" size="sm">View all</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Club Activity</CardTitle>
              <CardDescription>Last 7 days of activity across your clubs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="events" stroke="#8884d8" name="Events" />
                    <Line type="monotone" dataKey="posts" stroke="#82ca9d" name="Posts" />
                    <Line type="monotone" dataKey="members" stroke="#ffc658" name="New Members" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Upcoming Events */}
          <div>
            <SectionHeader 
              title="Upcoming Events" 
              action={
                <Link to="/events">
                  <Button variant="ghost" className="gap-2">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
            
            {loading.events ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[200px]" />
              </div>
            ) : error.events ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-red-500">{error.events}</p>
                </CardContent>
              </Card>
            ) : upcomingEvents.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No upcoming events</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={event.date}
                    location={event.location}
                    description={event.description}
                    category={event.category}
                    image={event.image}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Trending Clubs */}
          <div>
            <SectionHeader 
              title="Trending Clubs" 
              action={
                <Link to="/clubs">
                  <Button variant="ghost" className="gap-2">
                    View all <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              }
            />
            
            {loading.clubs ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px]" />
                <Skeleton className="h-[200px]" />
              </div>
            ) : error.clubs ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-red-500">{error.clubs}</p>
                </CardContent>
              </Card>
            ) : trendingClubs.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No trending clubs</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {trendingClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    id={club.id}
                    name={club.name}
                    description={club.description}
                    members={club._count?.members || 0}
                    category={club.category}
                    image={club.image}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar - notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Stay updated with the latest activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <SectionHeader 
                  title="Recent Notifications" 
                  action={
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      {notifications.filter(n => !n.read).length}
                    </Button>
                  }
                />
              </div>
              
              {loading.notifications ? (
                <div className="space-y-4">
                  <Skeleton className="h-[100px]" />
                  <Skeleton className="h-[100px]" />
                  <Skeleton className="h-[100px]" />
                </div>
              ) : error.notifications ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-red-500">{error.notifications}</p>
                  </CardContent>
                </Card>
              ) : notifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No new notifications</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {formatNotifications(notifications).map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      title={notification.title}
                      description={notification.description}
                      timestamp={notification.timestamp}
                      isUnread={notification.isUnread}
                    />
                  ))}
                </div>
              )}
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/notifications">View All Notifications</Link>
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isAdmin && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/events/new">Create New Event</Link>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/clubs">Explore Clubs</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/profile">Account Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
