import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link to="/">
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="space-y-6 bg-card p-6 rounded-lg shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              Welcome to CampusConnect. By using our services, you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you do not agree to these terms, please do not use our services.
            </p>
            
            <h2 className="text-xl font-semibold">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account, and you are fully responsible 
              for all activities that occur under your account. We reserve the right to suspend or terminate 
              accounts if we suspect misuse or policy violations.
            </p>
            
            <h2 className="text-xl font-semibold">3. User Content</h2>
            <p>
              You retain ownership of any content you submit to the platform. However, by posting content, 
              you grant CampusConnect a worldwide, non-exclusive license to use, reproduce, modify, and 
              display such content on our services. You are solely responsible for the content you post.
            </p>
            
            <h2 className="text-xl font-semibold">4. Prohibited Activities</h2>
            <p>
              When using our services, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Post content that is harmful, offensive, or inappropriate</li>
              <li>Attempt to access other users' accounts or private information</li>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Interfere with or disrupt the service or servers</li>
            </ul>
            
            <h2 className="text-xl font-semibold">5. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service immediately, without prior 
              notice or liability, for any reason, including breach of these Terms.
            </p>
            
            <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
            <p>
              In no event shall CampusConnect be liable for any indirect, incidental, special, consequential 
              or punitive damages, including without limitation, loss of profits, data, or other intangible 
              losses, resulting from your use of or inability to use the service.
            </p>
            
            <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, 
              we will try to provide at least 30 days' notice prior to any new terms taking effect.
            </p>
            
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at support@campusconnect.edu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms; 