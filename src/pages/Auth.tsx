import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export function Auth() {
  const [email, setEmail] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { signInWithOtp } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleMagicLink = async (emailAddress: string) => {
    setIsLoading(true);
    setError('');
    
    if (timeRemaining > 0) {
      const message = `Please wait ${timeRemaining} seconds before requesting another sign in link`;
      toast.error(message);
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending magic link to:', emailAddress);
      const { error } = await signInWithOtp(emailAddress);
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      // Set cooldown timer
      setTimeRemaining(60);
      toast.success('Check your email for the magic link!');
    } catch (error) {
      console.error('Error sending magic link:', error);
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMagicLink(email);
            }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-lg dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={isLoading || timeRemaining > 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading
                ? 'Sending...'
                : timeRemaining > 0
                ? `Try again in ${timeRemaining}s`
                : 'Send Magic Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}