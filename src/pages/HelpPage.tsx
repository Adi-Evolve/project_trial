import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  VideoCameraIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { AnimatePresence } from 'framer-motion';

interface SupportOption {
  title: string;
  description: string;
  icon: any;
  action: string;
  link?: string;
  available: boolean;
}

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
  difficulty: string;
  category: string;
  icon: any;
  link: string;
}

const supportOptions: SupportOption[] = [
  {
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
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

const categories = [
  { key: 'all', label: 'All' },
  { key: 'projects', label: 'Projects' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'account', label: 'Account' },
  { key: 'security', label: 'Security' },
  { key: 'tutorials', label: 'Tutorials' }
];

const faqItems: FAQItem[] = [
  {
    id: '1',
    question: 'How do I create a new project?',
    answer: 'Click the "Create Project" button on your dashboard and fill in the required details. All data is stored securely using centralized storage.',
    category: 'projects',
    helpful: 42,
    notHelpful: 2
  },
  {
    id: '2',
    question: 'How do I invite collaborators?',
    answer: 'Go to your project page, click "Invite Collaborators", and enter their email addresses. Invitations are managed through our centralized system.',
    category: 'collaboration',
    helpful: 35,
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
    question: 'How do I change my notification preferences?',
    answer: 'Visit Settings > Notifications to customize which emails and in-app notifications you receive. You can set preferences for project updates, collaboration requests, and system announcements.',
    category: 'account',
    helpful: 18,
    notHelpful: 2
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
    description: 'Complete guide to setting up your profile and creating your first project using our centralized platform.',
    duration: '10 min',
    difficulty: 'Beginner',
    category: 'getting-started',
    icon: RocketLaunchIcon,
    link: '/help/getting-started'
  },
  {
    id: '2',
    title: 'Building Effective Project Teams',
    description: 'Learn how to find and recruit the right collaborators for your project.',
    duration: '15 min',
    difficulty: 'Intermediate',
    category: 'collaboration',
    icon: UserGroupIcon,
    link: '/help/building-teams'
  },
  {
    id: '3',
    title: 'Privacy and Security Settings',
    description: 'Configure your account security and privacy preferences.',
    duration: '8 min',
    difficulty: 'Beginner',
    category: 'security',
    icon: ShieldCheckIcon,
    link: '/help/security-settings'
  },
  {
    id: '4',
    title: 'Advanced Collaboration Features',
    description: 'Master real-time collaboration tools and workflow optimization.',
    duration: '25 min',
    difficulty: 'Advanced',
    category: 'tutorials',
    icon: AcademicCapIcon,
    link: '/help/advanced-collaboration'
  }
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'Advanced': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  }
};

const HelpPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('all');
  const [expandedFAQ, setExpandedFAQ] = React.useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = React.useState<{ [faqId: string]: 'helpful' | 'not-helpful' | undefined }>({});

  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === 'all' || guide.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFeedback = (faqId: string, type: 'helpful' | 'not-helpful') => {
    setFeedbackGiven(prev => ({ ...prev, [faqId]: type }));
    // Here you would typically send this feedback to your analytics system
  };

  return (
    <>
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
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
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
                  <div className="flex flex-col items-center justify-center mb-4">
                    <Icon className={`w-8 h-8 mb-2 ${option.available ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
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
                    onClick={() => {
                      if (option.link) {
                        window.open(option.link, '_blank');
                      }
                    }}
                  >
                    {option.action}
                  </button>
                </div>
              );
            })}
          </motion.div>

          {/* FAQ and Guides Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((category) => (
                <button
                  key={category.key}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                    activeCategory === category.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  onClick={() => setActiveCategory(category.key)}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {/* FAQ Section */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 mb-12">
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

            {/* Guides Section */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <BookOpenIcon className="w-6 h-6 mr-2" />
              Helpful Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredGuides.length === 0 ? (
                <div className="col-span-full text-center py-8">
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
    </>
  );
};

export default HelpPage;