import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  GiftIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChartBarIcon,
  LightBulbIcon,
  CodeBracketIcon,
  CpuChipIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  HeartIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  StopIcon,
  FlagIcon,
  MapIcon,
  UsersIcon,
  AcademicCapIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid,
  HeartIcon as HeartSolid,
  CheckCircleIcon as CheckSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import supabase from '../../services/supabase';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'coding-contest' | 'design-challenge' | 'innovation-lab' | 'community-project' | 'learning-sprint';
  category: 'web-dev' | 'mobile' | 'ai-ml' | 'blockchain' | 'game-dev' | 'design' | 'data-science' | 'devops' | 'general';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'upcoming' | 'active' | 'judging' | 'completed';
  
  // Timing
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  duration: string;
  
  // Participation
  maxParticipants?: number;
  currentParticipants: number;
  minTeamSize: number;
  maxTeamSize: number;
  isTeamChallenge: boolean;
  
  // Rewards
  prizes: {
    position: number;
    title: string;
    description: string;
    value: string;
    xpReward: number;
    badges: string[];
  }[];
  
  // Requirements
  requiredSkills: string[];
  optionalSkills: string[];
  requirements: string[];
  
  // Content
  theme: string;
  rules: string[];
  judgesCriteria: string[];
  resources: {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'tool' | 'template';
  }[];
  
  // Organizer
  organizer: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    organization?: string;
  };
  
  // Metrics
  totalSubmissions: number;
  viewCount: number;
  upvotes: number;
  
  // User interaction
  isRegistered?: boolean;
  isBookmarked?: boolean;
  isUpvoted?: boolean;
  userTeam?: {
    id: string;
    name: string;
    members: any[];
  };
  
  // Media
  bannerImage?: string;
  tags: string[];
  
  // Special features
  hasLiveStream?: boolean;
  hasMentorship?: boolean;
  isSponsored?: boolean;
  sponsorLogos?: string[];
}

interface Submission {
  id: string;
  challengeId: string;
  title: string;
  description: string;
  teamName: string;
  members: {
    id: string;
    name: string;
    avatar: string;
    role: string;
  }[];
  submittedAt: Date;
  repositoryUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  screenshots: string[];
  technologies: string[];
  votes: number;
  userVoted?: boolean;
  judgeScores?: {
    innovation: number;
    technical: number;
    design: number;
    impact: number;
    presentation: number;
  };
  overallScore?: number;
  rank?: number;
  awards: string[];
}

interface CommunityChallengesProps {
  userId?: string;
  showCreateButton?: boolean;
  featuredOnly?: boolean;
  maxDisplayCount?: number;
}

