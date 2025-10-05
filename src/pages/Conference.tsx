import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Mail, Building2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';
import AnimationBackground from '../components/AnimationBackground';
import { getConferenceSchedule, addConferenceRegistration } from '../services/airtable';

interface SponsorTier {
  name: string;
  price: string;
  benefits: string[];
  color: string;
}

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  speaker?: string;
}

const Conference: React.FC = () => {
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: ''
  });
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [sponsorStatus, setSponsorStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);

  const sponsorTiers: SponsorTier[] = [
    {
      name: 'Bronze',
      price: '$100',
      color: 'from-amber-600 to-amber-800',
      benefits: [
        'Logo on website',
        'Social media mention',
        'Recognition at event'
      ]
    },
    {
      name: 'Silver',
      price: '$300',
      color: 'from-gray-400 to-gray-600',
      benefits: [
        'All Bronze benefits',
        'Logo on conference materials',
        'Booth space',
        'Logo placement on signage'
      ]
    },
    {
      name: 'Gold',
      price: '$500',
      color: 'from-yellow-400 to-yellow-600',
      benefits: [
        'All Silver benefits',
        'Speaking opportunity (10 min)',
        'Premium booth location',
        'Logo on stage backdrop',
        'Featured in press releases'
      ]
    },
    {
      name: 'Platinum',
      price: '$1,000',
      color: 'from-purple-400 to-purple-600',
      benefits: [
        'All Gold benefits',
        'Keynote speaking opportunity',
        'Custom sponsorship package',
        'Exclusive branding opportunities',
        'VIP networking event access'
      ]
    }
  ];

  // Fetch schedule from Airtable
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setIsLoadingSchedule(true);
        const result = await getConferenceSchedule();
        if (result.success && result.data) {
          setSchedule(result.data as ScheduleItem[]);
        }
        setIsLoadingSchedule(false);
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setIsLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, []);

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistrationStatus(null);

    try {
      setRegistrationStatus({
        message: 'Submitting registration...',
        isError: false
      });

      const result = await addConferenceRegistration(registrationData);

      if (result.success) {
        setRegistrationStatus({
          message: 'Thank you for registering! We will send you confirmation details shortly.',
          isError: false
        });
        setRegistrationData({
          name: '',
          email: '',
          phone: '',
          jobTitle: ''
        });
      } else {
        setRegistrationStatus({
          message: result.message || 'Unable to complete registration. Please try again.',
          isError: true
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setRegistrationStatus({
        message: 'An error occurred. Please try again later.',
        isError: true
      });
    }
  };

  const handleSponsorInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSponsorStatus(null);

    // TODO: Integrate with Airtable or email system
    setSponsorStatus({
      message: 'Thank you! We will contact you soon about sponsorship opportunities.',
      isError: false
    });
    setSponsorEmail('');
  };

  return (
    <div className="min-h-screen">
      <AnimationBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-24">
        <div className="text-center max-w-5xl mx-auto">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-semibold mb-4">
              November 2025
            </span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            WNY AI Conference
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-light">
            Shaping the Future of Artificial Intelligence in Western New York
          </p>
          <div className="flex flex-wrap gap-4 justify-center items-center text-lg mb-12">
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              <span>November 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-purple-600" size={24} />
              <span>Buffalo, NY</span>
            </div>
          </div>
          <a
            href="#register"
            className="wave-button glow bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg text-xl font-semibold inline-flex items-center gap-2"
          >
            Register Now
            <ArrowRight size={24} />
          </a>
        </div>
      </section>

      {/* About the Conference */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-5xl mb-8 tracking-tight">About the Conference</h2>
          <p className="text-xl mb-6 leading-relaxed">
            Join us for the inaugural WNY AI Conference, bringing together AI enthusiasts,
            researchers, entrepreneurs, and industry leaders from across Western New York and beyond.
          </p>
          <p className="text-xl leading-relaxed">
            This full-day event features keynote presentations, panel discussions, hands-on workshops,
            and unparalleled networking opportunities to explore the transformative potential of artificial intelligence.
          </p>
        </div>
      </section>

      {/* Registration Section */}
      <section id="register" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-5xl mb-6 tracking-tight">Register for the Conference</h2>
            <p className="text-xl mb-4">
              Registration is now open for this FREE event!
            </p>
          </div>

          <div className="glassmorphism p-8 max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <h3 className="font-heading text-3xl mb-4 tracking-tight">Free Admission</h3>
              <p className="text-6xl font-bold mb-4 text-green-600">FREE</p>
              <p className="text-lg text-gray-700 mb-8">Open to all AI enthusiasts, professionals, and students</p>
            </div>

            <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <span>Full day access to all sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <span>Breakfast and lunch included</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <span>Access to workshops</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <span>Networking opportunities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="text-green-600 mt-1 flex-shrink-0" size={20} />
                <span>Conference swag bag</span>
              </li>
            </ul>

            <form onSubmit={handleRegistration} className="max-w-xl mx-auto">
              <h3 className="font-heading text-2xl mb-6 tracking-tight">Register Now</h3>
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                    placeholder="Phone Number"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={registrationData.jobTitle}
                    onChange={(e) => setRegistrationData({...registrationData, jobTitle: e.target.value})}
                    placeholder="Job Title / Business"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="wave-button glow w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg flex items-center justify-center gap-2 text-lg font-semibold"
                >
                  <Mail size={20} />
                  <span>Complete Registration</span>
                </button>
              </div>
              {registrationStatus && (
                <p className={`text-sm mt-4 text-center ${registrationStatus.isError ? 'text-red-500' : 'text-green-500'}`}>
                  {registrationStatus.message}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-5xl mb-6 tracking-tight">Conference Schedule</h2>
            <p className="text-xl">November 2025 - Exact date TBA</p>
            <p className="text-sm text-gray-600 mt-2">Schedule subject to change</p>
          </div>

          {isLoadingSchedule ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading schedule...</p>
            </div>
          ) : schedule.length > 0 ? (
            <div className="space-y-4">
              {schedule.map((item) => (
                <div key={item.id} className="glassmorphism p-6 glow hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold md:w-32 flex-shrink-0">
                      <Clock size={20} />
                      <span>{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading text-xl mb-2 tracking-tight">{item.title}</h3>
                      <p className="text-gray-700 mb-1">{item.description}</p>
                      {item.speaker && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Speaker:</span> {item.speaker}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Schedule coming soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Sponsorship Section */}
      <section id="sponsor" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-5xl mb-6 tracking-tight">Become a Sponsor</h2>
            <p className="text-xl max-w-3xl mx-auto">
              Partner with us to showcase your organization's commitment to AI innovation
              and connect with Western New York's growing AI community.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {sponsorTiers.map((tier, index) => (
              <div
                key={index}
                className="glassmorphism p-6 glow hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className={`bg-gradient-to-r ${tier.color} text-white px-4 py-2 rounded-lg mb-4 text-center`}>
                  <h3 className="font-heading text-2xl font-bold">{tier.name}</h3>
                </div>
                <p className="text-3xl font-bold text-center mb-6">{tier.price}</p>
                <ul className="space-y-3">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <form onSubmit={handleSponsorInquiry} className="glassmorphism p-8 max-w-2xl mx-auto">
            <h3 className="font-heading text-2xl mb-6 text-center tracking-tight">
              <Building2 className="inline mr-2" size={28} />
              Sponsorship Inquiry
            </h3>
            <p className="text-center mb-6">
              Interested in sponsoring? Let us know and we'll send you our complete sponsorship package.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={sponsorEmail}
                onChange={(e) => setSponsorEmail(e.target.value)}
                placeholder="Company email address"
                className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="wave-button glow px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center gap-2"
              >
                <Mail size={20} />
                <span>Inquire</span>
              </button>
            </div>
            {sponsorStatus && (
              <p className={`text-sm mt-4 text-center ${sponsorStatus.isError ? 'text-red-500' : 'text-green-500'}`}>
                {sponsorStatus.message}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-4xl md:text-5xl mb-6 tracking-tight">
            Don't Miss This Opportunity
          </h2>
          <p className="text-xl mb-8">
            Be part of Western New York's premier AI event. Network with leaders,
            learn from experts, and shape the future of AI in our region.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#register"
              className="wave-button bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-2 hover:shadow-xl"
            >
              Register Now
              <ArrowRight size={20} />
            </a>
            <a
              href="#sponsor"
              className="wave-button border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold inline-flex items-center gap-2 hover:bg-white hover:text-purple-600"
            >
              Become a Sponsor
              <Building2 size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Conference;
