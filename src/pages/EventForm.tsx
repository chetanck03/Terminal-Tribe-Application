import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Users } from "lucide-react";
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
import { createEvent } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const EventForm = () => {
  const { user, isAdmin, loading } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    category: "",
    image: null as File | null
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create events.",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [isAdmin, loading, navigate, toast]);
  
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
      
      // Check for admin status again before submitting
      if (!isAdmin) {
        toast({
          title: "Permission Denied",
          description: "Only administrators can create events.",
          variant: "destructive"
        });
        navigate("/unauthorized");
        return;
      }
      
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
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
      
      console.log("Submitting event with optimized image");
      
      const eventData = {
        title: formData.title,
        description: formData.description,
        content: formData.description, // Using description as content for simplicity
        date: dateTime.toISOString(),
        location: formData.location,
        image: optimizedImage,
        category: formData.category
      };
      
      // Call the API to create the event
      const response = await createEvent(eventData);
      console.log("Event creation response:", response);
      
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
      
      navigate("/admin/events");
    } catch (error: any) {
      console.error("Error creating event:", error);
      let errorMessage = "Failed to create event. Please try again.";
      
      // Check for specific error types
      if (error.response) {
        console.error("Server error response:", error.response.data);
        
        if (error.response.status === 403) {
          errorMessage = "Permission denied. Only administrators can create events.";
          navigate("/unauthorized");
        } else if (error.response.status === 401) {
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
        title="Create Event" 
        description="Fill in the details to create a new event"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="Enter event title" 
                    value={formData.title} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="date" 
                        name="date" 
                        type="date" 
                        className="pl-8"
                        value={formData.date} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="time" 
                        name="time" 
                        type="time" 
                        className="pl-8"
                        value={formData.time} 
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    name="location" 
                    placeholder="Enter event location" 
                    value={formData.location} 
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
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="culture">Culture</SelectItem>
                      <SelectItem value="entertainment">Entertainment</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="technology">Technology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Enter event description" 
                    rows={5}
                    value={formData.description} 
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="image">Event Image</Label>
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
                <Link to="/admin/events">
                  <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                      Creating...
                    </>
                  ) : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Event Preview</h3>
              <div className="rounded-md overflow-hidden border mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Event preview" 
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
                  <h4 className="font-medium">{formData.title || "Event Title"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.date ? new Date(formData.date).toLocaleDateString() : "Date"} • {formData.time || "Time"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm">Location: {formData.location || "TBD"}</p>
                </div>
                
                <div>
                  <p className="text-sm line-clamp-3">{formData.description || "Event description will appear here."}</p>
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
                  <span>Be specific with your event title and description.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">2</span>
                  </div>
                  <span>Add clear location details to help attendees.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-campus-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-campus-blue">3</span>
                  </div>
                  <span>Upload an eye-catching image to attract more participants.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
