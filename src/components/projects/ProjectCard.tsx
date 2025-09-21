import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import EngagementSystem from '../interactions/EngagementSystem';
import CommentsSystem from '../interactions/CommentsSystem';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  fundingRaised: number;
  deadline: string;
  teamSize: number;
  skillsNeeded: string[];
  createdBy: string;
  createdAt: string;
  status: 'active' | 'funded' | 'expired';
  supporters: string[];
  comments: number;
  likes: number;
  views: number;
  bookmarks: number;
  shares?: number;
  upvotes?: number;
  downvotes?: number;
  rating?: number;
  totalRatings?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  hasUpvoted?: boolean;
  hasDownvoted?: boolean;
  hasRated?: boolean;
  userRating?: number;
  creator: {
    id: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  images?: string[];
  blockchainRecord?: any;
}

interface ProjectCardProps {
  project: Project;
  onLike?: (projectId: string) => void;
  onComment?: (projectId: string) => void;
  onShare?: (projectId: string) => void;
  onBookmark?: (projectId: string) => void;
  onUpvote?: (projectId: string) => void;
  onDownvote?: (projectId: string) => void;
  onRate?: (projectId: string, rating: number) => void;
  onClick?: (projectId: string) => void;
  showMatchScore?: boolean;
  showTrendingScore?: boolean;
  showDetailedEngagement?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onUpvote,
  onDownvote,
  onRate,
  onClick,
  showMatchScore = false,
  showTrendingScore = false,
  showDetailedEngagement = false
}) => {
  const [showComments, setShowComments] = useState(false);
  const fundingPercentage = (project.fundingRaised / project.fundingGoal) * 100;
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getStatusColor = () => {
    switch (project.status) {
      case 'active':
        return 'text-green-400';
      case 'funded':
        return 'text-blue-400';
      case 'expired':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'active':
        return `${daysLeft} days left`;
      case 'funded':
        return 'Fully Funded';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(project.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={handleCardClick}
      className="bg-secondary-800/80 backdrop-blur-xl rounded-2xl border border-secondary-700/50 overflow-hidden cursor-pointer group hover:border-primary-500/30 transition-all duration-300"
    >
      {/* Project Image */}
      {project.images && project.images.length > 0 ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium glass-light ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Blockchain Badge */}
          {project.blockchainRecord && (
            <div className="absolute top-4 left-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-2 py-1 rounded-full glass-light text-xs text-primary-300"
              >
                <CheckBadgeIcon className="w-3 h-3" />
                <span>Verified</span>
              </motion.div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-primary-500/20 to-accent-pink/20 flex items-center justify-center">
          <div className="text-center">
            <TagIcon className="w-12 h-12 text-primary-400 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No image available</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={project.creator.avatar || '/default-avatar.png'}
                alt={project.creator.username}
                className="w-6 h-6 rounded-full"
              />
              <span className="text-sm text-gray-400">{project.creator.username}</span>
              {project.creator.verified && (
                <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors duration-200 line-clamp-2">
              {project.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Category */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500/20 text-primary-300 border border-primary-500/30">
            <TagIcon className="w-3 h-3 mr-1" />
            {project.category}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded-md"
            >
              {tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="px-2 py-1 text-xs bg-secondary-700 text-gray-300 rounded-md">
              +{project.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Funding Progress</span>
            <span className="text-sm font-medium text-white">
              {fundingPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-2 bg-gradient-to-r from-primary-500 to-accent-pink rounded-full"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400 flex items-center">
              <CurrencyDollarIcon className="w-3 h-3 mr-1" />
              ${project.fundingRaised.toLocaleString()} raised
            </span>
            <span className="text-xs text-gray-400">
              Goal: ${project.fundingGoal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-lg font-bold text-white">{project.supporters.length}</div>
            <div className="text-xs text-gray-400">Supporters</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{project.teamSize}</div>
            <div className="text-xs text-gray-400">Team Size</div>
          </div>
          <div>
            <div className="text-lg font-bold text-white">{daysLeft > 0 ? daysLeft : 0}</div>
            <div className="text-xs text-gray-400">Days Left</div>
          </div>
        </div>

        {/* Skills Needed */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">Skills Needed:</div>
          <div className="flex flex-wrap gap-1">
            {project.skillsNeeded.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-accent-purple/20 text-accent-purple border border-accent-purple/30 rounded-md"
              >
                {skill}
              </span>
            ))}
            {project.skillsNeeded.length > 3 && (
              <span className="px-2 py-1 text-xs bg-accent-purple/20 text-accent-purple border border-accent-purple/30 rounded-md">
                +{project.skillsNeeded.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Scores */}
        {(showMatchScore || showTrendingScore) && (
          <div className="mb-4 flex gap-2">
            {showMatchScore && (project as any).matchScore && (
              <div className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs flex items-center space-x-1">
                <span>✨</span>
                <span>{(project as any).matchScore}% match</span>
              </div>
            )}
            {showTrendingScore && (project as any).trendingScore && (
              <div className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs flex items-center space-x-1">
                <span>🔥</span>
                <span>{Math.round((project as any).trendingScore)} trend</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Engagement System */}
        <div className="pt-4 border-t border-secondary-700/50">
          <EngagementSystem
            targetId={project.id}
            targetType="project"
            stats={{
              upvotes: project.upvotes || project.likes,
              downvotes: project.downvotes || 0,
              hearts: project.likes,
              bookmarks: project.bookmarks,
              views: project.views,
              comments: project.comments,
              shares: project.shares || 0,
              rating: project.rating || 0,
              totalRatings: project.totalRatings || 0
            }}
            userEngagement={{
              hasUpvoted: project.hasUpvoted || false,
              hasDownvoted: project.hasDownvoted || false,
              hasHearted: project.isLiked || false,
              hasBookmarked: project.isBookmarked || false,
              hasRated: project.hasRated || false,
              userRating: project.userRating || 0
            }}
            onUpvote={() => onUpvote?.(project.id)}
            onDownvote={() => onDownvote?.(project.id)}
            onHeart={() => onLike?.(project.id)}
            onBookmark={() => onBookmark?.(project.id)}
            onShare={() => onShare?.(project.id)}
            onComment={() => setShowComments(true)}
            onRate={(rating) => onRate?.(project.id, rating)}
            compact={true}
            orientation="horizontal"
          />

          {/* Project Creation Date */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <CalendarIcon className="w-3 h-3" />
              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            
            {/* Creator Badge */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-secondary-400">by</span>
              <span className="text-xs font-medium text-primary-400">
                @{project.creator.username}
              </span>
              {project.creator.verified && (
                <CheckBadgeIcon className="w-3 h-3 text-primary-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentsSystem
        projectId={project.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </motion.div>
  );
};

export default ProjectCard;