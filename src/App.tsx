import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import AppLayout from "@/components/layout/AppLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Events from "@/pages/Events";
import EventForm from "@/pages/EventForm";
import EventDetail from "@/pages/EventDetail";
import Clubs from "@/pages/Clubs";
import Communities from "@/pages/Communities";
import Timeline from "@/pages/Timeline";
import MyClubs from "@/pages/MyClubs";
import Profile from "@/pages/Profile";
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import EmailVerificationRequired from "@/pages/Auth/EmailVerificationRequired";
import ProtectedRoute from "@/components/ProtectedRoute";
import Settings from "@/pages/Settings";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import ClubForm from "@/pages/ClubForm";
import ClubDetail from "@/pages/ClubDetail";

// Admin pages
import AdminDashboard from "@/pages/admin/Dashboard";
import UsersManagement from "@/pages/admin/UsersManagement";
import EventsManagement from "@/pages/admin/EventsManagement";
import ClubsManagement from "@/pages/admin/ClubsManagement";

const queryClient = new QueryClient();

// Protected route component for admin-only routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
    </div>;
  }
  
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/email-verification-required" element={<EmailVerificationRequired />} />
            
            {/* Legal Pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Main App Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/communities" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <Communities />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/communities/:id" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <Communities />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <Events />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/events/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AppLayout>
                  <EventForm />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/events/:id" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <EventDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clubs" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <Clubs />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clubs/new" element={
              <ProtectedRoute requireAdmin={true}>
                <AppLayout>
                  <ClubForm />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clubs/:id" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <ClubDetail />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/timeline" element={
              <ProtectedRoute requireVerification={false}>
                <AppLayout>
                  <Timeline />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/my-clubs" element={
              <ProtectedRoute>
                <AppLayout>
                  <MyClubs />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <UsersManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <EventsManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/clubs" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout>
                  <ClubsManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            {/* Unauthorized Route */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
