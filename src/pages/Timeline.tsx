
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ActivityItem } from "@/components/ui/activity-item";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Mock data with real image URLs for avatars
const activities = [
  {
    id: "1",
    user: {
      name: "Jordan Smith",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
    },
    action: "joined",
    target: {
      type: 'club' as const,
      name: "Coding Society",
      id: "2"
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2))
  },
  {
    id: "2",
    user: {
      name: "Alex Johnson",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop"
    },
    action: "is attending",
    target: {
      type: 'event' as const,
      name: "Campus Tech Fair",
      id: "1"
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 5))
  },
  {
    id: "3",
    user: {
      name: "Sam Williams",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
    },
    action: "posted in",
    target: {
      type: 'club' as const,
      name: "Photography Club",
      id: "1"
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 8))
  },
  {
    id: "4",
    user: {
      name: "Taylor Garcia",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop"
    },
    action: "created",
    target: {
      type: 'event' as const,
      name: "Film Screening Night",
      id: "4"
    },
    timestamp: new Date(new Date().setHours(new Date().getHours() - 10))
  },
  {
    id: "5",
    user: {
      name: "Jordan Smith",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
    },
    action: "commented on",
    target: {
      type: 'event' as const,
      name: "Spring Music Festival",
      id: "2"
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    id: "6",
    user: {
      name: "Avery Martinez",
      avatar: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop"
    },
    action: "joined",
    target: {
      type: 'club' as const,
      name: "Environmental Club",
      id: "5"
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1))
  },
  {
    id: "7",
    user: {
      name: "Riley Wilson",
      avatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop"
    },
    action: "is attending",
    target: {
      type: 'event' as const,
      name: "Career Workshop",
      id: "3"
    },
    timestamp: new Date(new Date().setDate(new Date().getDate() - 2))
  }
];

const Timeline = () => {
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Your Timeline" 
        description="Stay updated with activities from your campus community"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-1">
              <Filter size={16} /> Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Activity Type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>All Activities</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Club Related</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Event Related</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Comments & Posts</DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Time Period</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>All Time</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>Today</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>This Week</DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem>This Month</DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
          <TabsTrigger value="my-activity">My Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-1">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="following" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-1">
                {activities.slice(1, 5).map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="my-activity" className="mt-0">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-1">
                {activities.filter(a => a.user.name === "Jordan Smith").map((activity) => (
                  <ActivityItem key={activity.id} {...activity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Timeline;
