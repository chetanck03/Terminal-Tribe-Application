import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, Send, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import axios from "axios";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ClubMember {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  role: string;
  joinedAt: string;
}

interface Club {
  id: string;
  name: string;
  description: string;
  content?: string;
  image?: string;
  category?: string;
  status: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  _count?: {
    members: number;
  };
  members: ClubMember[];
}

const ClubDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isMember, setIsMember] = useState(false);
  
  // Fetch club details
  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/clubs/${id}`);
        setClub(response.data);
        
        // Check if user is a member
        if (user && response.data.members) {
          setIsMember(response.data.members.some(
            (member: ClubMember) => member.user.id === user.id
          ));
        }
      } catch (error) {
        console.error("Error fetching club:", error);
        toast({
          title: "Error",
          description: "Failed to load club details.",
          variant: "destructive"
        });
        navigate("/clubs");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClub();
  }, [id, user, navigate, toast]);
  
  // Subscribe to real-time messages
  useEffect(() => {
    if (!id || !isMember) return;
    
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const { data: messages, error } = await supabase
          .from('club_messages')
          .select(`
            id,
            content,
            created_at,
            user:user_id (
              id,
              name,
              avatar
            )
          `)
          .eq('club_id', id)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error("Error fetching messages:", error);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again.",
            variant: "destructive"
          });
          return;
        }
        
        // Transform the data to match the Message interface
        const transformedMessages = messages?.map(msg => ({
          id: msg.id,
          content: msg.content,
          createdAt: msg.created_at,
          user: msg.user
        })) || [];
        
        setMessages(transformedMessages);
        scrollToBottom();
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
    
    // Subscribe to new messages
    const subscription = supabase
      .channel('club_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'club_messages',
          filter: `club_id=eq.${id}`
        },
        async (payload) => {
          // Fetch the complete message with user data
          const { data: message, error } = await supabase
            .from('club_messages')
            .select(`
              id,
              content,
              created_at,
              user:user_id (
                id,
                name,
                avatar
              )
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }
          
          // Transform the message to match the Message interface
          const transformedMessage = {
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            user: message.user
          };
          
          setMessages(prev => [...prev, transformedMessage]);
          scrollToBottom();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [id, isMember]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleJoinClub = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to join this club.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    try {
      setJoining(true);
      await axios.post(`/api/clubs/${id}/join`, {}, {
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`
        }
      });
      
      toast({
        title: "Success",
        description: "You have successfully joined the club!",
      });
      
      setIsMember(true);
      
      // Refresh club data to update member count
      const response = await axios.get(`/api/clubs/${id}`);
      setClub(response.data);
    } catch (error: any) {
      console.error("Error joining club:", error);
      let errorMessage = "Failed to join the club. Please try again.";
      
      if (error.response) {
        if (error.response.status === 400 && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 401) {
          errorMessage = "Please log in to join this club.";
          navigate("/login");
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setJoining(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || !id || !club) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to send messages.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }
      
      if (!club) {
        toast({
          title: "Error",
          description: "Club not found. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }
      
      if (!id) {
        toast({
          title: "Error",
          description: "Invalid club ID. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      return;
    }
    
    if (!isMember) {
      toast({
        title: "Permission Denied",
        description: "You must be a member to send messages in this club.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSendingMessage(true);
      
      // First check if the club still exists and user is still a member
      const { data: memberCheck, error: memberError } = await supabase
        .from('club_members')
        .select('id')
        .eq('club_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (memberError || !memberCheck) {
        toast({
          title: "Error",
          description: "You are no longer a member of this club.",
          variant: "destructive"
        });
        setIsMember(false);
        return;
      }
      
      const { data: message, error } = await supabase
        .from('club_messages')
        .insert({
          club_id: id,
          user_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString()
        })
        .select(`
          id,
          content,
          created_at,
          user:user_id (
            id,
            name,
            avatar
          )
        `)
        .single();
        
      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to send message. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Transform the message to match the Message interface
      const transformedMessage = {
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        user: message.user
      };
      
      // Only clear the message if it was sent successfully
      setNewMessage("");
      
      // Add the transformed message to the local state
      setMessages(prev => [...prev, transformedMessage]);
      scrollToBottom();
      
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
      </div>
    );
  }
  
  if (!club) {
    return (
      <Card>
        <CardHeader>Club not found</CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This club doesn't exist or has been removed.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader 
        title={club.name}
        description={club.description}
      >
        {!isMember && (
          <Button 
            onClick={handleJoinClub} 
            disabled={joining}
            className="w-full md:w-auto"
          >
            {joining ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Joining...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Join Club
              </>
            )}
          </Button>
        )}
      </PageHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              {club.image && (
                <div className="rounded-lg overflow-hidden mb-6">
                  <img 
                    src={club.image} 
                    alt={club.name} 
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="prose max-w-none dark:prose-invert">
                {club.content || club.description}
              </div>
            </CardContent>
          </Card>
          
          {isMember && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Club Chat</h3>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4 border rounded-lg">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex gap-3 ${
                          message.user.id === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.user.avatar} />
                          <AvatarFallback>
                            {message.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${
                          message.user.id === user?.id ? 'items-end' : ''
                        }`}>
                          <div className={`px-3 py-2 rounded-lg ${
                            message.user.id === user?.id
                              ? 'bg-campus-blue text-white'
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {message.user.name} • {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={sendingMessage}
                    />
                    <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                      {sendingMessage ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span>{club._count?.members || 0} members</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span>Created by {club.createdBy.name}</span>
                </div>
                
                {club.category && (
                  <div className="inline-block px-2 py-1 text-xs font-medium bg-campus-purple/10 text-campus-purple rounded-full">
                    {club.category.charAt(0).toUpperCase() + club.category.slice(1)}
                  </div>
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h4 className="font-medium">Recent Members</h4>
                <div className="space-y-3">
                  {club.members.slice(0, 5).map((member) => (
                    <div key={member.user.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user.avatar} />
                        <AvatarFallback>
                          {member.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubDetail; 