import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p>
              This Privacy Policy explains how CampusConnect collects, uses, and discloses personal information
              when you use our website and services. Your privacy is important to us, and we are committed to
              protecting your personal information.
            </p>
            
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <p>
              We collect several types of information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Such as your name, email address, profile picture, and 
                academic information that you provide when you create an account.
              </li>
              <li>
                <strong>Usage Information:</strong> Information about how you use our services, such as the 
                clubs you join, events you attend, and your interactions with other users.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the device you use to access our services,
                including device type, operating system, and browser type.
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> We use cookies and similar technologies to 
                enhance your experience, analyze usage patterns, and improve our services.
              </li>
            </ul>
            
            <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our services</li>
              <li>To personalize your experience on our platform</li>
              <li>To communicate with you about events, clubs, and updates</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure the security and integrity of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>
            
            <h2 className="text-xl font-semibold">4. Information Sharing and Disclosure</h2>
            <p>
              We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With other users as part of your participation in the platform</li>
              <li>With service providers who help us operate our platform</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a merger, sale, or acquisition of all or part of our company</li>
            </ul>
            
            <h2 className="text-xl font-semibold">5. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information from unauthorized
              access, alteration, disclosure, or destruction. However, no method of transmission over the Internet
              or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-xl font-semibold">6. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information, such as:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access the personal information we hold about you</li>
              <li>The right to request correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to object to the processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            
            <h2 className="text-xl font-semibold">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting
              the new Privacy Policy on this page and updating the "Last updated" date at the top.
            </p>
            
            <h2 className="text-xl font-semibold">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@campusconnect.edu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 