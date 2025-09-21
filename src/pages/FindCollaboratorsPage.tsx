import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserPlusIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolid,
  HeartIcon as HeartSolid,
  CheckBadgeIcon as CheckBadgeSolid
} from '@heroicons/react/24/solid';

interface Collaborator {
  id: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
  company?: string;
  location: string;
  timezone: string;
  bio: string;
  skills: string[];
  interests: string[];
  languages: string[];
  availability: 'available' | 'busy' | 'offline';
  responseTime: string; // "Usually responds within 2 hours"
  rating: number;
  reviewsCount: number;
  collaborationsCount: number;
  projectsCompleted: number;
  hourlyRate?: number;
  isVerified: boolean;
  badges: string[];
  portfolioProjects: Array<{
    id: string;
    title: string;
    image: string;
    role: string;
  }>;
  joinedDate: string;
  lastActive: string;
  isOnline: boolean;
  preferredProjectTypes: string[];
  workStyle: string[];
}

const FindCollaboratorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [selectedProjectType, setSelectedProjectType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock collaborators data
  const collaborators: Collaborator[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      username: 'sarah_creates',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=150&h=150&fit=crop&crop=face',
      title: 'Full Stack Developer & AI Researcher',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      timezone: 'PST (UTC-8)',
      bio: 'Passionate about building AI-powered applications that solve real-world problems. Love collaborating on innovative projects with creative teams.',
      skills: ['Python', 'React', 'Node.js', 'TensorFlow', 'AWS', 'PostgreSQL'],
      interests: ['AI/ML', 'Web Development', 'Data Science', 'Open Source'],
      languages: ['English', 'Mandarin', 'Spanish'],
      availability: 'available',
      responseTime: 'Usually responds within 2 hours',
      rating: 4.9,
      reviewsCount: 47,
      collaborationsCount: 23,
      projectsCompleted: 18,
      hourlyRate: 85,
      isVerified: true,
      badges: ['🏆', '💎', '🚀', '⭐'],
      portfolioProjects: [
        {
          id: '1',
          title: 'AI Code Assistant',
          image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=200&h=150&fit=crop',
          role: 'Lead Developer'
        },
        {
          id: '2',
          title: 'Smart Health Monitor',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
          role: 'Full Stack Developer'
        }
      ],
      joinedDate: '2023-01-15',
      lastActive: '2024-02-12',
      isOnline: true,
      preferredProjectTypes: ['AI/ML', 'Web Apps', 'Startups'],
      workStyle: ['Remote', 'Collaborative', 'Agile']
    },
    {
      id: '2',
      name: 'Alex Rodriguez',
      username: 'alex_builds',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      title: 'Blockchain Developer & DeFi Expert',
      location: 'Austin, TX',
      timezone: 'CST (UTC-6)',
      bio: 'Blockchain enthusiast with 5+ years building DeFi protocols and smart contracts. Always excited to work on innovative Web3 projects.',
      skills: ['Solidity', 'Web3.js', 'React', 'Node.js', 'Hardhat', 'IPFS'],
      interests: ['Blockchain', 'DeFi', 'Smart Contracts', 'Cryptocurrency'],
      languages: ['English', 'Spanish'],
      availability: 'available',
      responseTime: 'Usually responds within 4 hours',
      rating: 4.8,
      reviewsCount: 32,
      collaborationsCount: 19,
      projectsCompleted: 15,
      hourlyRate: 75,
      isVerified: true,
      badges: ['🔥', '⚡', '🛡️'],
      portfolioProjects: [
        {
          id: '3',
          title: 'DeFi Lending Platform',
          image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&h=150&fit=crop',
          role: 'Smart Contract Developer'
        }
      ],
      joinedDate: '2023-02-08',
      lastActive: '2024-02-11',
      isOnline: false,
      preferredProjectTypes: ['Blockchain', 'DeFi', 'Web3'],
      workStyle: ['Remote', 'Independent', 'Documentation-heavy']
    },
    {
      id: '3',
      name: 'Emily Johnson',
      username: 'emily_designs',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      title: 'UX/UI Designer & Frontend Developer',
      company: 'Design Studio',
      location: 'New York, NY',
      timezone: 'EST (UTC-5)',
      bio: 'Creative designer who loves turning complex ideas into beautiful, user-friendly interfaces. Experienced in both design and front-end development.',
      skills: ['Figma', 'React', 'TypeScript', 'Tailwind CSS', 'Adobe Creative Suite'],
      interests: ['UI/UX Design', 'Frontend Development', 'User Research', 'Accessibility'],
      languages: ['English', 'French'],
      availability: 'busy',
      responseTime: 'Usually responds within 1 day',
      rating: 4.9,
      reviewsCount: 56,
      collaborationsCount: 31,
      projectsCompleted: 24,
      hourlyRate: 65,
      isVerified: true,
      badges: ['🎨', '✨', '💎', '👑'],
      portfolioProjects: [
        {
          id: '4',
          title: 'Mental Health App',
          image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200&h=150&fit=crop',
          role: 'UI/UX Designer'
        },
        {
          id: '5',
          title: 'E-commerce Platform',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=200&h=150&fit=crop',
          role: 'Lead Designer'
        }
      ],
      joinedDate: '2023-03-12',
      lastActive: '2024-02-10',
      isOnline: true,
      preferredProjectTypes: ['Web Apps', 'Mobile Apps', 'SaaS'],
      workStyle: ['Remote', 'Design-thinking', 'User-centered']
    },
    {
      id: '4',
      name: 'David Kim',
      username: 'david_mobile',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      title: 'Mobile App Developer',
      location: 'Seoul, South Korea',
      timezone: 'KST (UTC+9)',
      bio: 'Mobile-first developer specializing in React Native and Flutter. Passionate about creating smooth, performant mobile experiences.',
      skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'GraphQL'],
      interests: ['Mobile Development', 'Cross-platform', 'Performance Optimization'],
      languages: ['English', 'Korean', 'Japanese'],
      availability: 'available',
      responseTime: 'Usually responds within 6 hours',
      rating: 4.7,
      reviewsCount: 28,
      collaborationsCount: 16,
      projectsCompleted: 12,
      hourlyRate: 55,
      isVerified: false,
      badges: ['📱', '⚡', '🚀'],
      portfolioProjects: [
        {
          id: '6',
          title: 'Food Delivery App',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop',
          role: 'Mobile Developer'
        }
      ],
      joinedDate: '2023-04-20',
      lastActive: '2024-02-09',
      isOnline: false,
      preferredProjectTypes: ['Mobile Apps', 'Cross-platform', 'Startups'],
      workStyle: ['Remote', 'Fast-paced', 'MVP-focused']
    }
  ];

  const skills = ['Python', 'React', 'Node.js', 'TypeScript', 'Solidity', 'Figma', 'AWS', 'Flutter', 'TensorFlow', 'PostgreSQL'];
  const locations = ['All', 'North America', 'Europe', 'Asia', 'Remote Only'];
  const availabilityOptions = ['All', 'Available', 'Busy', 'Offline'];
  const projectTypes = ['All', 'AI/ML', 'Blockchain', 'Web Apps', 'Mobile Apps', 'Startups', 'Open Source'];

  const filteredCollaborators = collaborators.filter(collaborator => {
    const matchesSearch = collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         collaborator.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         collaborator.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => collaborator.skills.includes(skill));
    
    const matchesLocation = selectedLocation === 'All' || 
                           (selectedLocation === 'Remote Only' && collaborator.workStyle.includes('Remote')) ||
                           collaborator.location.includes(selectedLocation.replace(' America', '').replace('North ', ''));
    
    const matchesAvailability = selectedAvailability === 'All' || 
                               collaborator.availability === selectedAvailability.toLowerCase();
    
    const matchesProjectType = selectedProjectType === 'All' || 
                              collaborator.preferredProjectTypes.includes(selectedProjectType);
    
    return matchesSearch && matchesSkills && matchesLocation && matchesAvailability && matchesProjectType;
  });

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Find Collaborators</h1>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Connect with talented developers, designers, and creators. 
            Find the perfect teammates for your next project or join existing teams.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by name, skills, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
            />
          </div>

          {/* Skills Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary-300 mb-3">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <motion.button
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSkillFilter(skill)}
                  className={`px-3 py-2 text-sm rounded-full border transition-all ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary-500/20 text-primary-300 border-primary-500/50'
                      : 'bg-secondary-700/50 text-secondary-300 border-secondary-600 hover:border-primary-500/50'
                  }`}
                >
                  {skill}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Other Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Availability</label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-300 mb-2">Project Type</label>
              <select
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value)}
                className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
              >
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedSkills.length > 0 || selectedLocation !== 'All' || selectedAvailability !== 'All' || selectedProjectType !== 'All') && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-secondary-700">
              <span className="text-sm text-secondary-400">Active filters:</span>
              {selectedSkills.map(skill => (
                <span key={skill} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs flex items-center space-x-1">
                  <span>{skill}</span>
                  <button onClick={() => toggleSkillFilter(skill)} className="text-primary-300 hover:text-white">×</button>
                </span>
              ))}
              {selectedLocation !== 'All' && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Location: {selectedLocation}
                </span>
              )}
              {selectedAvailability !== 'All' && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Status: {selectedAvailability}
                </span>
              )}
              {selectedProjectType !== 'All' && (
                <span className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs">
                  Type: {selectedProjectType}
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedSkills([]);
                  setSelectedLocation('All');
                  setSelectedAvailability('All');
                  setSelectedProjectType('All');
                }}
                className="text-xs text-secondary-400 hover:text-white underline"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h2 className="text-xl font-semibold text-white">
              {filteredCollaborators.length} Collaborator{filteredCollaborators.length !== 1 ? 's' : ''} Found
            </h2>
            <p className="text-secondary-400">Connect with verified professionals</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-secondary-700 text-secondary-400'
              }`}
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-current rounded-sm"></div>
                ))}
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-secondary-700 text-secondary-400'
              }`}
            >
              <div className="w-4 h-4 flex flex-col space-y-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-current h-0.5 rounded"></div>
                ))}
              </div>
            </button>
          </div>
        </motion.div>

        {/* Collaborators Grid/List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {filteredCollaborators.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No collaborators found</h3>
              <p className="text-secondary-400 mb-6">
                Try adjusting your filters or search terms to find more collaborators.
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
            }>
              {filteredCollaborators.map((collaborator, index) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`glass rounded-xl p-6 group ${
                    viewMode === 'list' ? 'flex items-center space-x-6' : ''
                  }`}
                >
                  {/* Avatar and Online Status */}
                  <div className={`relative ${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
                    <img
                      src={collaborator.avatar}
                      alt={collaborator.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-secondary-800 ${
                      collaborator.isOnline ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    {collaborator.isVerified && (
                      <div className="absolute -top-1 -right-1">
                        <CheckBadgeSolid className="w-5 h-5 text-blue-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : ''}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-primary-300 transition-colors">
                          {collaborator.name}
                        </h3>
                        <p className="text-sm text-secondary-400">@{collaborator.username}</p>
                        <p className="text-sm text-primary-400 truncate">{collaborator.title}</p>
                        {collaborator.company && (
                          <p className="text-xs text-secondary-500">{collaborator.company}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        {collaborator.badges.map((badge, idx) => (
                          <span key={idx} className="text-sm">{badge}</span>
                        ))}
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${getAvailabilityColor(collaborator.availability)}`}></div>
                      <span className="text-sm text-secondary-300">{getAvailabilityText(collaborator.availability)}</span>
                      <span className="text-xs text-secondary-500">•</span>
                      <span className="text-xs text-secondary-500">{collaborator.responseTime}</span>
                    </div>

                    {/* Location and Rate */}
                    <div className="flex items-center space-x-4 mb-3 text-xs text-secondary-500">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3" />
                        <span>{collaborator.location}</span>
                      </div>
                      {collaborator.hourlyRate && (
                        <div className="flex items-center space-x-1">
                          <span>${collaborator.hourlyRate}/hr</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className={`text-secondary-400 mb-4 ${
                      viewMode === 'list' ? 'line-clamp-2' : 'line-clamp-3'
                    }`}>
                      {collaborator.bio}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {collaborator.skills.slice(0, viewMode === 'list' ? 4 : 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {collaborator.skills.length > (viewMode === 'list' ? 4 : 6) && (
                        <span className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full">
                          +{collaborator.skills.length - (viewMode === 'list' ? 4 : 6)}
                        </span>
                      )}
                    </div>

                    {/* Rating and Stats */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <StarSolid className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">{collaborator.rating}</span>
                          <span className="text-secondary-500">({collaborator.reviewsCount})</span>
                        </div>
                        <div className="text-secondary-400">
                          {collaborator.collaborationsCount} collabs
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 btn-primary text-sm py-2 flex items-center justify-center space-x-1"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Connect</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary text-sm py-2 px-3"
                      >
                        <EnvelopeIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FindCollaboratorsPage;