import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { toast } from 'sonner';

const EmailVerificationRequired = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const resendVerificationEmail = async () => {
    if (!user?.email) return;

    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: window.location.origin + '/verify-email',
        },
      });

      if (error) throw error;
      
      toast.success('Verification email sent successfully!');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error('Failed to send verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-6">
        <Mail className="h-10 w-10 text-yellow-600" />
      </div>
      <h1 className="text-3xl font-bold">Email Verification Required</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        You need to verify your email address before accessing this page.
        Please check your inbox for the verification link.
      </p>
      {user?.email && (
        <p className="text-sm mt-2">
          We sent an email to <strong>{user.email}</strong>
        </p>
      )}
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
        <Button 
          variant="outline" 
          onClick={resendVerificationEmail} 
          disabled={sending}
        >
          {sending ? 'Sending...' : 'Resend Verification Email'}
        </Button>
        <Button 
          onClick={() => {
            signOut();
            navigate('/login');
          }}
        >
          Back to Login
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationRequired; 