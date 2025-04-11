import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="mb-8">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground mb-8">
          You don't have sufficient permissions to access this page.
          This section is restricted to administrators only.
        </p>
        <Link to="/">
          <Button className="gap-2">
            <ArrowLeft size={16} /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized; 