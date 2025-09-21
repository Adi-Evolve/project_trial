import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  RocketLaunchIcon, 
  LightBulbIcon, 
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  PlayIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: RocketLaunchIcon,
      title: 'Launch Your Project',
      description: 'Share your innovative project ideas and get the support you need to bring them to life.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: LightBulbIcon,
      title: 'Protect Your Ideas',
      description: 'Use blockchain technology to timestamp and secure ownership of your ideas before sharing.',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Find Your Team',
      description: 'Connect with like-minded developers, designers, and entrepreneurs to build amazing things together.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: StarIcon,
      title: 'Get Recognition',
      description: 'Build your reputation in the community through upvotes, successful projects, and valuable contributions.',
      color: 'from-pink-500 to-red-600'
    }
  ];

  const trendingProjects = [
    {
      id: 1,
      title: 'AI-Powered Code Review Assistant',
      description: 'An intelligent tool that helps developers write better code through automated reviews and suggestions.',
      author: 'Sarah Chen',
      avatar: '/api/placeholder/40/40',
      category: 'AI & Machine Learning',
      upvotes: 234,
      comments: 45,
      image: '/api/placeholder/300/200',
      tags: ['AI', 'Developer Tools', 'Machine Learning'],
      trending: true
    },
    {
      id: 2,
      title: 'Sustainable Urban Farming Platform',
      description: 'A comprehensive platform connecting urban farmers with resources, knowledge, and community support.',
      author: 'Michael Rodriguez',
      avatar: '/api/placeholder/40/40',
      category: 'Environment & Sustainability',
      upvotes: 189,
      comments: 32,
      image: '/api/placeholder/300/200',
      tags: ['Sustainability', 'Agriculture', 'Community'],
      trending: true
    },
    {
      id: 3,
      title: 'Decentralized Learning Marketplace',
      description: 'A blockchain-based platform where anyone can teach and learn skills, with transparent credentialing.',
      author: 'Priya Patel',
      avatar: '/api/placeholder/40/40',
      category: 'Education & Learning',
      upvotes: 156,
      comments: 28,
      image: '/api/placeholder/300/200',
      tags: ['Education', 'Blockchain', 'Marketplace'],
      trending: true
    }
  ];

  const recentIdeas = [
    {
      id: 1,
      title: 'Smart Waste Management System',
      description: 'IoT-enabled waste bins that optimize collection routes and reduce environmental impact.',
      author: 'Alex Kim',
      upvotes: 67,
      category: 'IoT & Hardware'
    },
    {
      id: 2,
      title: 'Mental Health Support Bot',
      description: 'An AI companion that provides 24/7 mental health support and resources.',
      author: 'Emma Thompson',
      upvotes: 89,
      category: 'Health & Wellness'
    },
    {
      id: 3,
      title: 'Collaborative Music Creation App',
      description: 'Platform for musicians worldwide to collaborate on songs in real-time.',
      author: 'Jordan Miller',
      upvotes: 45,
      category: 'Music & Arts'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6"
            >
              Where{' '}
              <span className="gradient-text">Ideas</span>{' '}
              Meet{' '}
              <span className="gradient-text">Innovation</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-secondary-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              The decentralized platform where creators showcase groundbreaking projects, 
              protect their ideas with blockchain technology, and find the perfect collaborators 
              to bring their vision to life.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!isAuthenticated ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                  >
                    <RocketLaunchIcon className="h-5 w-5" />
                    <span>Start Your Journey</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline text-lg px-8 py-4 flex items-center space-x-2"
                  >
                    <PlayIcon className="h-5 w-5" />
                    <span>Watch Demo</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
                  >
                    <RocketLaunchIcon className="h-5 w-5" />
                    <span>Create Project</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-outline text-lg px-8 py-4 flex items-center space-x-2"
                  >
                    <LightBulbIcon className="h-5 w-5" />
                    <span>Share an Idea</span>
                  </motion.button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-xl text-secondary-300 max-w-2xl mx-auto">
              Our platform provides all the tools and community support you need 
              to turn your innovative ideas into successful projects.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card card-hover text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-secondary-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Projects Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center">
                <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
                Trending Projects
              </h2>
              <p className="text-secondary-400">Discover the most exciting projects gaining momentum</p>
            </div>
            <Link to="/projects">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRightIcon className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="card card-hover group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <FireIcon className="h-3 w-3 mr-1" />
                      Trending
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-secondary-800/80 backdrop-blur-sm text-secondary-300 px-2 py-1 rounded-full text-xs">
                      {project.category}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-300 transition-colors duration-200">
                  {project.title}
                </h3>
                <p className="text-secondary-400 mb-4 line-clamp-2">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-secondary-700 text-secondary-300 px-2 py-1 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={project.avatar}
                      alt={project.author}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-secondary-300">{project.author}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-secondary-400">
                    <span className="flex items-center">
                      ▲ {project.upvotes}
                    </span>
                    <span className="flex items-center">
                      💬 {project.comments}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ideas Section */}
      <section className="py-20 bg-secondary-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2 flex items-center">
                <LightBulbIcon className="h-8 w-8 text-yellow-500 mr-3" />
                Fresh Ideas
              </h2>
              <p className="text-secondary-400">Latest innovative concepts from our community</p>
            </div>
            <Link to="/ideas">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-outline flex items-center space-x-2"
              >
                <span>Explore Ideas</span>
                <ArrowRightIcon className="h-4 w-4" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="card hover:border-primary-500/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-xs">
                    {idea.category}
                  </span>
                  <span className="text-sm text-secondary-400 flex items-center">
                    ▲ {idea.upvotes}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary-300 transition-colors duration-200">
                  {idea.title}
                </h3>
                <p className="text-secondary-400 mb-4 text-sm">{idea.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-300">by {idea.author}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-primary-400 hover:text-primary-300 transition-colors duration-200"
                  >
                    💡
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Ready to Turn Your Ideas Into Reality?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of innovators who are already building the future on ProjectForge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary-600 font-semibold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  Get Started Free
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-white text-white font-semibold px-8 py-4 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200"
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;