import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  HeartIcon,
  UserGroupIcon,
  CodeBracketIcon,
  LightBulbIcon,
  GlobeAltIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CalendarDaysIcon,
  BeakerIcon,
  CommandLineIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import {
  TrophyIcon as TrophySolid,
  StarIcon as StarSolid,
  FireIcon as FireSolid,
  BoltIcon as BoltSolid,
  ShieldCheckIcon as ShieldSolid,
  HeartIcon as HeartSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'project' | 'collaboration' | 'skill' | 'community' | 'special' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: React.ComponentType<any>;
  iconSolid?: React.ComponentType<any>;
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    type: string;
    target: number;
    current?: number;
  }[];
  unlockedAt?: Date;
  isUnlocked: boolean;
  isNew?: boolean;
  prerequisites?: string[];
  secretAchievement?: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  earnedAt: Date;
  category: string;
  level?: number;
}

interface UserLevel {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  totalXP: number;
  prestige: number;
}

interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  rarityBreakdown: Record<string, number>;
  categoryProgress: Record<string, { unlocked: number; total: number }>;
  recentUnlocks: Achievement[];
  streak: {
    current: number;
    longest: number;
    type: 'daily' | 'weekly';
  };
}

interface AdvancedAchievementSystemProps {
  userId?: string;
  showNotifications?: boolean;
  compact?: boolean;
}

