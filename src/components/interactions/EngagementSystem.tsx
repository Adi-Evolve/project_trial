import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid,
  ArrowDownIcon as ArrowDownSolid,
  HeartIcon as HeartSolid,
  BookmarkIcon as BookmarkSolid,
  StarIcon as StarSolid
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface EngagementStats {
  upvotes: number;
  downvotes: number;
  hearts: number;
  bookmarks: number;
  views: number;
  comments: number;
  shares: number;
  rating: number;
  totalRatings: number;
}

interface UserEngagement {
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  hasHearted: boolean;
  hasBookmarked: boolean;
  hasRated: boolean;
  userRating: number;
}

interface EngagementSystemProps {
  targetId: string;
  targetType: 'project' | 'idea' | 'comment';
  stats: EngagementStats;
  userEngagement: UserEngagement;
  onUpvote: () => void;
  onDownvote: () => void;
  onHeart: () => void;
  onBookmark: () => void;
  onShare: () => void;
  onComment: () => void;
  onRate: (rating: number) => void;
  showDetailed?: boolean;
  compact?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

const EngagementSystem: React.FC<EngagementSystemProps> = ({
  targetId,
  targetType,
  stats,
  userEngagement,
  onUpvote,
  onDownvote,
  onHeart,
  onBookmark,
  onShare,
  onComment,
  onRate,
  showDetailed = false,
  compact = false,
  orientation = 'horizontal'
}) => {
  const { isAuthenticated } = useAuth();
  const [showRating, setShowRating] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to interact with content');
      return;
    }
    action();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const engagementScore = stats.upvotes * 2 + stats.hearts + stats.bookmarks * 0.5 + stats.comments * 3;
  const netScore = stats.upvotes - stats.downvotes;

  const EngagementButton: React.FC<{
    icon: React.ElementType;
    iconSolid: React.ElementType;
    isActive: boolean;
    count: number;
    onClick: () => void;
    color: string;
    label: string;
    showCount?: boolean;
  }> = ({ icon: Icon, iconSolid: IconSolid, isActive, count, onClick, color, label, showCount = true }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => requireAuth(onClick)}
      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-200 ${
        isActive 
          ? `${color} shadow-sm` 
          : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
      } ${compact ? 'text-xs' : 'text-sm'}`}
      title={label}
    >
      {isActive ? (
        <IconSolid className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      ) : (
        <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
      )}
      {showCount && <span className="font-medium">{formatNumber(count)}</span>}
    </motion.button>
  );

  const RatingStars: React.FC = () => (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowRating(!showRating)}
        className="flex items-center space-x-1 text-secondary-400 hover:text-yellow-400 transition-colors"
      >
        <StarIcon className="w-4 h-4" />
        <span className="text-sm">
          {stats.rating > 0 ? stats.rating.toFixed(1) : 'Rate'}
        </span>
        {stats.totalRatings > 0 && (
          <span className="text-xs text-secondary-500">({stats.totalRatings})</span>
        )}
      </motion.button>

      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute bottom-full left-0 mb-2 p-3 glass rounded-lg border border-secondary-700/50 shadow-xl z-10"
          >
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => {
                    requireAuth(() => {
                      onRate(star);
                      setShowRating(false);
                    });
                  }}
                  className={`transition-colors ${
                    (hoveredStar || userEngagement.userRating) >= star
                      ? 'text-yellow-400'
                      : 'text-secondary-600'
                  }`}
                >
                  {((hoveredStar || userEngagement.userRating) >= star) ? (
                    <StarSolid className="w-5 h-5" />
                  ) : (
                    <StarIcon className="w-5 h-5" />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="text-xs text-secondary-400 text-center">
              Rate this {targetType}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (compact) {
    return (
      <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-1' : 'items-center space-x-2'}`}>
        <EngagementButton
          icon={ArrowUpIcon}
          iconSolid={ArrowUpSolid}
          isActive={userEngagement.hasUpvoted}
          count={netScore}
          onClick={onUpvote}
          color="text-green-400"
          label="Upvote"
        />
        <EngagementButton
          icon={HeartIcon}
          iconSolid={HeartSolid}
          isActive={userEngagement.hasHearted}
          count={stats.hearts}
          onClick={onHeart}
          color="text-red-400"
          label="Like"
        />
        <EngagementButton
          icon={ChatBubbleLeftIcon}
          iconSolid={ChatBubbleLeftIcon}
          isActive={false}
          count={stats.comments}
          onClick={onComment}
          color="text-blue-400"
          label="Comments"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Engagement Actions */}
      <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'items-center justify-between'}`}>
        <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
          {/* Voting */}
          <div className="flex items-center space-x-1">
            <EngagementButton
              icon={ArrowUpIcon}
              iconSolid={ArrowUpSolid}
              isActive={userEngagement.hasUpvoted}
              count={stats.upvotes}
              onClick={onUpvote}
              color="text-green-400"
              label="Upvote"
            />
            <EngagementButton
              icon={ArrowDownIcon}
              iconSolid={ArrowDownSolid}
              isActive={userEngagement.hasDownvoted}
              count={stats.downvotes}
              onClick={onDownvote}
              color="text-red-400"
              label="Downvote"
            />
            <div className={`px-2 py-1 rounded text-sm font-bold ${
              netScore > 0 ? 'text-green-400' : netScore < 0 ? 'text-red-400' : 'text-secondary-400'
            }`}>
              {netScore > 0 ? '+' : ''}{netScore}
            </div>
          </div>

          {/* Hearts */}
          <EngagementButton
            icon={HeartIcon}
            iconSolid={HeartSolid}
            isActive={userEngagement.hasHearted}
            count={stats.hearts}
            onClick={onHeart}
            color="text-red-400"
            label="Like"
          />

          {/* Comments */}
          <EngagementButton
            icon={ChatBubbleLeftIcon}
            iconSolid={ChatBubbleLeftIcon}
            isActive={false}
            count={stats.comments}
            onClick={onComment}
            color="text-blue-400"
            label="Comments"
          />

          {/* Rating */}
          {targetType === 'project' && <RatingStars />}
        </div>

        <div className={`flex ${orientation === 'vertical' ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
          {/* Bookmark */}
          <EngagementButton
            icon={BookmarkIcon}
            iconSolid={BookmarkSolid}
            isActive={userEngagement.hasBookmarked}
            count={stats.bookmarks}
            onClick={onBookmark}
            color="text-yellow-400"
            label="Bookmark"
          />

          {/* Share */}
          <EngagementButton
            icon={ShareIcon}
            iconSolid={ShareIcon}
            isActive={false}
            count={stats.shares}
            onClick={onShare}
            color="text-purple-400"
            label="Share"
          />
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetailed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-secondary-700/50"
        >
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <EyeIcon className="w-4 h-4 text-secondary-400 mr-1" />
              <span className="text-lg font-bold text-white">{formatNumber(stats.views)}</span>
            </div>
            <div className="text-xs text-secondary-400">Views</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrophyIcon className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-lg font-bold text-white">{Math.round(engagementScore)}</span>
            </div>
            <div className="text-xs text-secondary-400">Score</div>
          </div>

          {targetType === 'project' && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-lg font-bold text-white">
                  {stats.rating > 0 ? stats.rating.toFixed(1) : '—'}
                </span>
              </div>
              <div className="text-xs text-secondary-400">Rating</div>
            </div>
          )}

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <HeartIcon className="w-4 h-4 text-red-400 mr-1" />
              <span className="text-lg font-bold text-white">
                {Math.round(((stats.hearts + stats.upvotes) / (stats.views || 1)) * 100)}%
              </span>
            </div>
            <div className="text-xs text-secondary-400">Engagement</div>
          </div>
        </motion.div>
      )}

      {/* Engagement Insights */}
      {showDetailed && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-light rounded-lg p-3"
        >
          <div className="text-sm text-secondary-300 mb-2">Your Impact</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-secondary-400">Actions:</span>
              <span className="text-white ml-1">
                {Object.values(userEngagement).filter(Boolean).length}/7
              </span>
            </div>
            <div>
              <span className="text-secondary-400">Influence:</span>
              <span className="text-primary-400 ml-1">
                +{(Object.values(userEngagement).filter(Boolean).length * 10)} XP
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default EngagementSystem;