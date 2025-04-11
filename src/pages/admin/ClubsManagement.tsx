import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { getClubs, updateClub, deleteClub } from '@/lib/api';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  MoreHorizontal, 
  Search,
  Trash,
  Eye,
  Edit,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface ClubType {
  id: string;
  name: string;
  description: string;
  image: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED';
  createdBy: {
    id: string;
    name: string;
  };
  _count: {
    members: number;
  };
  createdAt: string;
}

const ClubsManagement = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [viewClub, setViewClub] = useState<ClubType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editClub, setEditClub] = useState<ClubType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteClubId, setDeleteClubId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED'>('ACTIVE');

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchClubs();
  }, [isAdmin, navigate, statusFilter]);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const response = await getClubs(statusFilter ? { status: statusFilter } : undefined);
      setClubs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load clubs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewClub = (club: ClubType) => {
    setViewClub(club);
    setViewDialogOpen(true);
  };

  const handleEditClub = (club: ClubType) => {
    setEditClub(club);
    setFormName(club.name);
    setFormDescription(club.description);
    setFormStatus(club.status);
    setEditDialogOpen(true);
  };

  const handleSaveClub = async () => {
    if (!editClub) return;
    
    try {
      await updateClub(editClub.id, {
        name: formName,
        description: formDescription,
        status: formStatus
      });
      
      // Update local state
      setClubs(clubs.map(club => 
        club.id === editClub.id ? { 
          ...club, 
          name: formName, 
          description: formDescription, 
          status: formStatus 
        } : club
      ));
      
      setEditDialogOpen(false);
      toast.success('Club updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update club');
    }
  };

  const handleDeleteClick = (clubId: string) => {
    setDeleteClubId(clubId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteClubId) return;
    
    try {
      await deleteClub(deleteClubId);
      
      // Update local state
      setClubs(clubs.filter(club => club.id !== deleteClubId));
      
      setDeleteDialogOpen(false);
      toast.success('Club deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete club');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline">Inactive</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const filteredClubs = clubs.filter(club => 
    (club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
        <Button onClick={fetchClubs} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Club Management</h1>
        <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clubs..."
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
            variant={statusFilter === 'ACTIVE' ? "default" : "outline"}
            onClick={() => setStatusFilter('ACTIVE')}
          >
            Active
          </Button>
          <Button 
            variant={statusFilter === 'INACTIVE' ? "default" : "outline"}
            onClick={() => setStatusFilter('INACTIVE')}
          >
            Inactive
          </Button>
          <Button 
            variant={statusFilter === 'PENDING' ? "default" : "outline"}
            onClick={() => setStatusFilter('PENDING')}
          >
            Pending
          </Button>
        </div>
      </div>
      
      {/* Clubs Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No clubs found
                </TableCell>
              </TableRow>
            ) : (
              filteredClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell className="font-medium">{club.name}</TableCell>
                  <TableCell>{club.createdBy.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {club._count.members}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(club.status)}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewClub(club)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClub(club)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(club.id)}
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
      
      {/* View Club Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewClub?.name}</DialogTitle>
            <DialogDescription>
              Club Details
            </DialogDescription>
          </DialogHeader>
          {viewClub && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">{viewClub.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Status</h3>
                  <div className="mt-1">{getStatusBadge(viewClub.status)}</div>
                </div>
                <div>
                  <h3 className="font-medium">Members</h3>
                  <p className="text-muted-foreground flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    {viewClub._count.members} members
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium">Created By</h3>
                <p className="text-muted-foreground">{viewClub.createdBy.name}</p>
              </div>
              
              {viewClub.image && (
                <div>
                  <h3 className="font-medium">Club Image</h3>
                  <div className="mt-2">
                    <img
                      src={viewClub.image}
                      alt={viewClub.name}
                      className="w-full max-w-md rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Club Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>
              Update club details and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={formStatus}
                onValueChange={(value) => setFormStatus(value as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Status</SelectLabel>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveClub}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this club? This will also remove all members and associated events. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Club
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClubsManagement; 