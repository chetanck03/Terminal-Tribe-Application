
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock active members data
const activeMembers = [
  { 
    id: 1, 
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
  },
  { 
    id: 2, 
    name: "Sam Williams",
    avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop"
  },
  { 
    id: 3, 
    name: "Taylor Garcia",
    avatar: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&h=150&fit=crop"
  },
  { 
    id: 4, 
    name: "Jordan Smith",
    avatar: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=150&h=150&fit=crop"
  },
  { 
    id: 5, 
    name: "Riley Wilson",
    avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
  }
];

// Mock data
const enrolledClubs = [
  {
    id: "2",
    name: "Coding Society",
    description: "Where developers meet to code, learn and build amazing projects together.",
    members: 104,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1610563166150-b34df4f3bcd6?q=80&w=1000",
    role: "Member",
    nextEvent: {
      title: "Code Challenge Night",
      date: "Mar 18, 2024 • 7:00 PM"
    },
    activeMembers: activeMembers.slice(0, 5)
  },
  {
    id: "5",
    name: "Environmental Club",
    description: "Working together to make our campus and community more sustainable and eco-friendly.",
    members: 58,
    category: "Environment",
    image: "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?q=80&w=1000",
    role: "Admin",
    nextEvent: {
      title: "Campus Cleanup Day",
      date: "Mar 25, 2024 • 9:00 AM"
    },
    activeMembers: activeMembers.slice(1, 6)
  }
];

const ClubDetailCard = ({ club }: { club: typeof enrolledClubs[0] }) => {
  return (
    <Card className="overflow-hidden card-hover">
      <div className="h-40 relative">
        <img 
          src={club.image} 
          alt={club.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
          <div>
            <Badge className="bg-campus-purple mb-2">{club.category}</Badge>
            <h3 className="text-xl font-bold text-white">{club.name}</h3>
          </div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Badge variant="outline">{club.role}</Badge>
          <span className="text-sm text-muted-foreground">{club.members} members</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{club.description}</p>
        
        <div className="bg-muted rounded-md p-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-campus-purple" />
            <span className="text-sm font-medium">Upcoming Event</span>
          </div>
          <div className="mt-1">
            <p className="text-sm">{club.nextEvent.title}</p>
            <p className="text-xs text-muted-foreground">{club.nextEvent.date}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Active Members</h4>
          <div className="flex -space-x-2">
            {club.activeMembers.map((member) => (
              <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
            {club.members > 5 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                +{club.members - 5}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link to={`/clubs/${club.id}`} className="flex-1">
          <Button variant="outline" className="w-full">View Club</Button>
        </Link>
        {club.role === "Admin" ? (
          <Link to={`/clubs/${club.id}/manage`} className="flex-1">
            <Button className="w-full">Manage</Button>
          </Link>
        ) : (
          <Button variant="destructive" className="flex-1">Leave Club</Button>
        )}
      </CardFooter>
    </Card>
  );
};

const MyClubs = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="My Clubs" 
        description="Manage your club memberships and activities"
      />
      
      <Tabs defaultValue="enrolled">
        <TabsList className="mb-6">
          <TabsTrigger value="enrolled">Enrolled Clubs</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enrolled" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrolledClubs.map((club) => (
              <ClubDetailCard key={club.id} club={club} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="invitations" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>No pending invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">When someone invites you to join a club, it will appear here.</p>
              <Link to="/clubs">
                <Button>Explore Clubs</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommended" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Based on your interests, you might like these clubs:</p>
              <div className="space-y-4">
                {["Chess Club", "Music Band"].map((club, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <h4 className="font-medium">{club}</h4>
                      <p className="text-sm text-muted-foreground">23-67 members</p>
                    </div>
                    <Button>Join</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyClubs;
