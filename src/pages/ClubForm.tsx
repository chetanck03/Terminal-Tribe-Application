import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/hooks/use-toast";
import { createClub } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ClubForm = () => {
  const { user, isAdmin, loading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    category: "",
    image: null as File | null
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast({
          title: "Access Denied",
          description: "You need to be logged in to create a club.",
          variant: "destructive"
        });
        navigate("/login");
      } else if (!isAdmin) {
        toast({
          title: "Access Denied",
          description: "Only administrators can create clubs.",
          variant: "destructive"
        });
        navigate("/unauthorized");
      }
    }
  }, [user, isAdmin, loading, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Check for authentication and admin status again before submitting
      if (!user) {
        toast({
          title: "Permission Denied",
          description: "You need to be logged in to create a club.",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      if (!isAdmin) {
        toast({
          title: "Permission Denied",
          description: "Only administrators can create clubs.",
          variant: "destructive"
        });
        navigate("/unauthorized");
        return;
      }
      
      // Process the image - set a max size limit
      const MAX_IMAGE_SIZE = 1000000; // 1MB
      
      // Convert image to base64 if exists
      let imageBase64 = null;
      if (formData.image) {
        // First check file size before processing
        if (formData.image.size > 5 * 1024 * 1024) { // 5MB
          toast({
            title: "Image Too Large",
            description: "Please select an image smaller than 5MB",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.image);
        });
      }
      
      // Optimize image if needed
      let optimizedImage = imageBase64;
      if (imageBase64 && imageBase64.length > MAX_IMAGE_SIZE) {
        console.log("Image is large, optimizing...");
        
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageBase64 as string;
          });
          
          // Calculate new dimensions (max 800px width)
          const maxWidth = 800;
          const scale = Math.min(maxWidth / img.width, 1);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Get optimized image data with quality of 0.7
          optimizedImage = canvas.toDataURL('image/jpeg', 0.7);
          
          console.log(`Image optimized: ${imageBase64?.length} -> ${optimizedImage.length} bytes`);
        } catch (err) {
          console.error("Error optimizing image:", err);
          // Fallback to original image if optimization fails
          optimizedImage = imageBase64;
        }
      }
      
      console.log("Submitting club with optimized image");
      
      const clubData = {
        name: formData.name,
        description: formData.description,
        content: formData.content || formData.description, // Using description as content if not provided
        image: optimizedImage,
        category: formData.category
      };
      
      // Call the API to create the club
      const response = await createClub(clubData);
      console.log("Club creation response:", response);
      
      toast({
        title: "Club Created",
        description: "Your club has been created successfully.",
      });
      
      navigate("/clubs");
    } catch (error: any) {
      console.error("Error creating club:", error);
      let errorMessage = "Failed to create club. Please try again.";
      
      // Check for specific error types
      if (error.response) {
        console.error("Server error response:", error.response.data);
        
        if (error.response.status === 401) {
          errorMessage = "Authentication error. Please log in again.";
          // Force logout and redirect to login
          supabase.auth.signOut().then(() => navigate("/login"));
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-campus-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Create Club" 
        description="Fill in the details to create a new club"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Club Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter club name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="arts">Arts</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="games">Games</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="hobby">Hobby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Enter club description" 
                    rows={3}
                    value={formData.description} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Detailed Content</Label>
                  <Textarea 
                    id="content" 
                    name="content" 
                    placeholder="Enter detailed information about your club (optional)" 
                    rows={5}
                    value={formData.content} 
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Club Image</Label>
                  <Input 
                    id="image" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended image size: 1200x630 pixels
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-4">
                <Link to="/clubs">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Creating...
                    </>
                  ) : "Create Club"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Club Preview</h3>
              <div className="rounded-md overflow-hidden border mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Club preview" 
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Image Preview</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{formData.name || "Club Name"}</h4>
                  {formData.category && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-campus-purple/10 text-campus-purple rounded-full mt-1">
                      {formData.category.charAt(0).toUpperCase() + formData.category.slice(1)}
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="text-sm line-clamp-3">{formData.description || "Club description will appear here."}</p>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  <span>0 members</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Tips</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">1</span>
                  </div>
                  <span>Choose a clear and memorable name for your club.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">2</span>
                  </div>
                  <span>Write a compelling description to attract members.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">3</span>
                  </div>
                  <span>Add detailed content about club activities and goals.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">4</span>
                  </div>
                  <span>Upload an engaging image that represents your club.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClubForm; 