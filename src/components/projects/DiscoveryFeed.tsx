import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FireIcon,
  ClockIcon,
  TrophyIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
  EyeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { getPrimaryImage } from '../../utils/image';

interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  category: string;
  tags: string[];
  currentAmount: number;
  targetAmount: number;
  backers: number;
  daysLeft: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  likes: number;
  views: number;
  isLiked: boolean;
  isBookmarked: boolean;
  engagementScore: number;
  comments?: Array<{
    id: string;
    user: {
      name: string;
      avatar: string;
      verified: boolean;
    };
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    replies?: Array<{
      id: string;
      user: {
        name: string;
        avatar: string;
        verified: boolean;
      };
      content: string;
      timestamp: string;
      likes: number;
      isLiked: boolean;
    }>;
  }>;
  upvotes?: number;
  downvotes?: number;
  rating?: number;
  userVote?: 'up' | 'down' | null;
  userRating?: number;
}

interface DiscoveryFeedProps {
  projects: Project[];
  onLike: (projectId: string) => void;
  onComment: (projectId: string) => void;
  onShare: (projectId: string) => void;
  onBookmark: (projectId: string) => void;
  onUpvote?: (projectId: string) => void;
  onDownvote?: (projectId: string) => void;
  onRate?: (projectId: string, rating: number) => void;
}

