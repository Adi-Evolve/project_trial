import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  StarIcon,
  BoltIcon,
  HeartIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  GlobeAltIcon,
  ChatBubbleLeftIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  title: string;
  location: string;
  timezone: string;
  verified: boolean;
  skills: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsExperience: number;
    endorsements: number;
  }[];
  interests: string[];
  availability: {
    hoursPerWeek: number;
    startDate: Date;
    preferredWorkingHours: string;
  };
  projectHistory: {
    completed: number;
    rating: number;
    totalReviews: number;
  };
  collaborationStyle: {
    workStyle: 'independent' | 'collaborative' | 'mixed';
    communicationFrequency: 'low' | 'medium' | 'high';
    leadershipStyle: 'leader' | 'follower' | 'both';
    timezone: string;
  };
  preferences: {
    projectTypes: string[];
    teamSize: string;
    commitment: 'part-time' | 'full-time' | 'flexible';
    remote: boolean;
  };
  achievements: {
    badgesEarned: number;
    level: number;
    xp: number;
    specializations: string[];
  };
  socialProof: {
    githubContributions: number;
    portfolioProjects: number;
    blogPosts: number;
    opensource: boolean;
  };
}

interface MatchingCriteria {
  projectType: string;
  requiredSkills: string[];
  preferredSkills: string[];
  teamSize: number;
  commitment: string;
  workStyle: string;
  experienceLevel: string;
  location: string;
  timezone: string;
  budget?: number;
}

