import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { createCheckoutSession } from '../lib/stripe';
import { toast } from 'react-hot-toast';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

type PricingPlan = 'monthly' | 'yearly';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('yearly');
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get email from either location state or URL params
    const stateEmail = location.state?.email;
    const urlEmail = searchParams.get('email');
    if (stateEmail || urlEmail) {
      setEmail(stateEmail || urlEmail);
    }
  }, [location.state, searchParams]);

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const { url, error } = await createCheckoutSession(email, plan);
      if (error) {
        toast.error(error);
        return;
      }
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error('Failed to start checkout process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    'Cloud synchronization across devices',
    'Multiple document management',
    'Secure document storage',
    'Real-time autosave',
    'Document organization',
    'Priority support',
    'Export to multiple formats',
    'Advanced markdown features'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Upgrade to Markpad Premium</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Take your markdown editing to the next level
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Monthly Plan */}
        <div className={`relative rounded-2xl p-8 ${
          selectedPlan === 'monthly' 
            ? 'border-2 border-blue-500 shadow-lg' 
            : 'border border-gray-200 dark:border-gray-700'
        }`}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            {selectedPlan === 'monthly' && (
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                Selected
              </span>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Monthly Plan</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-bold">$5</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">/month</span>
          </div>
          
          <button
            onClick={() => {
              setSelectedPlan('monthly');
              handleSubscribe('monthly');
            }}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 ${
              selectedPlan === 'monthly'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>Subscribe Monthly</span>
              </>
            )}
          </button>
        </div>

        {/* Yearly Plan */}
        <div className={`relative rounded-2xl p-8 ${
          selectedPlan === 'yearly' 
            ? 'border-2 border-blue-500 shadow-lg' 
            : 'border border-gray-200 dark:border-gray-700'
        }`}>
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm">
              Save 17%
            </span>
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Yearly Plan</h3>
          <div className="flex items-baseline mb-4">
            <span className="text-4xl font-bold">$50</span>
            <span className="text-gray-600 dark:text-gray-400 ml-2">/year</span>
          </div>
          
          <button
            onClick={() => {
              setSelectedPlan('yearly');
              handleSubscribe('yearly');
            }}
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-lg mb-6 flex items-center justify-center gap-2 ${
              selectedPlan === 'yearly'
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Sparkles size={20} />
                <span>Subscribe Yearly</span>
              </>
            )}
          </button>
          
          <p className="text-sm text-green-600 dark:text-green-400 text-center mb-4">
            Save $10 compared to monthly billing
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Everything you need for professional markdown editing
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 p-2">
              <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Signals */}
      <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>🔒 Secure payment via Stripe</p>
        <p className="mt-2">30-day money-back guarantee • Cancel anytime • No hidden fees</p>
      </div>
    </div>
  );
}
