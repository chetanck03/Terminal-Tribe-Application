import { useState, useEffect } from "react";
import { Filter, Search, PlusCircle, MessageSquare, Users, Heart, Share2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import axios from "axios";
import { Link } from "react-router-dom";
import { CommunityCard } from "@/components/ui/community-card";
import { PostCard } from "@/components/ui/post-card";
import { useToast } from "@/components/ui/use-toast";

// Define interfaces
interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  memberCount: number;
  postCount: number;
  isJoined?: boolean;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const Communities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [trendingCommunities, setTrendingCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState({
    communities: true,
    posts: true
  });
  const [error, setError] = useState({
    communities: null as string | null,
    posts: null as string | null
  });

  // Generate dummy data for communities
  const generateDummyCommunities = () => {
    return [
      {
        id: "1",
        name: "Tech Enthusiasts",
        description: "A community for tech lovers to discuss latest trends and innovations",
        category: "Technology",
        memberCount: 1250,
        postCount: 456,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      },
      {
        id: "2",
        name: "Creative Arts",
        description: "Share your artwork and get inspired by others",
        category: "Arts",
        memberCount: 890,
        postCount: 234,
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      },
      {
        id: "3",
        name: "Campus Life",
        description: "Everything about student life and campus activities",
        category: "Student Life",
        memberCount: 2100,
        postCount: 789,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      }
    ];
  };

  // Generate dummy data for posts
  const generateDummyPosts = () => {
    return [
      {
        id: "1",
        content: "Just finished my first hackathon! Amazing experience building with the tech community 🚀",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes: 24,
        comments: 5,
        author: {
          id: "1",
          name: "Sarah Chen",
          avatar: "https://ui.shadcn.com/avatars/01.png"
        },
        community: {
          id: "1",
          name: "Tech Enthusiasts"
        },
        isLiked: false
      },
      {
        id: "2",
        content: "Check out my latest artwork! Inspired by our campus architecture 🎨 \n\nhttps://example.com/artwork",
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        likes: 45,
        comments: 12,
        author: {
          id: "2",
          name: "Michael Ross",
          avatar: "https://ui.shadcn.com/avatars/02.png"
        },
        community: {
          id: "2",
          name: "Creative Arts"
        },
        isLiked: true
      }
    ];
  };

  // Fetch communities
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(prev => ({ ...prev, communities: true }));
        // In a real app, this would be an API call
        const dummyCommunities = generateDummyCommunities();
        setCommunities(dummyCommunities);
        setTrendingCommunities(dummyCommunities.slice(0, 2));
        if (user) {
          setMyCommunities(dummyCommunities.slice(0, 1));
        }
        setError(prev => ({ ...prev, communities: null }));
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError(prev => ({ ...prev, communities: "Failed to load communities" }));
      } finally {
        setLoading(prev => ({ ...prev, communities: false }));
      }
    };

    fetchCommunities();
  }, [user]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(prev => ({ ...prev, posts: true }));
        // In a real app, this would be an API call
        const dummyPosts = generateDummyPosts();
        setPosts(dummyPosts);
        setError(prev => ({ ...prev, posts: null }));
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError(prev => ({ ...prev, posts: "Failed to load posts" }));
      } finally {
        setLoading(prev => ({ ...prev, posts: false }));
      }
    };

    fetchPosts();
  }, []);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      author: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      community: {
        id: "1",
        name: "Tech Enthusiasts"
      },
      isLiked: false
    };

    setPosts(prev => [post, ...prev]);
    setNewPost("");
    toast({
      title: "Post created",
      description: "Your post has been published successfully.",
    });
  };

  // Handle post like
  const handleLikePost = async (postId: string) => {
    setPosts(prev => 
      prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      })
    );
  };

  // Handle joining community
  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;

    setCommunities(prev =>
      prev.map(community => {
        if (community.id === communityId) {
          const isJoining = !community.isJoined;
          toast({
            title: isJoining ? "Joined community" : "Left community",
            description: isJoining 
              ? "You are now a member of this community." 
              : "You have left this community.",
          });
          return {
            ...community,
            isJoined: isJoining,
            memberCount: isJoining 
              ? community.memberCount + 1 
              : community.memberCount - 1
          };
        }
        return community;
      })
    );
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Filter communities based on search
  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Communities" 
        description="Connect, share, and engage with like-minded people"
      >
        {user && (
          <Link to="/communities/new">
            <Button className="w-full md:w-auto gap-1">
              <PlusCircle size={16} /> Create Community
            </Button>
          </Link>
        )}
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search communities..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
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
                <DropdownMenuCheckboxItem>Arts</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Student Life</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Sports</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Academic</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="feed" className="space-y-4">
            <TabsList>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
              <TabsTrigger value="my-communities">My Communities</TabsTrigger>
            </TabsList>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-4">
              {user ? (
                <>
                  {/* Create Post */}
                  <Card>
                    <CardContent className="pt-6">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="mb-4"
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                          Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts */}
                  {loading.posts ? (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center">Loading posts...</p>
                      </CardContent>
                    </Card>
                  ) : error.posts ? (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-red-500">{error.posts}</p>
                      </CardContent>
                    </Card>
                  ) : posts.length === 0 ? (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">No posts yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {posts.map((post) => (
                        <PostCard
                          key={post.id}
                          {...post}
                          onLike={() => handleLikePost(post.id)}
                          onComment={() => {
                            toast({
                              title: "Comments",
                              description: "Comments feature coming soon!",
                            });
                          }}
                          onShare={() => {
                            toast({
                              title: "Share",
                              description: "Share feature coming soon!",
                            });
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to Communities</CardTitle>
                    <CardDescription>Sign in to see posts from your communities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/login">
                      <Button>Sign In</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Discover Tab */}
            <TabsContent value="discover" className="space-y-4">
              {loading.communities ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <p className="text-center">Loading...</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error.communities ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-red-500">{error.communities}</p>
                  </CardContent>
                </Card>
              ) : filteredCommunities.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No communities found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      {...community}
                      onJoin={() => handleJoinCommunity(community.id)}
                      onLeave={() => handleJoinCommunity(community.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* My Communities Tab */}
            <TabsContent value="my-communities" className="space-y-4">
              {!user ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Join Communities</CardTitle>
                    <CardDescription>Sign in to see your communities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to="/login">
                      <Button>Sign In</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : loading.communities ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2].map((i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <p className="text-center">Loading...</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myCommunities.length === 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>No Communities Yet</CardTitle>
                    <CardDescription>Join some communities to see them here</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link to="/communities?tab=discover">Discover Communities</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myCommunities.map((community) => (
                    <CommunityCard
                      key={community.id}
                      {...community}
                      isJoined={true}
                      onLeave={() => handleJoinCommunity(community.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 space-y-6">
          {/* Trending Communities */}
          <Card>
            <CardHeader>
              <CardTitle>Trending Communities</CardTitle>
              <CardDescription>Popular communities this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingCommunities.map((community) => (
                <div key={community.id} className="flex items-start space-x-4">
                  {community.image && (
                    <img
                      src={community.image}
                      alt={community.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="space-y-1">
                    <h4 className="font-medium leading-none">{community.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {community.memberCount} members
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button variant="ghost" className="w-full" asChild>
                <Link to="/communities?tab=discover">Discover More</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/communities/guidelines">Community Guidelines</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/communities/featured">Featured Communities</Link>
              </Button>
              {user && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/communities/new">Create Community</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Communities; 