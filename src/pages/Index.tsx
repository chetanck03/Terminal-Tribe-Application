import { useEffect } from "react";
import { Navigate } from "react-router-dom";

// The Index page redirects to the dashboard
const Index = () => {
  useEffect(() => {
    document.title = "Xplore - Student Portal";
  }, []);

  return <Navigate to="/" replace />;
};

export default Index;
