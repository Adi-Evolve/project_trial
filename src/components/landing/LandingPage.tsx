import React from 'react';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon, 
  UserGroupIcon, 
  LightBulbIcon,
  ChartBarIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp }) => {
  const features = [
    {
      icon: LightBulbIcon,
      title: "Turn Ideas into Reality",
      description: "Transform your innovative ideas into successful projects with our comprehensive platform."
    },
    {
      icon: UserGroupIcon,
      title: "Find Perfect Collaborators",
      description: "Connect with talented developers, designers, and entrepreneurs who share your vision."
    },
    {
      icon: ChartBarIcon,
      title: "Track Project Progress",
      description: "Monitor your project's development with advanced analytics and milestone tracking."
    },
    {
      icon: RocketLaunchIcon,
      title: "Launch Successfully",
      description: "Get your projects market-ready with our launch preparation and marketing tools."
    }
  ];

  const stats = [
    { label: "Active Projects", value: "1,200+" },
    { label: "Successful Launches", value: "350+" },
    { label: "Community Members", value: "5,000+" },
    { label: "Ideas Realized", value: "800+" }
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      role: "Full Stack Developer",
      content: "ProjectForge helped me find the perfect team for my SaaS idea. We launched in just 3 months!",
      rating: 5
    },
    {
      name: "Sarah Williams",
      role: "Product Designer",
      content: "The collaboration tools are amazing. I've worked on 5 successful projects through this platform.",
      rating: 5
    },
    {
      name: "Mike Johnson",
      role: "Entrepreneur",
      content: "From idea to launch, ProjectForge guided us every step of the way. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <span className="text-lg sm:text-2xl font-bold text-gray-900">ProjectForge</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 sm:space-x-4"
            >
              <button
                onClick={onLogin}
                className="text-gray-700 hover:text-purple-600 px-2 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                onClick={onSignUp}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1 sm:px-6 sm:py-2 text-sm sm:text-base rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-20 pb-8 sm:pb-16">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
            >
              Turn Your Ideas Into
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600"> Reality</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
            >
              Join the ultimate platform for entrepreneurs, developers, and innovators. 
              Collaborate, build, and launch successful projects together.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
            >
              <button
                onClick={onSignUp}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Start Your Journey</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={onLogin}
                className="w-full sm:w-auto border-2 border-gray-300 hover:border-purple-600 text-gray-700 hover:text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200"
              >
                Sign In
              </button>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-4 sm:right-10 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-16 h-16 sm:w-24 sm:h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow animation-delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Powerful tools and features designed to help you turn ideas into successful projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              What Our Community Says
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Real stories from real entrepreneurs and developers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 + index * 0.1 }}
                className="bg-gray-50 p-4 sm:p-6 rounded-2xl"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3 text-sm sm:text-base">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs sm:text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 px-4">
              Join thousands of entrepreneurs and developers who are already building the future
            </p>
            <button
              onClick={onSignUp}
              className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 transform hover:scale-105 inline-flex items-center justify-center space-x-2"
            >
              <span>Get Started Today</span>
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
              <RocketLaunchIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              <span className="text-xl sm:text-2xl font-bold">ProjectForge</span>
            </div>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base px-4">
              Turning ideas into reality, one project at a time.
            </p>
            <div className="border-t border-gray-800 pt-6 sm:pt-8">
              <p className="text-gray-500 text-xs sm:text-sm">
                © 2025 ProjectForge. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;