const AdvancedAchievementSystem: React.FC<AdvancedAchievementSystemProps> = ({
  userId = 'current-user',
  showNotifications = true,
  compact = false
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userLevel, setUserLevel] = useState<UserLevel>({
    currentLevel: 8,
    currentXP: 2850,
    xpForNextLevel: 3200,
    totalXP: 15650,
    prestige: 1
  });
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'badges' | 'progress'>('achievements');
  const [loading, setLoading] = useState(true);

  // Achievement definitions
  const achievementDefinitions: Achievement[] = [
    {
      id: 'first-project',
      title: 'First Steps',
      description: 'Create your first project on ProjectForge',
      category: 'project',
      tier: 'bronze',
      icon: RocketLaunchIcon,
      iconSolid: RocketLaunchIcon,
      xpReward: 100,
      rarity: 'common',
      requirements: [{ type: 'projects_created', target: 1, current: 1 }],
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'project-master',
      title: 'Project Master',
      description: 'Successfully complete 10 projects',
      category: 'project',
      tier: 'gold',
      icon: TrophyIcon,
      iconSolid: TrophySolid,
      xpReward: 500,
      rarity: 'rare',
      requirements: [{ type: 'projects_completed', target: 10, current: 7 }],
      isUnlocked: false
    },
    {
      id: 'collaboration-king',
      title: 'Collaboration King',
      description: 'Work with 25 different collaborators',
      category: 'collaboration',
      tier: 'platinum',
      icon: UserGroupIcon,
      xpReward: 750,
      rarity: 'epic',
      requirements: [{ type: 'unique_collaborators', target: 25, current: 18 }],
      isUnlocked: false
    },
    {
      id: 'skill-collector',
      title: 'Skill Collector',
      description: 'Master 5 different programming languages',
      category: 'skill',
      tier: 'silver',
      icon: CodeBracketIcon,
      xpReward: 300,
      rarity: 'uncommon',
      requirements: [{ type: 'languages_mastered', target: 5, current: 3 }],
      isUnlocked: false
    },
    {
      id: 'innovation-pioneer',
      title: 'Innovation Pioneer',
      description: 'Be among the first to use new AI features',
      category: 'special',
      tier: 'diamond',
      icon: LightBulbIcon,
      xpReward: 1000,
      rarity: 'legendary',
      requirements: [{ type: 'early_adopter', target: 1, current: 1 }],
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isNew: true
    },
    {
      id: 'community-champion',
      title: 'Community Champion',
      description: 'Help 50 community members with their projects',
      category: 'community',
      tier: 'gold',
      icon: HeartIcon,
      iconSolid: HeartSolid,
      xpReward: 600,
      rarity: 'rare',
      requirements: [{ type: 'community_helps', target: 50, current: 32 }],
      isUnlocked: false
    },
    {
      id: 'streak-master',
      title: 'Streak Master',
      description: 'Maintain a 30-day daily activity streak',
      category: 'milestone',
      tier: 'platinum',
      icon: FireIcon,
      iconSolid: FireSolid,
      xpReward: 800,
      rarity: 'epic',
      requirements: [{ type: 'daily_streak', target: 30, current: 12 }],
      isUnlocked: false
    },
    {
      id: 'speed-demon',
      title: 'Speed Demon',
      description: 'Complete a project in under 24 hours',
      category: 'project',
      tier: 'silver',
      icon: BoltIcon,
      iconSolid: BoltSolid,
      xpReward: 350,
      rarity: 'uncommon',
      requirements: [{ type: 'fast_completion', target: 1, current: 0 }],
      isUnlocked: false
    },
    {
      id: 'global-contributor',
      title: 'Global Contributor',
      description: 'Collaborate with developers from 10 different countries',
      category: 'collaboration',
      tier: 'gold',
      icon: GlobeAltIcon,
      xpReward: 550,
      rarity: 'rare',
      requirements: [{ type: 'global_collaborations', target: 10, current: 6 }],
      isUnlocked: false
    },
    {
      id: 'perfectionist',
      title: 'Perfectionist',
      description: 'Achieve 5-star ratings on 10 projects',
      category: 'project',
      tier: 'diamond',
      icon: StarIcon,
      iconSolid: StarSolid,
      xpReward: 900,
      rarity: 'legendary',
      requirements: [{ type: 'perfect_ratings', target: 10, current: 4 }],
      isUnlocked: false
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Guide 5 new developers to their first project completion',
      category: 'community',
      tier: 'platinum',
      icon: AcademicCapIcon,
      xpReward: 700,
      rarity: 'epic',
      requirements: [{ type: 'mentored_developers', target: 5, current: 2 }],
      isUnlocked: false
    },
    {
      id: 'security-expert',
      title: 'Security Expert',
      description: 'Complete advanced security certification',
      category: 'skill',
      tier: 'platinum',
      icon: ShieldCheckIcon,
      iconSolid: ShieldSolid,
      xpReward: 750,
      rarity: 'epic',
      requirements: [{ type: 'security_cert', target: 1, current: 0 }],
      isUnlocked: false
    },
    {
      id: 'ai-whisperer',
      title: 'AI Whisperer',
      description: 'Successfully implement AI in 3 different projects',
      category: 'skill',
      tier: 'diamond',
      icon: CpuChipIcon,
      xpReward: 850,
      rarity: 'legendary',
      requirements: [{ type: 'ai_implementations', target: 3, current: 1 }],
      isUnlocked: false
    },
    {
      id: 'bug-hunter',
      title: 'Bug Hunter',
      description: 'Find and report 25 critical bugs',
      category: 'community',
      tier: 'silver',
      icon: BeakerIcon,
      xpReward: 400,
      rarity: 'uncommon',
      requirements: [{ type: 'bugs_reported', target: 25, current: 15 }],
      isUnlocked: false
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Be active during early morning hours (5-7 AM) for 15 days',
      category: 'special',
      tier: 'bronze',
      icon: ClockIcon,
      xpReward: 200,
      rarity: 'common',
      requirements: [{ type: 'early_morning_activity', target: 15, current: 8 }],
      isUnlocked: false,
      secretAchievement: true
    }
  ];

  // Badge definitions
  const badgeDefinitions: Badge[] = [
    {
      id: 'verified-developer',
      name: 'Verified Developer',
      description: 'Completed profile verification process',
      icon: CheckBadgeIcon,
      color: 'blue',
      earnedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      category: 'verification'
    },
    {
      id: 'react-specialist',
      name: 'React Specialist',
      description: 'Demonstrated expertise in React development',
      icon: CodeBracketIcon,
      color: 'cyan',
      earnedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      category: 'skill',
      level: 3
    },
    {
      id: 'team-player',
      name: 'Team Player',
      description: 'Excellent collaboration and communication skills',
      icon: UserGroupIcon,
      color: 'green',
      earnedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      category: 'soft-skill'
    },
    {
      id: 'ai-pioneer',
      name: 'AI Pioneer',
      description: 'Early adopter of AI-powered features',
      icon: SparklesIcon,
      color: 'purple',
      earnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      category: 'innovation'
    }
  ];

  useEffect(() => {
    // Simulate loading achievement data
    setLoading(true);
    setTimeout(() => {
      setAchievements(achievementDefinitions);
      setBadges(badgeDefinitions);
      
      // Calculate stats
      const totalAchievements = achievementDefinitions.length;
      const unlockedAchievements = achievementDefinitions.filter(a => a.isUnlocked).length;
      const completionRate = (unlockedAchievements / totalAchievements) * 100;
      
      const rarityBreakdown = achievementDefinitions.reduce((acc, achievement) => {
        acc[achievement.rarity] = (acc[achievement.rarity] || 0) + (achievement.isUnlocked ? 1 : 0);
        return acc;
      }, {} as Record<string, number>);

      const categoryProgress = achievementDefinitions.reduce((acc, achievement) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = { unlocked: 0, total: 0 };
        }
        acc[achievement.category].total++;
        if (achievement.isUnlocked) {
          acc[achievement.category].unlocked++;
        }
        return acc;
      }, {} as Record<string, { unlocked: number; total: number }>);

      const recentUnlocks = achievementDefinitions
        .filter(a => a.isUnlocked && a.unlockedAt)
        .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
        .slice(0, 5);

      setStats({
        totalAchievements,
        unlockedAchievements,
        completionRate,
        rarityBreakdown,
        categoryProgress,
        recentUnlocks,
        streak: {
          current: 12,
          longest: 45,
          type: 'daily'
        }
      });
      
      setLoading(false);
    }, 1000);
  }, []);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-500/20 border-amber-500/30';
      case 'silver': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'gold': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'platinum': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30';
      case 'diamond': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'green': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'purple': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'cyan': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'yellow': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getProgressPercentage = (requirements: Achievement['requirements']) => {
    if (requirements.length === 0) return 100;
    const req = requirements[0];
    return Math.min((req.current || 0) / req.target * 100, 100);
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) return false;
    if (selectedTier !== 'all' && achievement.tier !== selectedTier) return false;
    if (showUnlockedOnly && !achievement.isUnlocked) return false;
    return true;
  });

  const categories = ['all', 'project', 'collaboration', 'skill', 'community', 'special', 'milestone'];
  const tiers = ['all', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-gray-400">Loading achievement system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Level Progress */}
      <div className="bg-gradient-to-r from-primary-600/20 via-accent-pink/20 to-accent-purple/20 rounded-2xl p-6 border border-primary-500/30">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
              <TrophySolid className="w-8 h-8 text-yellow-400" />
              <span>Achievement System</span>
              {userLevel.prestige > 0 && (
                <div className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <StarSolid className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-400">Prestige {userLevel.prestige}</span>
                </div>
              )}
            </h2>
            <p className="text-gray-400 mt-1">
              Level {userLevel.currentLevel} • {userLevel.currentXP.toLocaleString()} / {userLevel.xpForNextLevel.toLocaleString()} XP
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-400">{stats?.completionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Complete</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-secondary-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(userLevel.currentXP / userLevel.xpForNextLevel) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-3 bg-gradient-to-r from-primary-500 to-accent-pink rounded-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </motion.div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Level {userLevel.currentLevel}</span>
            <span>{userLevel.xpForNextLevel - userLevel.currentXP} XP to next level</span>
            <span>Level {userLevel.currentLevel + 1}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{stats?.unlockedAchievements}</div>
            <div className="text-xs text-gray-400">Achievements</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{badges.length}</div>
            <div className="text-xs text-gray-400">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{userLevel.totalXP.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total XP</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{stats?.streak.current}</div>
            <div className="text-xs text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary-800 rounded-lg p-1">
        {['achievements', 'badges', 'progress'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-secondary-800 border border-secondary-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {tiers.map(tier => (
                  <option key={tier} value={tier}>
                    {tier.charAt(0).toUpperCase() + tier.slice(1)}
                  </option>
                ))}
              </select>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnlockedOnly}
                  onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                  className="rounded border-secondary-600 text-primary-500"
                />
                <span className="text-sm text-gray-300">Unlocked only</span>
              </label>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => {
                  const Icon = achievement.isUnlocked && achievement.iconSolid ? achievement.iconSolid : achievement.icon;
                  const progress = getProgressPercentage(achievement.requirements);
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className={`relative bg-secondary-800/80 backdrop-blur-xl rounded-xl border p-4 transition-all duration-300 ${
                        achievement.isUnlocked 
                          ? 'border-primary-500/50 shadow-lg shadow-primary-500/20' 
                          : 'border-secondary-700/50 hover:border-secondary-600/50'
                      }`}
                    >
                      {/* New Badge */}
                      {achievement.isNew && achievement.isUnlocked && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            NEW
                          </div>
                        </div>
                      )}

                      {/* Secret Achievement Overlay */}
                      {achievement.secretAchievement && !achievement.isUnlocked && (
                        <div className="absolute inset-0 bg-secondary-900/80 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <SparklesIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="text-sm text-purple-400 font-medium">Secret Achievement</div>
                            <div className="text-xs text-gray-400">Keep exploring to unlock</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start space-x-3">
                        <div className={`p-3 rounded-lg border ${getTierColor(achievement.tier)} ${
                          achievement.isUnlocked ? 'opacity-100' : 'opacity-50'
                        }`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`font-semibold ${achievement.isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                              {achievement.title}
                            </h3>
                            <span className={`text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity.toUpperCase()}
                            </span>
                          </div>
                          
                          <p className={`text-sm mb-3 ${achievement.isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>

                          {/* Progress */}
                          {!achievement.isUnlocked && achievement.requirements.length > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-gray-400 mb-1">
                                <span>Progress</span>
                                <span>{achievement.requirements[0].current || 0} / {achievement.requirements[0].target}</span>
                              </div>
                              <div className="w-full bg-secondary-700 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className="h-2 bg-gradient-to-r from-primary-500 to-accent-pink rounded-full"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <BoltSolid className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-yellow-400">
                                +{achievement.xpReward} XP
                              </span>
                            </div>
                            
                            {achievement.isUnlocked && achievement.unlockedAt && (
                              <span className="text-xs text-gray-400">
                                {achievement.unlockedAt.toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {badges.map((badge, index) => {
                const Icon = badge.icon;
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-secondary-800/80 backdrop-blur-xl rounded-xl border p-4 text-center ${getBadgeColor(badge.color)}`}
                  >
                    <div className="mb-3">
                      <Icon className="w-8 h-8 mx-auto" />
                    </div>
                    
                    <h3 className="font-semibold mb-1">{badge.name}</h3>
                    {badge.level && (
                      <div className="text-xs opacity-75 mb-1">Level {badge.level}</div>
                    )}
                    <p className="text-xs opacity-75 mb-3">{badge.description}</p>
                    
                    <div className="text-xs opacity-60">
                      Earned {badge.earnedAt.toLocaleDateString()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && stats && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Category Progress */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Category Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.categoryProgress).map(([category, progress]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300 capitalize">{category}</span>
                      <span className="text-gray-400">{progress.unlocked}/{progress.total}</span>
                    </div>
                    <div className="w-full bg-secondary-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.unlocked / progress.total) * 100}%` }}
                        className="h-2 bg-gradient-to-r from-primary-500 to-accent-pink rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Unlocks */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {stats.recentUnlocks.map((achievement) => {
                  const Icon = achievement.iconSolid || achievement.icon;
                  
                  return (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-secondary-700/50 rounded-lg">
                      <div className={`p-2 rounded-lg border ${getTierColor(achievement.tier)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{achievement.title}</div>
                        <div className="text-sm text-gray-400">{achievement.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-yellow-400">+{achievement.xpReward} XP</div>
                        <div className="text-xs text-gray-400">
                          {achievement.unlockedAt?.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Information */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Streak</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{stats.streak.current}</div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">{stats.streak.longest}</div>
                  <div className="text-sm text-gray-400">Longest Streak</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
                <div className="flex items-center space-x-2">
                  <FireSolid className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-orange-300">
                    Keep your streak alive! Daily activity boosts XP gain by 10%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAchievementSystem;