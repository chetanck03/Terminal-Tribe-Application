import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, User, Lock, Bell, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, isAdmin, updateUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Debug logging
  console.log("Settings component rendering", { 
    userExists: !!user, 
    userData: user,
    isAdmin,
    authLoading
  });
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: user?.user_metadata?.name || "",
    email: user?.email || "",
    bio: user?.user_metadata?.bio || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.user_metadata?.avatar || null);
  const [avatarFeatureAvailable, setAvatarFeatureAvailable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!authLoading && !user) {
      console.log("No authenticated user, redirecting to login");
      toast.error("Please login to access settings");
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    document.title = "Account Settings | Xplore";
    
    console.log("Settings useEffect triggered", { 
      userExists: !!user,
      userEmail: user?.email,
      userMetadata: user?.user_metadata
    });
    
    // Update user data when user state changes
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.user_metadata?.name || "",
        email: user.email || "",
        bio: user.user_metadata?.bio || ""
      }));
      
      // Set avatar preview from user metadata
      if (user.user_metadata?.avatar) {
        setAvatarPreview(user.user_metadata.avatar);
      }
    }
    
    // Ensure User table has avatar column
    const ensureAvatarColumn = async () => {
      if (!user) return;
      
      // We'll skip the column check since it's causing errors
      // Avatar updates will still work through the user metadata
      console.log('Skipping avatar column check to avoid errors');
      
      // If we need to actually verify or create the column,
      // this would require a database migration which is outside
      // the scope of client-side code
    };
    
    // Ensure avatar storage bucket exists
    const ensureAvatarBucket = async () => {
      if (!user) return; // Don't try to access Supabase without a user
      
      try {
        console.log('Checking if avatars bucket exists');
        
        // Try to get bucket info, but don't block on error
        const { data, error } = await supabase.storage.getBucket('avatars');
        
        if (error) {
          console.log('Bucket check result:', error.message);
          
          if (error.message.includes('not found')) {
            console.log('Attempting to create avatars bucket');
            
            try {
              const { error: createError } = await supabase.storage.createBucket('avatars', {
                public: true,
                fileSizeLimit: 5 * 1024 * 1024 // 5MB limit
              });
              
              if (createError) {
                console.warn('Could not create avatars bucket:', createError.message);
                // Just show a toast but don't block the page
                toast.error("Avatar uploads may not work at this time");
                setAvatarFeatureAvailable(false);
              } else {
                console.log('Created avatars bucket successfully');
                setAvatarFeatureAvailable(true);
              }
            } catch (e) {
              console.warn('Exception during bucket creation');
              toast.error("Avatar uploads may not work at this time");
              setAvatarFeatureAvailable(false);
            }
          }
        } else {
          console.log('Avatars bucket exists');
        }
      } catch (err) {
        console.warn('Error in avatar bucket check - continuing anyway');
        // Show toast but don't block the page
        toast.error("Avatar uploads may not work at this time");
        setAvatarFeatureAvailable(false);
      }
    };
    
    if (user) {
      ensureAvatarColumn();
      ensureAvatarBucket();
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast.error("Please select an image smaller than 5MB");
      return;
    }

    setAvatar(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar
  const handleAvatarUpload = async () => {
    if (!avatar || !user) return;

    try {
      setImageLoading(true);
      
      // Skip bucket check and creation attempt if we've had previous errors
      // Just try to upload directly
      
      // Generate a unique filename
      const fileExt = avatar.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `avatars/${user.id}/${fileName}`;

      // Upload image to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar, {
          upsert: true,
          contentType: avatar.type
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Special handling for common errors
        if (uploadError.message?.includes('bucket not found')) {
          toast.error("Avatar storage is not available. Please try again later.");
        } else if (uploadError.message?.includes('permission')) {
          toast.error("You don't have permission to upload avatars.");
        } else {
          toast.error("Failed to upload avatar: " + uploadError.message);
        }
        
        return;
      }

      // Get the public URL for the uploaded image
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }

      const avatarUrl = urlData.publicUrl;

      // Update user metadata with avatar URL in Supabase Auth
      const { data: userData, error: userUpdateError } = await supabase.auth.updateUser({
        data: { avatar: avatarUrl }
      });

      if (userUpdateError) {
        throw userUpdateError;
      }

      // Also try to update the User table in the database, but don't let it block the process
      try {
        const { error: dbError } = await supabase
          .from('User')
          .update({ 
            avatar: avatarUrl,
            updatedAt: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (dbError) {
          console.warn('Database avatar update failed, but Auth update was successful:', dbError.message);
          // This is expected if the column doesn't exist - proceed anyway
        } else {
          console.log('Updated avatar in both Auth and database');
        }
      } catch (dbError) {
        console.warn('Exception during database avatar update, but Auth update succeeded');
        // Continue with Auth update only
      }

      // Update local auth context - this will trigger navbar update
      updateUser({ avatar: avatarUrl });
      
      // Update local state
      setAvatarPreview(avatarUrl);
      setAvatar(null); // Clear the selected file

      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error(error instanceof Error ? error.message : "Failed to upload avatar");
    } finally {
      setImageLoading(false);
    }
  };

  // Update profile information
  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update user metadata via Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          bio: userData.bio
        }
      });
      
      if (error) {
        console.error('Error updating user in Auth:', error);
        throw error;
      }
      
      // Also try to update the User table in the database
      try {
        const { error: dbError } = await supabase
          .from('User')
          .update({ 
            name: userData.name,
            updatedAt: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (dbError) {
          console.warn('Warning: Could not update user in database, but Auth update successful:', dbError);
          // Don't throw, we still updated Auth which is the primary source
        }
      } catch (dbError) {
        console.warn('Failed to update User table, but Auth update succeeded:', dbError);
        // Continue since the Auth update worked
      }
      
      // Update user in auth context
      updateUser({ name: userData.name, bio: userData.bio });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    // Input validation
    if (!userData.newPassword || !userData.confirmPassword) {
      toast.error("Please enter a new password and confirmation");
      return;
    }
    
    if (userData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    if (userData.newPassword !== userData.confirmPassword) {
      toast.error("New password and confirmation must match");
      return;
    }

    try {
      setLoading(true);
      
      // For Supabase, we don't need the current password to update the password
      // But we can add that check if needed in the future
      
      // Update password via Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: userData.newPassword
      });
      
      if (error) {
        console.error('Supabase password update error:', error);
        throw error;
      }
      
      // Clear password fields
      setUserData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error('Error changing password:', error);
      // Display the error message from Supabase if available
      toast.error(
        error.message || "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // If still loading auth or no user, show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }
  
  // Main settings UI (only shown if user is authenticated)
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Account Settings"
        description="Manage your profile and account preferences"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center border-b pb-6">
            <div className="flex justify-center mb-4 relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} alt={userData.name || "User"} />
                <AvatarFallback className="text-2xl">
                  {(userData.name?.charAt(0) || userData.email?.charAt(0) || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload" 
                className={`absolute bottom-0 right-0 bg-white rounded-full p-1 border shadow-sm ${avatarFeatureAvailable ? 'cursor-pointer hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                title={avatarFeatureAvailable ? "Change avatar" : "Avatar upload unavailable"}
              >
                <ImageIcon size={16} />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange} 
                  disabled={imageLoading || !avatarFeatureAvailable}
                />
              </label>
            </div>
            {avatar && avatarFeatureAvailable && (
              <Button 
                onClick={handleAvatarUpload} 
                disabled={imageLoading} 
                size="sm" 
                variant="outline" 
                className="mt-2"
              >
                {imageLoading ? "Uploading..." : "Save Image"}
              </Button>
            )}
            <CardTitle className="text-xl mt-4">{userData.name || userData.email?.split('@')[0] || "User"}</CardTitle>
            <CardDescription className="text-sm mt-1">{userData.email}</CardDescription>
            <div className="flex justify-center mt-2 gap-2">
              {isAdmin && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Shield size={12} />
                  Admin
                </Badge>
              )}
              <Badge>Student</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Account Navigation</h4>
              <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                  <TabsTrigger 
                    value="profile" 
                    className="justify-start px-3 py-2 data-[state=active]:bg-muted w-full"
                  >
                    <User size={16} className="mr-2" />
                    Profile Information
                  </TabsTrigger>
                  <TabsTrigger 
                    value="password" 
                    className="justify-start px-3 py-2 data-[state=active]:bg-muted w-full"
                  >
                    <Lock size={16} className="mr-2" />
                    Change Password
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="justify-start px-3 py-2 data-[state=active]:bg-muted w-full"
                  >
                    <Bell size={16} className="mr-2" />
                    Notification Settings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile details and personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={userData.name} 
                      onChange={handleChange} 
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      value={userData.email} 
                      disabled 
                      placeholder="Your email address"
                    />
                    <p className="text-sm text-muted-foreground">
                      Email address cannot be changed
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      value={userData.bio} 
                      onChange={handleChange} 
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleUpdateProfile} 
                    disabled={loading}
                    className="ml-auto"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      name="currentPassword" 
                      type="password" 
                      value={userData.currentPassword} 
                      onChange={handleChange} 
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      name="newPassword" 
                      type="password" 
                      value={userData.newPassword} 
                      onChange={handleChange} 
                      placeholder="Enter your new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      name="confirmPassword" 
                      type="password" 
                      value={userData.confirmPassword} 
                      onChange={handleChange} 
                      placeholder="Confirm your new password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={loading}
                    className="ml-auto"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-muted-foreground">
                    Notification settings will be available soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings; 