interface SkillMatch {
  user: User;
  overallScore: number;
  skillCompatibility: number;
  availabilityMatch: number;
  experienceScore: number;
  collaborationFit: number;
  locationScore: number;
  socialProofScore: number;
  personalityMatch: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

interface SmartSkillMatchingProps {
  projectId?: string;
  criteria: MatchingCriteria;
  onUserSelect?: (user: User) => void;
  onInvite?: (userId: string) => void;
  maxResults?: number;
  showAdvancedFilters?: boolean;
}

const SmartSkillMatching: React.FC<SmartSkillMatchingProps> = ({
  projectId,
  criteria,
  onUserSelect,
  onInvite,
  maxResults = 20,
  showAdvancedFilters = true
}) => {
  const [matches, setMatches] = useState<SkillMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    minScore: 70,
    maxExperience: 10,
    minExperience: 0,
    availability: 'any',
    workStyle: 'any',
    verified: false,
    hasPortfolio: false
  });
  const [sortBy, setSortBy] = useState<'score' | 'experience' | 'activity' | 'rating'>('score');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock users data - in real app this would come from API
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'alexdev',
      fullName: 'Alex Rodriguez',
      avatar: '/api/placeholder/150/150',
      title: 'Full Stack Developer',
      location: 'San Francisco, CA',
      timezone: 'PST',
      verified: true,
      skills: [
        { name: 'React', level: 'expert', yearsExperience: 5, endorsements: 24 },
        { name: 'Node.js', level: 'advanced', yearsExperience: 4, endorsements: 18 },
        { name: 'TypeScript', level: 'advanced', yearsExperience: 3, endorsements: 15 },
        { name: 'Python', level: 'intermediate', yearsExperience: 2, endorsements: 8 }
      ],
      interests: ['Web Development', 'AI/ML', 'Open Source'],
      availability: {
        hoursPerWeek: 40,
        startDate: new Date(),
        preferredWorkingHours: '9 AM - 5 PM PST'
      },
      projectHistory: {
        completed: 15,
        rating: 4.8,
        totalReviews: 23
      },
      collaborationStyle: {
        workStyle: 'collaborative',
        communicationFrequency: 'high',
        leadershipStyle: 'both',
        timezone: 'PST'
      },
      preferences: {
        projectTypes: ['Web Development', 'Mobile App', 'AI/ML'],
        teamSize: '3-5 people',
        commitment: 'full-time',
        remote: true
      },
      achievements: {
        badgesEarned: 12,
        level: 8,
        xp: 2400,
        specializations: ['React Expert', 'Full Stack']
      },
      socialProof: {
        githubContributions: 1250,
        portfolioProjects: 8,
        blogPosts: 15,
        opensource: true
      }
    },
    {
      id: '2',
      username: 'designpro',
      fullName: 'Sarah Chen',
      avatar: '/api/placeholder/150/150',
      title: 'UI/UX Designer',
      location: 'New York, NY',
      timezone: 'EST',
      verified: true,
      skills: [
        { name: 'Figma', level: 'expert', yearsExperience: 6, endorsements: 30 },
        { name: 'Adobe XD', level: 'advanced', yearsExperience: 4, endorsements: 20 },
        { name: 'User Research', level: 'advanced', yearsExperience: 5, endorsements: 22 },
        { name: 'Prototyping', level: 'expert', yearsExperience: 5, endorsements: 25 }
      ],
      interests: ['Design Systems', 'User Experience', 'Accessibility'],
      availability: {
        hoursPerWeek: 30,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        preferredWorkingHours: '10 AM - 4 PM EST'
      },
      projectHistory: {
        completed: 22,
        rating: 4.9,
        totalReviews: 31
      },
      collaborationStyle: {
        workStyle: 'collaborative',
        communicationFrequency: 'medium',
        leadershipStyle: 'leader',
        timezone: 'EST'
      },
      preferences: {
        projectTypes: ['Web Design', 'Mobile Design', 'Branding'],
        teamSize: '2-4 people',
        commitment: 'part-time',
        remote: true
      },
      achievements: {
        badgesEarned: 18,
        level: 10,
        xp: 3200,
        specializations: ['Design Leader', 'UX Research']
      },
      socialProof: {
        githubContributions: 45,
        portfolioProjects: 25,
        blogPosts: 8,
        opensource: false
      }
    },
    {
      id: '3',
      username: 'datawhiz',
      fullName: 'Michael Kumar',
      avatar: '/api/placeholder/150/150',
      title: 'Data Scientist',
      location: 'Austin, TX',
      timezone: 'CST',
      verified: false,
      skills: [
        { name: 'Python', level: 'expert', yearsExperience: 7, endorsements: 35 },
        { name: 'Machine Learning', level: 'expert', yearsExperience: 5, endorsements: 28 },
        { name: 'TensorFlow', level: 'advanced', yearsExperience: 3, endorsements: 20 },
        { name: 'SQL', level: 'expert', yearsExperience: 8, endorsements: 40 }
      ],
      interests: ['AI/ML', 'Data Analysis', 'Research'],
      availability: {
        hoursPerWeek: 20,
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        preferredWorkingHours: '6 PM - 10 PM CST'
      },
      projectHistory: {
        completed: 8,
        rating: 4.7,
        totalReviews: 12
      },
      collaborationStyle: {
        workStyle: 'independent',
        communicationFrequency: 'low',
        leadershipStyle: 'follower',
        timezone: 'CST'
      },
      preferences: {
        projectTypes: ['AI/ML', 'Data Analysis', 'Research'],
        teamSize: '1-3 people',
        commitment: 'part-time',
        remote: true
      },
      achievements: {
        badgesEarned: 8,
        level: 6,
        xp: 1800,
        specializations: ['ML Expert', 'Data Analyst']
      },
      socialProof: {
        githubContributions: 890,
        portfolioProjects: 12,
        blogPosts: 25,
        opensource: true
      }
    }
  ];

  // AI-powered matching algorithm
  const calculateMatchScore = (user: User, criteria: MatchingCriteria): SkillMatch => {
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());
    const requiredSkillNames = criteria.requiredSkills.map(s => s.toLowerCase());
    const preferredSkillNames = criteria.preferredSkills.map(s => s.toLowerCase());

    // Skill Compatibility (40% weight)
    const matchingRequired = requiredSkillNames.filter(skill => 
      userSkillNames.some(userSkill => userSkill.includes(skill))
    );
    const matchingPreferred = preferredSkillNames.filter(skill => 
      userSkillNames.some(userSkill => userSkill.includes(skill))
    );
    
    const requiredSkillScore = requiredSkillNames.length > 0 ? 
      (matchingRequired.length / requiredSkillNames.length) * 100 : 100;
    const preferredSkillScore = preferredSkillNames.length > 0 ? 
      (matchingPreferred.length / preferredSkillNames.length) * 100 : 0;
    
    const skillCompatibility = (requiredSkillScore * 0.8) + (preferredSkillScore * 0.2);

    // Experience Score (25% weight)
    const avgExperience = user.skills.reduce((sum, skill) => sum + skill.yearsExperience, 0) / user.skills.length;
    const experienceScore = Math.min((avgExperience / 5) * 100, 100);

    // Availability Match (15% weight)
    const availabilityMatch = user.availability.hoursPerWeek >= 20 ? 100 : 
      (user.availability.hoursPerWeek / 20) * 100;

    // Collaboration Fit (10% weight)
    const workStyleMatch = criteria.workStyle === 'any' || 
      user.collaborationStyle.workStyle === criteria.workStyle ? 100 : 50;
    const collaborationFit = workStyleMatch;

    // Location Score (5% weight)
    const locationScore = criteria.location === 'remote' || 
      user.preferences.remote ? 100 : 
      user.location.toLowerCase().includes(criteria.location.toLowerCase()) ? 100 : 30;

    // Social Proof Score (3% weight)
    const socialProofScore = Math.min(
      (user.socialProof.githubContributions / 1000 * 50) +
      (user.socialProof.portfolioProjects / 10 * 30) +
      (user.projectHistory.rating / 5 * 20), 100
    );

    // Personality Match (2% weight) - based on collaboration style
    const personalityMatch = user.collaborationStyle.communicationFrequency === 'high' ? 100 : 80;

    // Calculate overall score
    const overallScore = 
      (skillCompatibility * 0.40) +
      (experienceScore * 0.25) +
      (availabilityMatch * 0.15) +
      (collaborationFit * 0.10) +
      (locationScore * 0.05) +
      (socialProofScore * 0.03) +
      (personalityMatch * 0.02);

    // Generate insights
    const matchingSkills = [...matchingRequired, ...matchingPreferred];
    const missingSkills = requiredSkillNames.filter(skill => 
      !userSkillNames.some(userSkill => userSkill.includes(skill))
    );
    
    const strengths = [];
    const concerns = [];

    if (skillCompatibility > 80) strengths.push('Excellent skill match');
    if (user.projectHistory.rating > 4.5) strengths.push('High project ratings');
    if (user.verified) strengths.push('Verified profile');
    if (user.socialProof.opensource) strengths.push('Open source contributor');
    
    if (missingSkills.length > 0) concerns.push(`Missing skills: ${missingSkills.join(', ')}`);
    if (user.availability.hoursPerWeek < 20) concerns.push('Limited availability');
    if (!user.verified) concerns.push('Unverified profile');

    let recommendation = '';
    if (overallScore > 85) recommendation = 'Highly recommended - excellent match';
    else if (overallScore > 70) recommendation = 'Good match - worth considering';
    else if (overallScore > 50) recommendation = 'Potential match - needs evaluation';
    else recommendation = 'Low compatibility - not recommended';

    return {
      user,
      overallScore: Math.round(overallScore),
      skillCompatibility: Math.round(skillCompatibility),
      availabilityMatch: Math.round(availabilityMatch),
      experienceScore: Math.round(experienceScore),
      collaborationFit: Math.round(collaborationFit),
      locationScore: Math.round(locationScore),
      socialProofScore: Math.round(socialProofScore),
      personalityMatch: Math.round(personalityMatch),
      matchingSkills,
      missingSkills,
      strengths,
      concerns,
      recommendation
    };
  };

  useEffect(() => {
    // Simulate API call for smart matching
    setLoading(true);
    setTimeout(() => {
      const calculatedMatches = mockUsers
        .map(user => calculateMatchScore(user, criteria))
        .filter(match => match.overallScore >= selectedFilters.minScore)
        .sort((a, b) => {
          switch (sortBy) {
            case 'experience':
              return b.experienceScore - a.experienceScore;
            case 'rating':
              return b.user.projectHistory.rating - a.user.projectHistory.rating;
            case 'activity':
              return b.socialProofScore - a.socialProofScore;
            default:
              return b.overallScore - a.overallScore;
          }
        })
        .slice(0, maxResults);
      
      setMatches(calculatedMatches);
      setLoading(false);
    }, 1000);
  }, [criteria, selectedFilters, sortBy, maxResults]);

  const handleInviteUser = (userId: string) => {
    onInvite?.(userId);
    toast.success('Collaboration invitation sent!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-500/20 border-green-500/30';
    if (score >= 70) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  const filteredMatches = matches.filter(match =>
    match.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.skills.some(skill => skill.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-gray-400">Finding perfect matches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <SparklesIcon className="w-8 h-8 text-primary-400" />
            <span>Smart Skill Matching</span>
          </h2>
          <p className="text-gray-400 mt-1">
            AI-powered algorithm found {filteredMatches.length} potential collaborators
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="score">Best Match</option>
            <option value="experience">Experience</option>
            <option value="rating">Rating</option>
            <option value="activity">Activity</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-secondary-800 border border-secondary-700 rounded-lg hover:border-primary-500/50 transition-colors"
          >
            {viewMode === 'grid' ? (
              <UserGroupIcon className="w-5 h-5 text-gray-400" />
            ) : (
              <ChartBarIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg hover:border-primary-500/50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, skills, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-secondary-800/50 rounded-lg p-4 border border-secondary-700/50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Match Score
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedFilters.minScore}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-400">{selectedFilters.minScore}%</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={selectedFilters.minExperience}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, minExperience: parseInt(e.target.value) }))}
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-1 text-sm text-white"
                  >
                    <option value={0}>Any</option>
                    <option value={1}>1+ years</option>
                    <option value={3}>3+ years</option>
                    <option value={5}>5+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={selectedFilters.availability}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full bg-secondary-700 border border-secondary-600 rounded-md px-3 py-1 text-sm text-white"
                  >
                    <option value="any">Any</option>
                    <option value="part-time">Part-time</option>
                    <option value="full-time">Full-time</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.verified}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, verified: e.target.checked }))}
                      className="rounded border-secondary-600 text-primary-500"
                    />
                    <span className="text-sm text-gray-300">Verified only</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFilters.hasPortfolio}
                      onChange={(e) => setSelectedFilters(prev => ({ ...prev, hasPortfolio: e.target.checked }))}
                      className="rounded border-secondary-600 text-primary-500"
                    />
                    <span className="text-sm text-gray-300">Has portfolio</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
        <AnimatePresence>
          {filteredMatches.map((match, index) => (
            <motion.div
              key={match.user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-secondary-800/80 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-6 hover:border-primary-500/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={match.user.avatar}
                    alt={match.user.fullName}
                    className="w-12 h-12 rounded-full border-2 border-primary-500/30"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-white">{match.user.fullName}</h3>
                      {match.user.verified && (
                        <CheckBadgeIcon className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">@{match.user.username}</p>
                    <p className="text-sm text-primary-300">{match.user.title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreBgColor(match.overallScore)}`}>
                    <BoltIcon className="w-4 h-4 mr-1" />
                    <span className={getScoreColor(match.overallScore)}>
                      {match.overallScore}% Match
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills & Scores */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Matching Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {match.matchingSkills.slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-md border border-green-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {match.matchingSkills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded-md">
                        +{match.matchingSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Key Metrics</h4>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div>Skills: {match.skillCompatibility}%</div>
                    <div>Experience: {match.experienceScore}%</div>
                    <div>Availability: {match.availabilityMatch}%</div>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-white">{match.user.projectHistory.completed}</div>
                  <div className="text-xs text-gray-400">Projects</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white flex items-center justify-center">
                    {match.user.projectHistory.rating}
                    <StarSolid className="w-3 h-3 text-yellow-400 ml-1" />
                  </div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{match.user.achievements.level}</div>
                  <div className="text-xs text-gray-400">Level</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{match.user.availability.hoursPerWeek}h</div>
                  <div className="text-xs text-gray-400">Per Week</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="mb-4">
                <p className="text-sm text-gray-300 italic">"{match.recommendation}"</p>
              </div>

              {/* Strengths & Concerns */}
              {(match.strengths.length > 0 || match.concerns.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {match.strengths.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-green-400 mb-1">Strengths</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {match.strengths.slice(0, 2).map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {match.concerns.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-yellow-400 mb-1">Considerations</h5>
                      <ul className="text-xs text-gray-400 space-y-1">
                        {match.concerns.slice(0, 2).map((concern, i) => (
                          <li key={i}>• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-secondary-700/50">
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  <span className="flex items-center space-x-1">
                    <GlobeAltIcon className="w-3 h-3" />
                    <span>{match.user.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <ClockIcon className="w-3 h-3" />
                    <span>{match.user.timezone}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUserSelect?.(match.user)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-secondary-700 hover:bg-secondary-600 text-white rounded-md transition-colors"
                  >
                    <UserGroupIcon className="w-3 h-3" />
                    <span>View Profile</span>
                  </button>
                  
                  <button
                    onClick={() => handleInviteUser(match.user.id)}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                  >
                    <EnvelopeIcon className="w-3 h-3" />
                    <span>Invite</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No matches found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

export default SmartSkillMatching;