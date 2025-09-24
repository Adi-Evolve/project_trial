import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  CogIcon,
  AcademicCapIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

interface SupportOption {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  link?: string;
  available: boolean;
}

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not-helpful'>>({});

  const categories = [
    { id: 'all', name: 'All Topics', icon: BookOpenIcon },
    { id: 'getting-started', name: 'Getting Started', icon: RocketLaunchIcon },
    { id: 'projects', name: 'Projects', icon: LightBulbIcon },
    { id: 'collaboration', name: 'Collaboration', icon: UserGroupIcon },
    { id: 'account', name: 'Account & Settings', icon: CogIcon },
    { id: 'security', name: 'Security & Privacy', icon: ShieldCheckIcon },
    { id: 'tutorials', name: 'Tutorials', icon: AcademicCapIcon }
  ];

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my first project?',
      answer: 'To create your first project, click the "Create Project" button in the top navigation or go to your dashboard and select "New Project". Fill in the project details including title, description, category, and any specific requirements. You can also add images, set funding goals, and invite collaborators.',
      category: 'getting-started',
      helpful: 24,
      notHelpful: 2
    },
    {
      id: '2',
      question: 'How does the collaboration system work?',
      answer: 'Our collaboration system allows project creators to invite team members based on skills and requirements. Interested users can apply to join projects, and creators can review applications and select the best fit. Real-time communication tools, task management, and version control integration help teams work together effectively.',
      category: 'collaboration',
      helpful: 18,
      notHelpful: 1
    },
    {
      id: '3',
      question: 'What are the different project visibility options?',
      answer: 'Projects can be set to Public (visible to everyone), Unlisted (only accessible via direct link), or Private (only visible to team members). You can change visibility settings in your project settings at any time.',
      category: 'projects',
      helpful: 31,
      notHelpful: 0
    },
    {
      id: '4',
      question: 'How do I edit my profile information?',
      answer: 'Go to Settings > Profile to edit your personal information, bio, skills, and social links. You can also upload a new profile picture and update your contact preferences.',
      category: 'account',
      helpful: 15,
      notHelpful: 1
    },
    {
      id: '5',
      question: 'Is my data secure on ProjectForge?',
      answer: 'Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regular security audits. You have full control over your data and can export or delete it at any time.',
      category: 'security',
      helpful: 42,
      notHelpful: 0
    },
    {
      id: '6',
      question: 'How does the funding system work?',
      answer: 'Project creators can set funding goals and accept contributions from the community. We support traditional payments and cryptocurrency. All transactions are secured through blockchain technology for transparency and trust.',
      category: 'projects',
      helpful: 28,
      notHelpful: 3
    },
    {
      id: '7',
      question: 'Can I invite specific people to my project?',
      answer: 'Yes, you can send direct invitations to specific users by going to your project settings and using the "Invite Members" feature. You can search for users by username or email address.',
      category: 'collaboration',
      helpful: 21,
      notHelpful: 1
    },
    {
      id: '8',
      question: 'How do I report inappropriate content or users?',
      answer: 'Click the flag icon on any project, comment, or user profile to report inappropriate content. Our moderation team reviews all reports within 24 hours and takes appropriate action.',
      category: 'security',
      helpful: 19,
      notHelpful: 0
    }
  ];

  const guides: GuideItem[] = [
    {
      id: '1',
      title: 'Getting Started with ProjectForge',
      description: 'Complete guide to setting up your profile and creating your first project',
      duration: '10 min',
      difficulty: 'Beginner',
      category: 'getting-started',
      icon: RocketLaunchIcon,
      link: '/help/getting-started'
    },
    {
      id: '2',
      title: 'Building Effective Project Teams',
      description: 'Learn how to find and recruit the right collaborators for your project',
      duration: '15 min',
      difficulty: 'Intermediate',
      category: 'collaboration',
      icon: UserGroupIcon,
      link: '/help/building-teams'
    },
    {
      id: '3',
      title: 'Project Management Best Practices',
      description: 'Tips and strategies for managing successful collaborative projects',
      duration: '20 min',
      difficulty: 'Intermediate',
      category: 'projects',
      icon: LightBulbIcon,
      link: '/help/project-management'
    },
    {
      id: '4',
      title: 'Setting Up Funding and Payments',
      description: 'Complete guide to setting up project funding and payment processing',
      duration: '12 min',
      difficulty: 'Advanced',
      category: 'projects',
      icon: CogIcon,
      link: '/help/funding-setup'
    },
    {
      id: '5',
      title: 'Privacy and Security Settings',
      description: 'Configure your account security and privacy preferences',
      duration: '8 min',
      difficulty: 'Beginner',
      category: 'security',
      icon: ShieldCheckIcon,
      link: '/help/security-settings'
    },
    {
      id: '6',
      title: 'Advanced Collaboration Features',
      description: 'Master real-time collaboration tools and workflow optimization',
      duration: '25 min',
      difficulty: 'Advanced',
      category: 'tutorials',
      icon: AcademicCapIcon,
      link: '/help/advanced-collaboration'
    }
  ];

  const supportOptions: SupportOption[] = [
    {
      title: 'Live Chat Support',
      description: 'Get instant help from our support team',
      icon: ChatBubbleLeftRightIcon,
      action: 'Start Chat',
      available: true
    },
    {
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      icon: EnvelopeIcon,
      action: 'Send Email',
      link: 'mailto:support@projectforge.com',
      available: true
    },
    {
      title: 'Video Call Support',
      description: 'Schedule a screen sharing session with our team',
      icon: VideoCameraIcon,
      action: 'Schedule Call',
      available: false
    },
    {
      title: 'Phone Support',
      description: 'Call our support hotline for urgent issues',
      icon: PhoneIcon,
      action: 'Call Now',
      link: 'tel:+1-555-0123',
      available: true
    }
  ];

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGuides = guides.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFeedback = (faqId: string, type: 'helpful' | 'not-helpful') => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: type }));
    // Here you would typically send this feedback to your analytics system
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How can we help you?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Find answers, guides, and get support for all your ProjectForge needs
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles, guides, or FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg"
            />
          </div>
        </motion.div>

        {/* Quick Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {supportOptions.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center ${
                  option.available 
                    ? 'hover:shadow-lg transition-shadow cursor-pointer' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-lg ${
                    option.available 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${
                      option.available 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {option.description}
                </p>
                <button
                  disabled={!option.available}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    option.available
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {option.available ? option.action : 'Coming Soon'}
                </button>
              </div>
            );
          })}
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <QuestionMarkCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No FAQs found matching your search.
                  </p>
                </div>
              ) : (
                filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedFAQ === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="px-6 py-4">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {faq.answer}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{faq.helpful} found this helpful</span>
                                <span>•</span>
                                <span>{faq.notHelpful} didn't find this helpful</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Was this helpful?
                                </span>
                                <button
                                  onClick={() => handleFeedback(faq.id, 'helpful')}
                                  disabled={feedbackGiven[faq.id] === 'helpful'}
                                  className={`p-1 rounded transition-colors ${
                                    feedbackGiven[faq.id] === 'helpful'
                                      ? 'text-green-600 bg-green-100'
                                      : 'text-gray-500 hover:text-green-600'
                                  }`}
                                >
                                  <HandThumbUpIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleFeedback(faq.id, 'not-helpful')}
                                  disabled={feedbackGiven[faq.id] === 'not-helpful'}
                                  className={`p-1 rounded transition-colors ${
                                    feedbackGiven[faq.id] === 'not-helpful'
                                      ? 'text-red-600 bg-red-100'
                                      : 'text-gray-500 hover:text-red-600'
                                  }`}
                                >
                                  <HandThumbDownIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Guides Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BookOpenIcon className="w-6 h-6 mr-2" />
              Helpful Guides
            </h2>
            
            <div className="space-y-4">
              {filteredGuides.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No guides found matching your search.
                  </p>
                </div>
              ) : (
                filteredGuides.map((guide) => {
                  const Icon = guide.icon;
                  return (
                    <motion.div
                      key={guide.id}
                      whileHover={{ y: -2 }}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {guide.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            {guide.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 text-sm">
                              <span className="text-gray-500 dark:text-gray-400">
                                {guide.duration}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                                {guide.difficulty}
                              </span>
                            </div>
                            
                            <Link
                              to={guide.link}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                            >
                              <span>Read Guide</span>
                              <ChevronRightIcon className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Still need help?
            </h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you succeed with your projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Contact Support
              </button>
              <Link
                to="/community"
                className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors"
              >
                Join Community
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HelpPage;