export const DiscoveryFeed: React.FC<DiscoveryFeedProps> = ({
  projects,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onUpvote,
  onDownvote,
  onRate
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'top' | 'recommended'>('trending');
  const [sortedProjects, setSortedProjects] = useState<Project[]>(projects);

  // Trending algorithm - combines recency, engagement, and growth rate
  const calculateTrendingScore = (project: Project) => {
    const now = new Date().getTime();
    const created = new Date(project.createdAt).getTime();
    const daysSinceCreated = (now - created) / (1000 * 60 * 60 * 24);
    
    // Recency factor (newer = higher score, diminishing after 7 days)
    const recencyFactor = Math.max(0, Math.exp(-daysSinceCreated / 7));
    
    // Engagement factor (likes, views, comments)
    const engagementFactor = (project.likes * 2 + project.views * 0.1 + (project.comments?.length || 0) * 5);
    
    // Funding velocity
    const fundingVelocity = project.currentAmount / Math.max(1, daysSinceCreated);
    
    // Community factor (backers)
    const communityFactor = Math.log(project.backers + 1);
    
    return (engagementFactor * recencyFactor) + (fundingVelocity * 0.1) + (communityFactor * 10);
  };

  // Recommendation algorithm - based on user preferences and similar projects
  const calculateRecommendationScore = (project: Project) => {
    // This would normally use user's interaction history
    // For demo, we'll use category preference and engagement
    const baseScore = project.engagementScore || 0;
    const categoryBonus = project.category === 'Technology' ? 50 : 0; // Simulated preference
    const authorBonus = project.author.verified ? 25 : 0;
    
    return baseScore + categoryBonus + authorBonus;
  };

  useEffect(() => {
    let sorted = [...projects];
    
    switch (activeTab) {
      case 'trending':
        sorted.sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a));
        break;
      case 'new':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'top':
        sorted.sort((a, b) => {
          const aRatio = a.currentAmount / a.targetAmount;
          const bRatio = b.currentAmount / b.targetAmount;
          return bRatio - aRatio;
        });
        break;
      case 'recommended':
        sorted.sort((a, b) => calculateRecommendationScore(b) - calculateRecommendationScore(a));
        break;
    }
    
    setSortedProjects(sorted);
  }, [activeTab, projects]);

  const tabs = [
    { id: 'trending', label: 'Trending', icon: FireIcon, color: 'text-orange-500' },
    { id: 'new', label: 'New', icon: ClockIcon, color: 'text-blue-500' },
    { id: 'top', label: 'Top Funded', icon: TrophyIcon, color: 'text-yellow-500' },
    { id: 'recommended', label: 'For You', icon: SparklesIcon, color: 'text-purple-500' }
  ];

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const created = new Date(dateString).getTime();
    const diffInHours = (now - created) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const handleProjectClick = (project: Project, action: 'like' | 'comment' | 'share' | 'bookmark' | 'upvote' | 'downvote') => {
    switch (action) {
      case 'like':
        onLike(project.id);
        break;
      case 'comment':
        onComment(project.id);
        break;
      case 'share':
        onShare(project.id);
        break;
      case 'bookmark':
        onBookmark(project.id);
        break;
      case 'upvote':
        onUpvote?.(project.id);
        break;
      case 'downvote':
        onDownvote?.(project.id);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Discovery Tabs */}
      <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : ''}`} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Algorithm Info */}
      <motion.div 
        className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={activeTab}
      >
        <div className="flex items-center space-x-3">
          {(() => {
            const activeTabData = tabs.find(tab => tab.id === activeTab);
            if (activeTabData) {
              const IconComponent = activeTabData.icon;
              return <IconComponent className={`w-5 h-5 ${activeTabData.color}`} />;
            }
            return null;
          })()}
          <div>
            <h3 className="text-white font-medium">
              {activeTab === 'trending' && 'Trending Algorithm'}
              {activeTab === 'new' && 'Latest Projects'}
              {activeTab === 'top' && 'Top Performing'}
              {activeTab === 'recommended' && 'Personalized Feed'}
            </h3>
            <p className="text-gray-400 text-sm">
              {activeTab === 'trending' && 'Based on engagement velocity, recency, and community growth'}
              {activeTab === 'new' && 'Freshly launched projects sorted by creation date'}
              {activeTab === 'top' && 'Projects with highest funding ratios and success metrics'}
              {activeTab === 'recommended' && 'Curated based on your interests and interaction history'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Projects Feed */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {sortedProjects.map((project, index) => (
            <motion.div
              key={`${activeTab}-${project.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={project.author.avatar}
                    alt={project.author.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-medium">{project.author.name}</h4>
                      {project.author.verified && (
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{formatTimeAgo(project.createdAt)}</p>
                  </div>
                </div>
                
                {/* Trending Score (for trending tab) */}
                {activeTab === 'trending' && (
                  <div className="text-right">
                    <div className="text-orange-500 text-sm font-medium">
                      🔥 {Math.round(calculateTrendingScore(project))}
                    </div>
                    <div className="text-gray-400 text-xs">trending score</div>
                  </div>
                )}
              </div>

              {/* Project Content */}
              <div className="mb-4">
                <h3 className="text-white text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-300 mb-3">{project.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs">
                    {project.category}
                  </span>
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/10 text-gray-300 rounded-lg text-xs">
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-gray-400 rounded-lg text-xs">
                      +{project.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Project Image */}
                {getPrimaryImage(project) && (
                  <div className="rounded-lg overflow-hidden mb-4">
                    <img
                      src={getPrimaryImage(project)}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Funding Progress */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">
                      ${project.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm">
                      of ${project.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">
                      <UserGroupIcon className="w-4 h-4 inline mr-1" />
                      {project.backers} backers
                    </span>
                    <span className="text-gray-300">
                      {project.daysLeft} days left
                    </span>
                  </div>
                </div>
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleProjectClick(project, 'like')}
                    className={`flex items-center space-x-2 transition-colors ${
                      project.isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <HeartIcon className={`w-5 h-5 ${project.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{project.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleProjectClick(project, 'comment')}
                    className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                    <span className="text-sm">{project.comments?.length || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleProjectClick(project, 'share')}
                    className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="text-sm">Share</span>
                  </button>

                  <div className="flex items-center space-x-2 text-gray-400">
                    <EyeIcon className="w-5 h-5" />
                    <span className="text-sm">{project.views}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleProjectClick(project, 'bookmark')}
                  className={`transition-colors ${
                    project.isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                  }`}
                >
                  <BookmarkIcon className={`w-5 h-5 ${project.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Additional Engagement Metrics */}
              {(project.upvotes !== undefined || project.rating !== undefined) && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  {project.upvotes !== undefined && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleProjectClick(project, 'upvote')}
                        className={`flex items-center space-x-1 transition-colors ${
                          project.userVote === 'up' ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{project.upvotes}</span>
                      </button>
                      
                      <button
                        onClick={() => handleProjectClick(project, 'downvote')}
                        className={`flex items-center space-x-1 transition-colors ${
                          project.userVote === 'down' ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{project.downvotes || 0}</span>
                      </button>
                    </div>
                  )}
                  
                  {project.rating !== undefined && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onRate?.(project.id, star)}
                            className={`text-sm transition-colors ${
                              star <= (project.userRating || 0) ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm">
                        {project.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};