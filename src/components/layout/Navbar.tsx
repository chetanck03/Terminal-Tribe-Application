import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, Search, Shield, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userInitials, setUserInitials] = useState<string>("U");
  const [avatarLoading, setAvatarLoading] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Update user data when user changes
  useEffect(() => {
    if (user) {
      setAvatarLoading(true);
      console.log("Navbar: Updating user avatar", user.user_metadata?.avatar);
      setUserAvatar(user.user_metadata?.avatar || null);
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || "User");
      setUserInitials(getInitials(user.user_metadata?.name || user.email?.split('@')[0] || "User"));
      // Use a small timeout to ensure state updates properly
      setTimeout(() => setAvatarLoading(false), 100);
    }
  }, [user, user?.user_metadata?.avatar, user?.user_metadata?.name]);

  return (
    <nav className="glass-effect border-b border-white/20 fixed top-0 left-0 right-0 z-50">
      <div className="campus-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo and site name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md campus-gradient flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="text-xl font-bold text-campus-blue hidden sm:block">
                <span className="text-gradient">Xplore</span>
              </span>
            </Link>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 w-full bg-white/50 backdrop-blur-sm border-white/30 focus:border-campus-blue/50 transition-all"
              />
            </div>
          </div>

          {/* Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="hover:bg-white/20">
                  <Bell size={20} />
                </Button>
                <Link to="/settings">
                  <Button variant="ghost" size="icon" className="hover:bg-white/20">
                    <Settings size={20} />
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="ml-2 hover:bg-white/20">
                      <Avatar className="h-8 w-8 ring-2 ring-white/30">
                        {!avatarLoading && (
                          <>
                            <AvatarImage src={userAvatar || ""} alt={userName} loading="eager" />
                            <AvatarFallback className="bg-gradient-to-br from-campus-blue to-campus-purple text-white">
                              {userInitials}
                            </AvatarFallback>
                          </>
                        )}
                        {avatarLoading && (
                          <AvatarFallback className="animate-pulse bg-gradient-to-br from-campus-blue to-campus-purple text-white">
                            {userInitials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-effect">
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-white/20">
                          <Link to="/admin/dashboard" className="flex items-center w-full">
                            <Shield className="mr-2 h-4 w-4 text-red-500" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/20" />
                      </>
                    )}
                    <DropdownMenuItem asChild className="hover:bg-white/20">
                      <Link to="/profile" className="w-full">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-white/20">
                      <Link to="/settings" className="w-full">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-white/20">
                      <button 
                        className="w-full text-left" 
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hover:bg-white/20">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button className="campus-gradient hover:opacity-90 transition-opacity">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {user && (
              <Link to="/settings" className="mr-2">
                <Button variant="ghost" size="icon" className="hover:bg-white/20">
                  <Settings size={20} />
                </Button>
              </Link>
            )}
            <button
              className="text-gray-600 hover:text-campus-blue focus:outline-none"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in glass-effect rounded-b-xl">
            <div className="px-2 pt-2 pb-3 space-y-3">
              {user && (
                <div className="flex items-center space-x-3 pb-3 mb-2 border-b border-white/20">
                  <Avatar className="h-10 w-10 ring-2 ring-white/30">
                    {!avatarLoading && (
                      <>
                        <AvatarImage src={userAvatar || ""} alt={userName} loading="eager" />
                        <AvatarFallback className="bg-gradient-to-br from-campus-blue to-campus-purple text-white">
                          {userInitials}
                        </AvatarFallback>
                      </>
                    )}
                    {avatarLoading && (
                      <AvatarFallback className="animate-pulse bg-gradient-to-br from-campus-blue to-campus-purple text-white">
                        {userInitials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{userName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>
              <Link to="/">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Dashboard</Button>
              </Link>
              <Link to="/events">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Events</Button>
              </Link>
              <Link to="/clubs">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Clubs</Button>
              </Link>
              <Link to="/timeline">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Timeline</Button>
              </Link>
              {user && (
                <Link to="/profile">
                  <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Profile</Button>
                </Link>
              )}
              {user && (
                <Link to="/settings">
                  <Button variant="ghost" className="w-full justify-start hover:bg-white/20">Settings</Button>
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="ghost" className="w-full justify-start hover:bg-white/20">
                    <Shield className="mr-2 h-4 w-4 text-red-500" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              {user ? (
                <Button variant="ghost" className="w-full justify-start hover:bg-white/20" onClick={() => signOut()}>
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full hover:bg-white/20 border-white/30">Login</Button>
                  </Link>
                  <Link to="/signup" className="w-full">
                    <Button className="w-full campus-gradient hover:opacity-90 transition-opacity">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
