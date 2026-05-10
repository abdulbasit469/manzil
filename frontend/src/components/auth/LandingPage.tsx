import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight, GraduationCap, Target, Users, Award, BookOpen, TrendingUp, CheckCircle, Star, Menu, X, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import manzilLogo from 'figma:asset/42b006cdf7fabf13982136fc1ec170431f27fea9.png';
import { useState, useEffect } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Show/hide scroll to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const features = [
    {
      icon: Target,
      title: 'Career Assessment',
      description: 'Take comprehensive assessments to discover your ideal career path',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Award,
      title: 'Mock Tests',
      description: 'Practice with NAT, NET, ECAT, and SAT mock tests',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Users,
      title: 'Community Forum',
      description: 'Connect with peers and mentors in our active community',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: GraduationCap,
      title: 'University Explorer',
      description: 'Discover top universities in Pakistan and find your perfect match',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  const testimonials = [
    {
      name: 'Ahmed Khan',
      role: 'NUST Student',
      image: '👨‍🎓',
      text: 'MANZIL helped me discover my passion and get into my dream university!',
      rating: 5,
    },
    {
      name: 'Ayesha Ali',
      role: 'LUMS Student',
      image: '👩‍🎓',
      text: 'The mock tests and merit calculator were incredibly helpful for my preparation.',
      rating: 5,
    },
    {
      name: 'Hassan Ahmed',
      role: 'IBA Student',
      image: '👨‍💼',
      text: 'Best platform for Pakistani students. The community support is amazing!',
      rating: 5,
    },
  ];

  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f3a] via-[#1e3a5f] to-[#2d4a6f] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute top-1/2 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src={manzilLogo} alt="Manzil Logo" className="w-20 h-20" />
            <span className="text-white text-lg"><span className="font-bold">MANZIL</span></span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <Button
              onClick={() => navigate('/login')}
              className="bg-white text-[#1e3a5f] hover:bg-slate-100 transition-all px-6"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all px-6"
            >
              Sign Up
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl text-white mb-6">
            Your Journey to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600">
              Academic Excellence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
            MANZIL helps Pakistani students discover their path to success with university exploration,
            career assessments, and comprehensive test preparation.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/signup')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-2xl hover:scale-105 transition-all py-6 text-lg px-12"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-8 text-blue-200"
          >
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>10,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-amber-400" />
              <span>500+ Universities</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-4xl md:text-5xl text-white mb-4">
                Everything You Need for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  Academic Success
                </span>
              </h2>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                Comprehensive tools and resources designed specifically for Pakistani students
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 backdrop-blur-lg rounded-3xl p-12 border border-amber-500/20 shadow-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <div className="text-6xl text-amber-400 mb-2">500+</div>
              <div className="text-white text-lg mb-1">Universities Listed</div>
              <div className="text-blue-300 text-sm">Comprehensive database</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 border-x border-white/10"
            >
              <div className="text-6xl text-amber-400 mb-2">10K+</div>
              <div className="text-white text-lg mb-1">Active Students</div>
              <div className="text-blue-300 text-sm">Growing community</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <div className="text-6xl text-amber-400 mb-2">95%</div>
              <div className="text-white text-lg mb-1">Success Rate</div>
              <div className="text-blue-300 text-sm">Student satisfaction</div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl text-white mb-4">
              Loved by{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Thousands of Students
              </span>
            </h2>
            <p className="text-xl text-blue-200">See what our students have to say</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-amber-500/50 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-white mb-4 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <div className="text-white">{testimonial.name}</div>
                    <div className="text-amber-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"
          />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students who have found their path with MANZIL. Start exploring your future today!
            </p>
            <Button
              onClick={() => navigate('/signup')}
              className="bg-white text-amber-600 hover:bg-slate-100 hover:scale-105 transition-all px-10 py-6 text-lg shadow-xl"
            >
              Create Your Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-white/80 text-sm mt-4">No credit card required • Free forever</p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 relative z-10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={manzilLogo} alt="Manzil Logo" className="w-10 h-10" />
              <span className="text-white text-lg"><span className="font-bold">MANZIL</span></span>
            </div>
            <div className="text-blue-200 text-center">
              <p>&copy; 2025 <span className="font-bold">MANZIL</span>. All rights reserved.</p>
            </div>
            <div className="flex gap-6 text-blue-200">
              <button className="hover:text-white transition-colors" onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate('/privacy');
              }}>Privacy</button>
              <button className="hover:text-white transition-colors" onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate('/terms');
              }}>Terms</button>
              <button className="hover:text-white transition-colors" onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
                navigate('/contact');
              }}>Contact</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 cursor-pointer"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-6 h-6 text-white" strokeWidth={3} />
        </motion.button>
      )}
    </div>
  );
}