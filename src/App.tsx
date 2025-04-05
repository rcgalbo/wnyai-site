import React, { useState, useEffect } from 'react';
import { Send, Disc as Discord, ArrowRight, Twitter, Linkedin, Github } from 'lucide-react';
import AnimationBackground from './components/AnimationBackground';
import InitialAnimation from './components/InitialAnimation';
import Modal from './components/Modal';
import DebugPanel from './components/DebugPanel';
import { addSubscriber, getEvents, getSiteContent } from './services/airtable';

// Types
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  registrationLink?: string;
  virtualEvent?: boolean;
}

interface SiteContent {
  discord_link: string;
  twitter_link: string;
  linkedin_link: string;
  github_link: string;
  privacy_policy: string;
  terms_of_service: string;
}

function App() {
  console.log('App component rendering');
  
  const [showContent, setShowContent] = useState(false);
  const [email, setEmail] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [siteContent, setSiteContent] = useState<Partial<SiteContent>>({});
  const [formStatus, setFormStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(true);

  // Fetch events and site content on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Airtable...');
        setIsLoading(true);
        
        const [eventsResult, contentResult] = await Promise.all([
          getEvents(),
          getSiteContent()
        ]);
        
        if (eventsResult.success && eventsResult.data) {
          console.log('Successfully loaded events:', eventsResult.data.length);
          setEvents(eventsResult.data as Event[]);
        } else {
          console.warn('Failed to load events:', eventsResult.error);
          // Use fallback data if provided
          if (eventsResult.data) {
            setEvents(eventsResult.data as Event[]);
          }
        }
        
        if (contentResult.success && contentResult.data) {
          console.log('Successfully loaded site content');
          setSiteContent(contentResult.data as Partial<SiteContent>);
        } else {
          console.warn('Failed to load site content:', contentResult.error);
          // Use fallback data if provided
          if (contentResult.data) {
            setSiteContent(contentResult.data as Partial<SiteContent>);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error in data fetching:', err);
        setError('Failed to load data. Please check your connection.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Toggle debug panel with 'd' key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'd' && e.ctrlKey) {
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle email submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus(null);
    
    try {
      console.log('Submitting email:', email);
      const result = await addSubscriber(email);
      
      if (result.success) {
        setEmail('');
        setFormStatus({
          message: 'Thank you for subscribing!',
          isError: false
        });
      } else {
        setFormStatus({
          message: result.error === 'Email already exists' 
            ? 'You are already subscribed!' 
            : 'Unable to subscribe. Please try again.',
          isError: true
        });
      }
    } catch (error) {
      console.error('Email submission error:', error);
      setFormStatus({
        message: 'An error occurred. Please try again later.',
        isError: true
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glassmorphism p-6 max-w-md text-center">
          <h1 className="font-heading text-2xl mb-4">Something went wrong</h1>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="wave-button glow px-6 py-2 bg-black text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show a simple loading state if initial data is still loading
  if (isLoading && !showContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl mb-4 animate-pulse">WNY AI</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!showContent && <InitialAnimation onComplete={() => setShowContent(true)} />}
      <div className={`min-h-screen ${showContent ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
        <AnimationBackground />
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="font-heading text-6xl md:text-7xl font-bold mb-6 tracking-tight">WNY AI</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
              Empowering Western New York through artificial intelligence education, research, and community.
            </p>
          </div>
        </section>

        {/* Email Collection */}
        <section className="py-20 px-4">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="glassmorphism p-8">
              <h2 className="font-heading text-3xl mb-6 text-center tracking-tight">Stay Updated</h2>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="wave-button glow px-6 py-2 bg-black text-white rounded-lg flex items-center gap-2"
                >
                  <Send size={20} />
                  <span>Subscribe</span>
                </button>
              </div>
              {formStatus && (
                <p className={`text-sm mt-4 text-center ${formStatus.isError ? 'text-red-500' : 'text-green-500'}`}>
                  {formStatus.message}
                </p>
              )}
              <p className="text-sm mt-4 text-gray-600 text-center">
                We respect your privacy and will never share your information.
              </p>
            </form>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-heading text-4xl mb-12 text-center tracking-tight">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {events.length > 0 ? (
                events.map((event) => (
                  <div key={event.id} className="glassmorphism p-6 glow">
                    <h3 className="font-heading text-xl mb-2 tracking-tight">{event.title}</h3>
                    <div className="mb-4">
                      <p className="text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {event.time}
                      </p>
                      <p className="text-gray-600">{event.location}</p>
                    </div>
                    <p className="mb-4">{event.description}</p>
                    {event.registrationLink && (
                      <a 
                        href={event.registrationLink}
                        className="wave-button flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Register Now
                        <ArrowRight size={20} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-gray-500">Check back soon for upcoming events!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Discord Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-4xl mb-8 tracking-tight">Join Our Community</h2>
            <div className="glassmorphism p-8 mb-8">
              <Discord size={64} className="mx-auto mb-6" />
              <p className="text-xl mb-6">
                Connect with AI enthusiasts, professionals, and learners in Western New York
              </p>
              <ul className="text-left max-w-md mx-auto mb-8">
                <li className="flex items-center gap-2 mb-2">
                  <ArrowRight size={20} />
                  <span>Access exclusive resources and tutorials</span>
                </li>
                <li className="flex items-center gap-2 mb-2">
                  <ArrowRight size={20} />
                  <span>Participate in community discussions</span>
                </li>
                <li className="flex items-center gap-2 mb-2">
                  <ArrowRight size={20} />
                  <span>Network with AI professionals</span>
                </li>
              </ul>
              <a 
                href={siteContent.discord_link || "https://discord.gg/example"}
                className="wave-button glow bg-[#5865F2] text-white px-8 py-3 rounded-lg text-xl font-semibold flex items-center gap-2 mx-auto"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Discord size={24} />
                <span>Join Discord</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-heading text-xl mb-4 tracking-tight">Contact Us</h3>
              <p>info@wnyai.org</p>
              <p>Buffalo, NY</p>
            </div>
            <div>
              <h3 className="font-heading text-xl mb-4 tracking-tight">Follow Us</h3>
              <div className="flex gap-4">
                <a 
                  href={siteContent.twitter_link || "https://twitter.com/example"} 
                  className="hover:text-blue-400 flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Twitter size={20} />
                  <span>Twitter</span>
                </a>
                <a 
                  href={siteContent.linkedin_link || "https://linkedin.com/company/example"} 
                  className="hover:text-blue-400 flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin size={20} />
                  <span>LinkedIn</span>
                </a>
                <a 
                  href={siteContent.github_link || "https://github.com/example"} 
                  className="hover:text-blue-400 flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={20} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-heading text-xl mb-4 tracking-tight">Legal</h3>
              <button 
                onClick={() => setShowPrivacyPolicy(true)} 
                className="block hover:text-blue-400 text-left"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setShowTerms(true)} 
                className="block hover:text-blue-400 text-left"
              >
                Terms of Service
              </button>
            </div>
          </div>
          <div className="text-center mt-8 pt-8 border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} WNY AI. All rights reserved.</p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
        title="Privacy Policy"
      >
        <div>
          {siteContent.privacy_policy ? (
            siteContent.privacy_policy.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms of Service"
      >
        <div>
          {siteContent.terms_of_service ? (
            siteContent.terms_of_service.split('\n').map((paragraph, idx) => (
              <p key={idx} className="mb-4">{paragraph}</p>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </Modal>

      {/* Debug Panel (press Ctrl+D to toggle) */}
      {showDebugPanel && (
        <DebugPanel 
          apiKey={import.meta.env.VITE_AIRTABLE_API_KEY || ''}
          accessToken={import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || ''}
          baseId={import.meta.env.VITE_AIRTABLE_BASE_ID || ''}
          eventsTable={import.meta.env.VITE_AIRTABLE_EVENTS_TABLE || 'Events'}
        />
      )}
    </>
  );
}

export default App;