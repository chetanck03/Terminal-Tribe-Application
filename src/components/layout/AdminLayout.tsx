import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import ChatBot from "../ChatBot";

import {
  LayoutDashboard,
  Users,
  Calendar,
  Flag,
  Menu,
  X,
  Home,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    // Start with sidebar closed on mobile, open on desktop
    setIsSidebarOpen(window.innerWidth >= 768);
    
    // Load user avatar
    if (user) {
      setAvatarLoading(true);
      setUserAvatar(user.user_metadata?.avatar || null);
      
      // Calculate initials
      const name = user.user_metadata?.name || user.email?.split('@')[0] || "";
      const initials = name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
        
      setInitials(initials || user.email?.charAt(0).toUpperCase() || "U");
      
      // Set small timeout to ensure state updates properly
      setTimeout(() => setAvatarLoading(false), 100);
    }
  }, [user, user?.user_metadata?.avatar]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/admin/dashboard",
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users",
    },
    {
      title: "Events",
      icon: <Calendar className="h-5 w-5" />,
      path: "/admin/events",
    },
    {
      title: "Clubs",
      icon: <Flag className="h-5 w-5" />,
      path: "/admin/clubs",
    },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Admin Header */}
      <header className="bg-white border-b shadow-sm z-10 flex items-center h-16 px-4 fixed top-0 left-0 right-0">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center ml-2 md:ml-0">
            <div className="h-8 w-8 rounded-md campus-gradient flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-campus-blue ml-2 hidden md:block">Admin Panel</span>
          </div>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Home className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
          {user && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                {!avatarLoading && (
                  <>
                    <AvatarImage src={userAvatar || ""} alt="User" loading="eager" />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </>
                )}
                {avatarLoading && (
                  <AvatarFallback className="animate-pulse">{initials}</AvatarFallback>
                )}
              </Avatar>
              <span className="ml-2 text-sm font-medium hidden md:block">{user.email}</span>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside
          className={cn(
            "bg-white w-64 border-r transition-all duration-300 z-20",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full",
            "md:translate-x-0 fixed md:static h-[calc(100vh-4rem)] top-16"
          )}
        >
          <div className="flex flex-col h-full p-4">
            <nav className="space-y-1 flex-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-campus-blue text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
            
            <div className="pt-4 border-t mt-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-gray-50 transition-all duration-300",
          !isSidebarOpen && "md:ml-0",
        )}>
          <div className="min-h-full">{children}</div>
        </main>
      </div>
      <ChatBot configUrl="https://files.bpcontent.cloud/2025/04/10/10/20250410104555-7B33LUMD.json" />
    </div>
  );
};

export default AdminLayout; 