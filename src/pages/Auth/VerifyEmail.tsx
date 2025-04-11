import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';

const VerifyEmail = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Get params from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // If there's no access token or it's not a recovery type, show error
        if (!accessToken || type !== 'recovery') {
          // Just check the session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // If session exists, verification already happened
            setSuccess(true);
            setVerifying(false);
            return;
          }
          
          setError('Invalid verification link. Please request a new verification email.');
          setVerifying(false);
          return;
        }

        // Set the session with the tokens
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            throw error;
          }
        }

        setSuccess(true);
      } catch (error) {
        console.error('Verification error:', error);
        setError('Failed to verify your email. Please try again.');
      } finally {
        setVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate]);

  // Loading state
  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader className="animate-spin h-10 w-10 text-primary mb-4" />
        <h1 className="text-2xl font-bold">Verifying your email...</h1>
        <p className="text-muted-foreground mt-2">Please wait while we verify your email address.</p>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold">Email Verified!</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          Your email has been successfully verified. You can now access all features of the platform.
        </p>
        <Button className="mt-6" onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold">Verification Failed</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        {error || 'We could not verify your email address. Please try again or contact support.'}
      </p>
      <div className="flex space-x-4 mt-6">
        <Button variant="outline" onClick={() => navigate('/login')}>
          Back to Login
        </Button>
        <Button onClick={() => navigate('/signup')}>
          Sign Up Again
        </Button>
      </div>
    </div>
  );
};

export default VerifyEmail; 