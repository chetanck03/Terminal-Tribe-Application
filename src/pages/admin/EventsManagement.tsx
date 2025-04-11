import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { getEvents, approveEvent, rejectEvent, deleteEvent } from '@/lib/api';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Search,
  Check,
  X,
  Trash,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

interface EventType {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

const EventsManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewEvent, setViewEvent] = useState<EventType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchEvents();
  }, [isAdmin, navigate, statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getEvents(statusFilter ? { status: statusFilter } : undefined);
      setEvents(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEvent = (event: EventType) => {
    setViewEvent(event);
    setViewDialogOpen(true);
  };

  const handleApproveEvent = async (id: string) => {
    try {
      await approveEvent(id);
      
      // Update local state
      setEvents(events.map(event => 
        event.id === id ? { ...event, status: 'APPROVED' } : event
      ));
      
      toast.success('Event approved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to approve event');
    }
  };

  const handleRejectEvent = async (id: string) => {
    try {
      await rejectEvent(id);
      
      // Update local state
      setEvents(events.map(event => 
        event.id === id ? { ...event, status: 'REJECTED' } : event
      ));
      
      toast.success('Event rejected successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject event');
    }
  };

  const handleDeleteClick = (eventId: string) => {
    setDeleteEventId(eventId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEventId) return;
    
    try {
      await deleteEvent(deleteEventId);
      
      // Update local state
      setEvents(events.filter(event => event.id !== deleteEventId));
      
      setDeleteDialogOpen(false);
      toast.success('Event deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredEvents = events.filter(event => 
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 text-xl">{error}</p>
        <Button onClick={fetchEvents} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Management</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/events/new')} variant="default">
            <Calendar className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === 'PENDING' ? "default" : "outline"}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </Button>
          <Button 
            variant={statusFilter === 'APPROVED' ? "default" : "outline"}
            onClick={() => setStatusFilter('APPROVED')}
          >
            Approved
          </Button>
          <Button 
            variant={statusFilter === 'REJECTED' ? "default" : "outline"}
            onClick={() => setStatusFilter('REJECTED')}
          >
            Rejected
          </Button>
        </div>
      </div>
      
      {/* Events Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.createdBy.name}</TableCell>
                  <TableCell>{formatDate(event.date)}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{getStatusBadge(event.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewEvent(event)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {event.status === 'PENDING' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApproveEvent(event.id)}>
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectEvent(event.id)}>
                              <X className="mr-2 h-4 w-4 text-red-500" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(event.id)}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* View Event Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewEvent?.title}</DialogTitle>
            <DialogDescription>
              Event Details
            </DialogDescription>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-muted-foreground">{viewEvent.description}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <div className="mt-1">{getStatusBadge(viewEvent.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p className="text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {formatDate(viewEvent.date)}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-muted-foreground">{viewEvent.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Created By</h3>
                <p className="text-muted-foreground">{viewEvent.createdBy.name}</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-row justify-end sm:space-x-2">
            {viewEvent?.status === 'PENDING' && (
              <>
                <Button
                  variant="default"
                  onClick={() => {
                    handleApproveEvent(viewEvent.id);
                    setViewDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejectEvent(viewEvent.id);
                    setViewDialogOpen(false);
                  }}
                  className="text-red-600 border-red-600"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsManagement; 