import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  HeartIcon,
  StarIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

interface SkillMatchingProps {
  currentUser: any;
  projectId?: string;
  onMatch?: (matchedUser: any) => void;
  className?: string;
}

interface MatchedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  title: string;
  location: string;
  skills: string[];
  experience: string;
  projects: number;
  successRate: number;
  rating: number;
  availability: 'available' | 'busy' | 'unavailable';
  matchScore: number;
  commonSkills: string[];
  complementarySkills: string[];
  lastActive: string;
  verified: boolean;
  portfolio: string[];
}

const SkillMatching: React.FC<SkillMatchingProps> = ({
  currentUser,
  projectId,
  onMatch,
  className = ''
}) => {
  const [matches, setMatches] = useState<MatchedUser[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('any');
  const [availability, setAvailability] = useState<string>('any');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<MatchedUser | null>(null);

  const availableSkills = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++',
    'UI/UX Design', 'Product Management', 'DevOps', 'Machine Learning',
    'Blockchain', 'Mobile Development', 'Data Science', 'Cybersecurity',
    'Digital Marketing', 'Business Development', 'Finance', 'Legal'
  ];

  useEffect(() => {
    findMatches();
  }, [selectedSkills, experienceLevel, availability]);

  const findMatches = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockMatches: MatchedUser[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          username: 'sarahchen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100&h=100&fit=crop&crop=face',
          title: 'Senior Full-Stack Developer',
          location: 'San Francisco, CA',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
          experience: '5+ years',
          projects: 23,
          successRate: 94,
          rating: 4.9,
          availability: 'available',
          matchScore: 95,
          commonSkills: ['React', 'TypeScript'],
          complementarySkills: ['AWS', 'Node.js'],
          lastActive: '2 hours ago',
          verified: true,
          portfolio: ['Project A', 'Project B', 'Project C']
        },
        {
          id: '2',
          name: 'Alex Rodriguez',
          username: 'alexdev',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          title: 'UI/UX Designer & Frontend Dev',
          location: 'New York, NY',
          skills: ['UI/UX Design', 'React', 'Figma', 'JavaScript'],
          experience: '3-5 years',
          projects: 18,
          successRate: 89,
          rating: 4.7,
          availability: 'available',
          matchScore: 87,
          commonSkills: ['React'],
          complementarySkills: ['UI/UX Design', 'Figma'],
          lastActive: '1 day ago',
          verified: true,
          portfolio: ['Design System', 'Mobile App', 'Web Platform']
        },
        {
          id: '3',
          name: 'David Kim',
          username: 'davidkim',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
          title: 'Blockchain Developer',
          location: 'Austin, TX',
          skills: ['Blockchain', 'Solidity', 'Web3', 'Python'],
          experience: '2-3 years',
          projects: 12,
          successRate: 91,
          rating: 4.8,
          availability: 'busy',
          matchScore: 78,
          commonSkills: ['Python'],
          complementarySkills: ['Blockchain', 'Solidity', 'Web3'],
          lastActive: '3 hours ago',
          verified: true,
          portfolio: ['DeFi Protocol', 'NFT Marketplace', 'Smart Contracts']
        },
        {
          id: '4',
          name: 'Emily Watson',
          username: 'emilyw',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
          title: 'Product Manager',
          location: 'Seattle, WA',
          skills: ['Product Management', 'Data Analysis', 'Agile', 'Strategy'],
          experience: '5+ years',
          projects: 31,
          successRate: 96,
          rating: 4.9,
          availability: 'available',
          matchScore: 82,
          commonSkills: [],
          complementarySkills: ['Product Management', 'Strategy'],
          lastActive: '30 minutes ago',
          verified: true,
          portfolio: ['SaaS Platform', 'Mobile Strategy', 'Growth Analytics']
        }
      ];

      // Filter matches based on criteria
      let filteredMatches = mockMatches;
      
      if (selectedSkills.length > 0) {
        filteredMatches = filteredMatches.filter(user =>
          selectedSkills.some(skill => 
            user.skills.includes(skill) || 
            user.commonSkills.includes(skill) || 
            user.complementarySkills.includes(skill)
          )
        );
      }

      if (experienceLevel !== 'any') {
        filteredMatches = filteredMatches.filter(user => {
          if (experienceLevel === 'junior' && user.experience.includes('1-2')) return true;
          if (experienceLevel === 'mid' && user.experience.includes('3-5')) return true;
          if (experienceLevel === 'senior' && user.experience.includes('5+')) return true;
          return false;
        });
      }

      if (availability !== 'any') {
        filteredMatches = filteredMatches.filter(user => user.availability === availability);
      }

      setMatches(filteredMatches);
      setIsLoading(false);
    }, 1000);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-400 bg-green-400/10';
      case 'busy': return 'text-yellow-400 bg-yellow-400/10';
      case 'unavailable': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handleConnect = (user: MatchedUser) => {
    onMatch?.(user);
    // Here you would typically send a connection request
    console.log('Connecting with:', user.name);
  };

  const handleInviteToProject = (user: MatchedUser) => {
    // Here you would typically send a project invitation
    console.log('Inviting to project:', user.name);
  };

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Smart Skill Matching</h2>
              <p className="text-secondary-400">Find the perfect collaborators for your project</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{matches.length}</div>
            <div className="text-sm text-secondary-400">Matches Found</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-secondary-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Filters</h3>
        
        <div className="space-y-4">
          {/* Skill Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    setSelectedSkills(prev =>
                      prev.includes(skill)
                        ? prev.filter(s => s !== skill)
                        : [...prev, skill]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="any">Any Experience</option>
                <option value="junior">Junior (1-2 years)</option>
                <option value="mid">Mid-level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Availability</label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="any">Any Availability</option>
                <option value="available">Available Now</option>
                <option value="busy">Partially Available</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Matches */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-white">Finding perfect matches...</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <UserGroupIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-white mb-2">No Matches Found</h4>
            <p className="text-secondary-400">Try adjusting your filters to find more collaborators.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Matches ({matches.length})
            </h3>
            
            {matches.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50 hover:border-secondary-500/50 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {user.verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <StarIcon className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-lg font-semibold text-white">{user.name}</h4>
                        <span className="text-secondary-400">@{user.username}</span>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getAvailabilityColor(user.availability)}`}>
                          {user.availability}
                        </div>
                      </div>
                      
                      <p className="text-secondary-300 mb-2">{user.title}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-secondary-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{user.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>Active {user.lastActive}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrophyIcon className="w-4 h-4" />
                          <span>{user.projects} projects</span>
                        </div>
                      </div>

                      {/* Skills */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-2">
                          {user.commonSkills.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30"
                            >
                              {skill} ✓
                            </span>
                          ))}
                          {user.complementarySkills.slice(0, 3).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{user.rating}</span>
                        </div>
                        <div className="text-secondary-400">
                          {user.successRate}% success rate
                        </div>
                        <div className="text-secondary-400">
                          {user.experience} experience
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-400">{user.matchScore}%</div>
                      <div className="text-xs text-secondary-400">Match Score</div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleConnect(user)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-sm"
                      >
                        <UserPlusIcon className="w-4 h-4" />
                        <span>Connect</span>
                      </button>
                      
                      {projectId && (
                        <button
                          onClick={() => handleInviteToProject(user)}
                          className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors text-sm"
                        >
                          <EnvelopeIcon className="w-4 h-4" />
                          <span>Invite</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors text-sm"
                      >
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary-800 rounded-xl border border-secondary-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-secondary-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{selectedUser.title}</h4>
                  <p className="text-secondary-400 mb-2">{selectedUser.location}</p>
                  <div className="flex items-center space-x-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">{selectedUser.rating}</span>
                    <span className="text-secondary-400">({selectedUser.successRate}% success rate)</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium text-white mb-3">Skills & Expertise</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm border border-primary-500/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-white mb-3">Portfolio</h5>
                <div className="space-y-2">
                  {selectedUser.portfolio.map((project, index) => (
                    <div key={index} className="p-3 bg-secondary-700/30 rounded-lg">
                      <span className="text-secondary-300">{project}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    handleConnect(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                >
                  <UserPlusIcon className="w-5 h-5" />
                  <span>Connect</span>
                </button>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SkillMatching;