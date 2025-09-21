import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid
} from '@heroicons/react/24/solid';

interface LeaderboardUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  previousRank?: number;
  points: number;
  level: number;
  badges: string[];
  stats: {
    projectsCreated: number;
    ideasShared: number;
    upvotesReceived: number;
    collaborations: number;
    totalViews: number;
    reputation: number;
  };
  specialties: string[];
  joinedDate: string;
  location?: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy: number; // percentage of users who have this
}

const LeaderboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('all-time');
  const [category, setCategory] = useState('overall');
  const [region, setRegion] = useState('global');

  // Mock leaderboard data
  const leaderboardUsers: LeaderboardUser[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      username: 'sarah_creates',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1c7?w=100&h=100&fit=crop&crop=face',
      rank: 1,
      previousRank: 2,
      points: 15847,
      level: 42,
      badges: ['🏆', '💎', '🚀', '💡', '⭐'],
      stats: {
        projectsCreated: 28,
        ideasShared: 67,
        upvotesReceived: 3456,
        collaborations: 89,
        totalViews: 125000,
        reputation: 15847
      },
      specialties: ['AI/ML', 'Full Stack', 'Product Design'],
      joinedDate: '2023-01-15',
      location: 'San Francisco, CA'
    },
    {
      id: '2',
      name: 'Alex Rodriguez',
      username: 'alex_builds',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      rank: 2,
      previousRank: 1,
      points: 14692,
      level: 39,
      badges: ['🏆', '🚀', '🔥', '💡'],
      stats: {
        projectsCreated: 35,
        ideasShared: 45,
        upvotesReceived: 2890,
        collaborations: 76,
        totalViews: 98000,
        reputation: 14692
      },
      specialties: ['Blockchain', 'Backend', 'DevOps'],
      joinedDate: '2023-02-08',
      location: 'Austin, TX'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      username: 'emily_innovates',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rank: 3,
      previousRank: 4,
      points: 13245,
      level: 36,
      badges: ['🏆', '💎', '🌟', '❤️'],
      stats: {
        projectsCreated: 22,
        ideasShared: 89,
        upvotesReceived: 2567,
        collaborations: 134,
        totalViews: 87000,
        reputation: 13245
      },
      specialties: ['UX/UI', 'Frontend', 'Research'],
      joinedDate: '2023-03-12',
      location: 'New York, NY'
    },
    {
      id: '4',
      name: 'David Kim',
      username: 'david_codes',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rank: 4,
      previousRank: 3,
      points: 11893,
      level: 33,
      badges: ['🚀', '🔥', '💡', '⚡'],
      stats: {
        projectsCreated: 31,
        ideasShared: 52,
        upvotesReceived: 2234,
        collaborations: 67,
        totalViews: 76000,
        reputation: 11893
      },
      specialties: ['Mobile Dev', 'React Native', 'Cloud'],
      joinedDate: '2023-04-20',
      location: 'Seoul, South Korea'
    },
    {
      id: '5',
      name: 'Maria Santos',
      username: 'maria_research',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face',
      rank: 5,
      previousRank: 6,
      points: 10567,
      level: 30,
      badges: ['🏆', '🎓', '🔬', '📊'],
      stats: {
        projectsCreated: 18,
        ideasShared: 73,
        upvotesReceived: 1998,
        collaborations: 95,
        totalViews: 65000,
        reputation: 10567
      },
      specialties: ['Data Science', 'Research', 'AI Ethics'],
      joinedDate: '2023-05-15',
      location: 'Barcelona, Spain'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Created your first project',
      icon: '🎯',
      rarity: 'common',
      unlockedBy: 95
    },
    {
      id: '2',
      name: 'Idea Machine',
      description: 'Shared 50+ innovative ideas',
      icon: '💡',
      rarity: 'rare',
      unlockedBy: 25
    },
    {
      id: '3',
      name: 'Community Favorite',
      description: 'Received 1000+ upvotes',
      icon: '❤️',
      rarity: 'epic',
      unlockedBy: 8
    },
    {
      id: '4',
      name: 'Legendary Creator',
      description: 'Built 25+ successful projects',
      icon: '💎',
      rarity: 'legendary',
      unlockedBy: 2
    }
  ];

  const timeRanges = [
    { value: 'all-time', label: 'All Time' },
    { value: 'year', label: 'This Year' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' }
  ];

  const categories = [
    { value: 'overall', label: 'Overall', icon: TrophyIcon },
    { value: 'projects', label: 'Project Creators', icon: RocketLaunchIcon },
    { value: 'ideas', label: 'Idea Generators', icon: LightBulbIcon },
    { value: 'collaborators', label: 'Best Collaborators', icon: UserGroupIcon },
    { value: 'reputation', label: 'Reputation Leaders', icon: StarIcon }
  ];

  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'other', label: 'Other Regions' }
  ];

  const getRankChange = (current: number, previous?: number) => {
    if (!previous) return { type: 'new', value: 0 };
    if (current < previous) return { type: 'up', value: previous - current };
    if (current > previous) return { type: 'down', value: current - previous };
    return { type: 'same', value: 0 };
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophySolid className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <TrophyIcon className="w-8 h-8 text-gray-300" />;
      case 3:
        return <TrophyIcon className="w-8 h-8 text-orange-400" />;
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-secondary-600 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{rank}</span>
          </div>
        );
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getCrownForTop3 = (rank: number) => {
    if (rank <= 3) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="absolute -top-4 -right-2"
        >
          <StarIcon className={`w-6 h-6 ${
            rank === 1 ? 'text-yellow-400' : 
            rank === 2 ? 'text-gray-300' : 
            'text-orange-400'
          }`} />
        </motion.div>
      );
    }
    return null;
  };

  const getStatForCategory = (user: LeaderboardUser, cat: string) => {
    switch (cat) {
      case 'projects':
        return user.stats.projectsCreated;
      case 'ideas':
        return user.stats.ideasShared;
      case 'collaborators':
        return user.stats.collaborations;
      case 'reputation':
        return user.stats.reputation;
      default:
        return user.points;
    }
  };

  const getStatLabel = (cat: string) => {
    switch (cat) {
      case 'projects':
        return 'Projects';
      case 'ideas':
        return 'Ideas';
      case 'collaborators':
        return 'Collaborations';
      case 'reputation':
        return 'Reputation';
      default:
        return 'Points';
    }
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl mb-6">
            <TrophySolid className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-xl text-secondary-300 max-w-3xl mx-auto">
            Celebrate the top contributors, innovators, and collaborators in our community. 
            See where you rank and get inspired by the leaders.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-5 h-5 text-secondary-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5 text-secondary-400" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <GlobeAltIcon className="w-5 h-5 text-secondary-400" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="px-3 py-2 bg-secondary-700/50 border border-secondary-600 rounded-lg focus:border-primary-500 text-sm"
                >
                  {regions.map(reg => (
                    <option key={reg.value} value={reg.value}>{reg.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-sm text-secondary-400">
              Updated daily • {leaderboardUsers.length} ranked users
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-end justify-center space-x-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img
                  src={leaderboardUsers[1].avatar}
                  alt={leaderboardUsers[1].name}
                  className="w-20 h-20 rounded-full border-4 border-gray-300 object-cover"
                />
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-800">2</span>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">{leaderboardUsers[1].name}</h3>
              <p className="text-sm text-secondary-400 mb-2">@{leaderboardUsers[1].username}</p>
              <div className="text-lg font-bold text-gray-300">{leaderboardUsers[1].points.toLocaleString()}</div>
              <div className="h-24 w-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg mt-4"></div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img
                  src={leaderboardUsers[0].avatar}
                  alt={leaderboardUsers[0].name}
                  className="w-24 h-24 rounded-full border-4 border-yellow-400 object-cover"
                />
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  className="absolute -top-3 -right-3"
                >
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-yellow-800" />
                  </div>
                </motion.div>
              </div>
              <h3 className="font-semibold text-white mb-1">{leaderboardUsers[0].name}</h3>
              <p className="text-sm text-secondary-400 mb-2">@{leaderboardUsers[0].username}</p>
              <div className="text-xl font-bold text-yellow-400">{leaderboardUsers[0].points.toLocaleString()}</div>
              <div className="h-32 w-16 bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-lg mt-4"></div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4">
                <img
                  src={leaderboardUsers[2].avatar}
                  alt={leaderboardUsers[2].name}
                  className="w-20 h-20 rounded-full border-4 border-orange-400 object-cover"
                />
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-800">3</span>
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-white mb-1">{leaderboardUsers[2].name}</h3>
              <p className="text-sm text-secondary-400 mb-2">@{leaderboardUsers[2].username}</p>
              <div className="text-lg font-bold text-orange-400">{leaderboardUsers[2].points.toLocaleString()}</div>
              <div className="h-20 w-16 bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-lg mt-4"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-secondary-700">
            <h2 className="text-xl font-bold text-white">Full Rankings</h2>
          </div>
          <div className="divide-y divide-secondary-700">
            {leaderboardUsers.map((user, index) => {
              const rankChange = getRankChange(user.rank, user.previousRank);
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="p-6 relative"
                >
                  {getCrownForTop3(user.rank)}
                  
                  <div className="flex items-center space-x-6">
                    {/* Rank */}
                    <div className="flex-shrink-0 text-center w-16">
                      {getRankIcon(user.rank)}
                      <div className="mt-2">
                        {rankChange.type === 'up' && (
                          <div className="flex items-center justify-center text-green-400 text-xs">
                            <span>+{rankChange.value}</span>
                          </div>
                        )}
                        {rankChange.type === 'down' && (
                          <div className="flex items-center justify-center text-red-400 text-xs">
                            <span>-{rankChange.value}</span>
                          </div>
                        )}
                        {rankChange.type === 'new' && (
                          <div className="text-yellow-400 text-xs font-medium">NEW</div>
                        )}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white truncate">{user.name}</h3>
                          <span className="text-sm text-secondary-400">@{user.username}</span>
                          <div className="text-xs bg-primary-500/20 text-primary-300 px-2 py-1 rounded">
                            Level {user.level}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          {user.badges.slice(0, 5).map((badge, idx) => (
                            <span key={idx} className="text-lg">{badge}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {user.specialties.map((specialty) => (
                            <span
                              key={specialty}
                              className="px-2 py-1 text-xs bg-secondary-700/50 text-secondary-300 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-white">{getStatForCategory(user, category).toLocaleString()}</div>
                        <div className="text-secondary-400">{getStatLabel(category)}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">{user.stats.upvotesReceived.toLocaleString()}</div>
                        <div className="text-secondary-400">Upvotes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">{user.stats.totalViews.toLocaleString()}</div>
                        <div className="text-secondary-400">Views</div>
                      </div>
                    </div>

                    {/* Location */}
                    {user.location && (
                      <div className="text-xs text-secondary-500 w-24 text-right">
                        {user.location}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Community Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05 }}
                className="glass rounded-xl p-6 text-center"
              >
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className={`font-semibold mb-2 ${getRarityColor(achievement.rarity)}`}>
                  {achievement.name}
                </h3>
                <p className="text-sm text-secondary-400 mb-3">{achievement.description}</p>
                <div className="text-xs text-secondary-500">
                  Unlocked by {achievement.unlockedBy}% of users
                </div>
                <div className={`text-xs font-medium mt-2 ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity.toUpperCase()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;