const CommunityChallenges: React.FC<CommunityChallengesProps> = ({
  userId = 'current-user',
  showCreateButton = true,
  featuredOnly = false,
  maxDisplayCount
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'discover' | 'my-challenges' | 'submissions' | 'leaderboard'>('discover');
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    difficulty: 'all',
    status: 'all',
    teamSize: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'ending-soon' | 'prizes'>('trending');


  useEffect(() => {
    let mounted = true;

    const sampleData: Challenge[] = [
      {
        id: 'sample-1',
        title: 'Build with ProjectForge',
        description: 'A sample community challenge to onboard new contributors.',
        type: 'community-project',
        category: 'web-dev',
        difficulty: 'beginner',
        status: 'active',
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        registrationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        duration: '7 days',
        maxParticipants: 100,
        currentParticipants: 12,
        minTeamSize: 1,
        maxTeamSize: 5,
        isTeamChallenge: false,
        prizes: [
          { position: 1, title: 'Winner', description: 'Top prize', value: '$500', xpReward: 500, badges: ['winner'] }
        ],
        requiredSkills: ['javascript'],
        optionalSkills: [],
        requirements: [],
        theme: 'Improve onboarding',
        rules: [],
        judgesCriteria: [],
        resources: [],
        organizer: { id: 'org-1', name: 'ProjectForge', avatar: '/logo192.png', verified: true },
        totalSubmissions: 3,
        viewCount: 120,
        upvotes: 8,
        tags: ['onboarding', 'community'],
      }
    ];

    const load = async () => {
      try {
        // Try to fetch from a community_challenges table (if it exists)
        const { data, error, status } = await supabase
          .from('community_challenges')
          .select('*')
          .order('start_date', { ascending: false })
          .limit(maxDisplayCount || 50);

        if (!mounted) return;

        if (error && status !== 406) {
          // table may not exist or permission issue — fallback to sample
          console.warn('Could not load community_challenges from Supabase, using fallback', error);
          setChallenges(sampleData);
        } else if (data && Array.isArray(data) && data.length > 0) {
          // Map returned rows into Challenge shape as best-effort
          const parsed: Challenge[] = data.map((row: any) => ({
            id: row.id || String(row.challenge_id || Math.random()),
            title: row.title || row.name || 'Untitled Challenge',
            description: row.description || row.summary || '',
            type: row.type || 'community-project',
            category: row.category || 'general',
            difficulty: row.difficulty || 'beginner',
            status: row.status || 'upcoming',
            startDate: row.start_date ? new Date(row.start_date) : new Date(),
            endDate: row.end_date ? new Date(row.end_date) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            registrationDeadline: row.registration_deadline ? new Date(row.registration_deadline) : new Date(),
            duration: row.duration || 'TBD',
            maxParticipants: row.max_participants,
            currentParticipants: row.current_participants || 0,
            minTeamSize: row.min_team_size || 1,
            maxTeamSize: row.max_team_size || 1,
            isTeamChallenge: !!row.is_team_challenge,
            prizes: row.prizes || [],
            requiredSkills: row.required_skills || [],
            optionalSkills: row.optional_skills || [],
            requirements: row.requirements || [],
            theme: row.theme || '',
            rules: row.rules || [],
            judgesCriteria: row.judges_criteria || [],
            resources: row.resources || [],
            organizer: row.organizer || { id: 'org-1', name: row.organizer_name || 'Community', avatar: '/logo192.png', verified: false },
            totalSubmissions: row.total_submissions || 0,
            viewCount: row.view_count || 0,
            upvotes: row.upvotes || 0,
            tags: row.tags || [],
            // optional fields for UX
            isRegistered: row.is_registered || false,
            isBookmarked: row.is_bookmarked || false,
            isUpvoted: row.is_upvoted || false,
            bannerImage: row.banner_image || undefined,
            hasLiveStream: row.has_live_stream || false,
            hasMentorship: row.has_mentorship || false,
            isSponsored: row.is_sponsored || false,
            sponsorLogos: row.sponsor_logos || []
          }));

          setChallenges(parsed.slice(0, maxDisplayCount || parsed.length));
        } else {
          setChallenges(sampleData);
        }
      } catch (err) {
        console.error('Error loading community challenges', err);
        if (!mounted) return;
        setChallenges(sampleData);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => { mounted = false; };
  }, []);

  const getStatusColor = (status: Challenge['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'active': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'judging': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'completed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-orange-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: Challenge['type']) => {
    switch (type) {
      case 'hackathon': return CodeBracketIcon;
      case 'coding-contest': return BoltIcon;
      case 'design-challenge': return PaintBrushIcon;
      case 'innovation-lab': return LightBulbIcon;
      case 'community-project': return UserGroupIcon;
      case 'learning-sprint': return AcademicCapIcon;
      default: return TrophyIcon;
    }
  };

  const getCategoryIcon = (category: Challenge['category']) => {
    switch (category) {
      case 'web-dev': return CodeBracketIcon;
      case 'mobile': return CpuChipIcon;
      case 'ai-ml': return CpuChipIcon;
      case 'blockchain': return CpuChipIcon;
      case 'game-dev': return CpuChipIcon;
      case 'design': return PaintBrushIcon;
      case 'data-science': return ChartBarIcon;
      case 'devops': return BeakerIcon;
      default: return TagIcon;
    }
  };

  const formatTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const handleRegister = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isRegistered: true, currentParticipants: challenge.currentParticipants + 1 }
        : challenge
    ));
    toast.success('Successfully registered for challenge!');
  };

  const handleBookmark = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, isBookmarked: !challenge.isBookmarked }
        : challenge
    ));
    toast.success('Challenge bookmarked!');
  };

  const handleUpvote = (challengeId: string) => {
    setChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { 
            ...challenge, 
            isUpvoted: !challenge.isUpvoted,
            upvotes: challenge.isUpvoted ? challenge.upvotes - 1 : challenge.upvotes + 1
          }
        : challenge
    ));
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (searchQuery && !challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !challenge.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    if (filters.type !== 'all' && challenge.type !== filters.type) return false;
    if (filters.category !== 'all' && challenge.category !== filters.category) return false;
    if (filters.difficulty !== 'all' && challenge.difficulty !== filters.difficulty) return false;
    if (filters.status !== 'all' && challenge.status !== filters.status) return false;
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.startDate.getTime() - a.startDate.getTime();
      case 'ending-soon':
        return a.endDate.getTime() - b.endDate.getTime();
      case 'prizes':
        return (b.prizes[0]?.xpReward || 0) - (a.prizes[0]?.xpReward || 0);
      default: // trending
        return (b.upvotes + b.currentParticipants) - (a.upvotes + a.currentParticipants);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-gray-400">Loading community challenges...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <TrophySolid className="w-8 h-8 text-yellow-400" />
            <span>Community Challenges</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Join hackathons, contests, and collaborative projects
          </p>
        </div>

        {showCreateButton && (
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Create Challenge</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary-800 rounded-lg p-1">
        {[
          { key: 'discover', label: 'Discover', icon: MagnifyingGlassIcon },
          { key: 'my-challenges', label: 'My Challenges', icon: UserGroupIcon },
          { key: 'submissions', label: 'Submissions', icon: CodeBracketIcon },
          { key: 'leaderboard', label: 'Leaderboard', icon: TrophyIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-3 text-sm text-white"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest</option>
            <option value="ending-soon">Ending Soon</option>
            <option value="prizes">Best Prizes</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg hover:border-primary-500/50 transition-colors"
          >
            <FunnelIcon className="w-4 h-4" />
            <span className="text-sm">Filters</span>
          </button>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Types</option>
                  <option value="hackathon">Hackathons</option>
                  <option value="coding-contest">Contests</option>
                  <option value="design-challenge">Design</option>
                  <option value="innovation-lab">Innovation</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Categories</option>
                  <option value="web-dev">Web Dev</option>
                  <option value="mobile">Mobile</option>
                  <option value="ai-ml">AI/ML</option>
                  <option value="blockchain">Blockchain</option>
                </select>

                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="judging">Judging</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={filters.teamSize}
                  onChange={(e) => setFilters(prev => ({ ...prev, teamSize: e.target.value }))}
                  className="bg-secondary-700 border border-secondary-600 rounded-md px-3 py-2 text-sm text-white"
                >
                  <option value="all">Any Team Size</option>
                  <option value="solo">Solo</option>
                  <option value="small">Small (2-3)</option>
                  <option value="medium">Medium (4-6)</option>
                  <option value="large">Large (7+)</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredChallenges.map((challenge, index) => {
            const TypeIcon = getTypeIcon(challenge.type);
            const CategoryIcon = getCategoryIcon(challenge.category);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-secondary-800/80 backdrop-blur-xl rounded-2xl border border-secondary-700/50 overflow-hidden hover:border-primary-500/30 transition-all duration-300"
              >
                {/* Banner */}
                {challenge.bannerImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={challenge.bannerImage}
                      alt={challenge.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(challenge.status)}`}>
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
                      </span>
                    </div>

                    {/* Sponsored Badge */}
                    {challenge.isSponsored && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          <StarSolid className="w-3 h-3 mr-1" />
                          Sponsored
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30">
                        <TypeIcon className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg line-clamp-1">
                          {challenge.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <CategoryIcon className="w-4 h-4" />
                          <span className="capitalize">{challenge.category.replace('-', ' ')}</span>
                          <span>•</span>
                          <span className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleBookmark(challenge.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          challenge.isBookmarked 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-secondary-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <StarIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleUpvote(challenge.id)}
                        className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                          challenge.isUpvoted 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-secondary-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <HeartIcon className="w-4 h-4" />
                        <span className="text-xs">{challenge.upvotes}</span>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {challenge.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {challenge.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {challenge.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded-md">
                        +{challenge.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Prizes */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <GiftIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">
                        Prize Pool: {challenge.prizes[0]?.value || 'TBA'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Up to +{challenge.prizes[0]?.xpReward || 0} XP
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{challenge.currentParticipants}</div>
                      <div className="text-xs text-gray-400">Participants</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{challenge.totalSubmissions}</div>
                      <div className="text-xs text-gray-400">Submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{formatTimeRemaining(challenge.endDate)}</div>
                      <div className="text-xs text-gray-400">Remaining</div>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="mb-4 p-3 bg-secondary-700/50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-300">
                        <UsersIcon className="w-4 h-4" />
                        <span>
                          {challenge.isTeamChallenge 
                            ? `Teams: ${challenge.minTeamSize}-${challenge.maxTeamSize} members`
                            : 'Solo challenge'
                          }
                        </span>
                      </div>
                      <div className="text-gray-400">
                        {challenge.duration}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className="flex-1 py-2 px-4 bg-secondary-700 hover:bg-secondary-600 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    
                    {challenge.status === 'active' && !challenge.isRegistered && (
                      <button
                        onClick={() => handleRegister(challenge.id)}
                        className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Register
                      </button>
                    )}

                    {challenge.isRegistered && (
                      <div className="flex-1 py-2 px-4 bg-green-500/20 text-green-300 rounded-lg text-sm font-medium text-center border border-green-500/30">
                        ✓ Registered
                      </div>
                    )}
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-700/50">
                    <div className="flex items-center space-x-2">
                      <img
                        src={challenge.organizer.avatar}
                        alt={challenge.organizer.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-400">
                        by {challenge.organizer.name}
                      </span>
                      {challenge.organizer.verified && (
                        <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <CalendarDaysIcon className="w-3 h-3" />
                      <span>{challenge.startDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-12">
          <TrophyIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No challenges found</h3>
          <p className="text-gray-400">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );
};

// Device icon component (not available in heroicons)
const DeviceIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
  </svg>
);

export default CommunityChallenges;