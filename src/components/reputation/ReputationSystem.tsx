import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StarIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ChatBubbleLeftIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
  FlagIcon,
  EyeIcon,
  PencilIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BoltIcon,
  HeartIcon,
  AcademicCapIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolid,
  HandThumbUpIcon as ThumbUpSolid,
  HandThumbDownIcon as ThumbDownSolid,
  HeartIcon as HeartSolid,
  ShieldCheckIcon as ShieldSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface SkillEndorsement {
  id: string;
  skillName: string;
  endorsedBy: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  endorsedAt: Date;
  relationship: 'colleague' | 'client' | 'mentor' | 'collaborator' | 'student';
  comment?: string;
  strength: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  projectContext?: string;
}

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerTitle: string;
  reviewerVerified: boolean;
  targetUserId: string;
  projectId?: string;
  projectTitle?: string;
  rating: number; // 1-5 stars
  comment: string;
  pros: string[];
  cons: string[];
  categories: {
    technical: number;
    communication: number;
    reliability: number;
    creativity: number;
    leadership: number;
  };
  createdAt: Date;
  isPublic: boolean;
  isVerified: boolean;
  helpfulVotes: number;
  userVotedHelpful?: boolean;
  responseFromUser?: {
    comment: string;
    createdAt: Date;
  };
  relationship: 'client' | 'colleague' | 'manager' | 'subordinate' | 'peer';
  projectDuration?: string;
  wouldWorkAgain: boolean;
}

interface ReputationScore {
  overall: number;
  technical: number;
  communication: number;
  reliability: number;
  creativity: number;
  leadership: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  percentile: number;
  totalReviews: number;
  endorsements: number;
  verifiedReviews: number;
  averageRating: number;
}

interface TrustIndicator {
  id: string;
  type: 'github_verified' | 'linkedin_verified' | 'email_verified' | 'phone_verified' | 'identity_verified' | 'portfolio_verified';
  verifiedAt: Date;
  status: 'verified' | 'pending' | 'failed';
  score: number;
}

interface ReputationSystemProps {
  userId: string;
  targetUserId?: string;
  showWriteReview?: boolean;
  showEndorseSkills?: boolean;
  compact?: boolean;
}

const ReputationSystem: React.FC<ReputationSystemProps> = ({
  userId,
  targetUserId,
  showWriteReview = true,
  showEndorseSkills = true,
  compact = false
}) => {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reputationScore, setReputationScore] = useState<ReputationScore | null>(null);
  const [trustIndicators, setTrustIndicators] = useState<TrustIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'endorsements' | 'trust'>('overview');
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [showEndorseModal, setShowEndorseModal] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    pros: [''],
    cons: [''],
    categories: {
      technical: 5,
      communication: 5,
      reliability: 5,
      creativity: 5,
      leadership: 5
    },
    isPublic: true,
    relationship: 'peer' as const,
    wouldWorkAgain: true,
    projectId: ''
  });
  const [newEndorsement, setNewEndorsement] = useState({
    skillName: '',
    comment: '',
    strength: 5 as const,
    relationship: 'colleague' as const,
    projectContext: ''
  });

  // Mock data
  const mockEndorsements: SkillEndorsement[] = [
    {
      id: '1',
      skillName: 'React',
      endorsedBy: {
        id: 'user1',
        name: 'Sarah Chen',
        avatar: '/api/placeholder/50/50',
        title: 'Senior Frontend Developer',
        verified: true
      },
      endorsedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      relationship: 'colleague',
      comment: 'Exceptional React skills demonstrated in our e-commerce project. Clean, maintainable code.',
      strength: 5,
      projectContext: 'E-commerce Platform Redesign'
    },
    {
      id: '2',
      skillName: 'TypeScript',
      endorsedBy: {
        id: 'user2',
        name: 'Michael Rodriguez',
        avatar: '/api/placeholder/50/50',
        title: 'Tech Lead',
        verified: true
      },
      endorsedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      relationship: 'mentor',
      comment: 'Strong TypeScript knowledge and excellent type safety practices.',
      strength: 4,
      projectContext: 'Internal Tools Development'
    },
    {
      id: '3',
      skillName: 'Project Management',
      endorsedBy: {
        id: 'user3',
        name: 'Emily Johnson',
        avatar: '/api/placeholder/50/50',
        title: 'Product Manager',
        verified: false
      },
      endorsedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      relationship: 'client',
      comment: 'Great coordination skills and timeline management.',
      strength: 4
    }
  ];

  const mockReviews: Review[] = [
    {
      id: '1',
      reviewerId: 'user1',
      reviewerName: 'Alex Rivera',
      reviewerAvatar: '/api/placeholder/50/50',
      reviewerTitle: 'CTO',
      reviewerVerified: true,
      targetUserId: targetUserId || 'current-user',
      projectId: 'proj1',
      projectTitle: 'Mobile Banking App',
      rating: 5,
      comment: 'Outstanding developer with exceptional problem-solving skills. Delivered high-quality code on time and exceeded expectations. Great communicator and team player.',
      pros: ['Excellent technical skills', 'Great communication', 'Reliable delivery', 'Innovative solutions'],
      cons: ['Could improve documentation'],
      categories: {
        technical: 5,
        communication: 5,
        reliability: 5,
        creativity: 4,
        leadership: 4
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      isPublic: true,
      isVerified: true,
      helpfulVotes: 12,
      userVotedHelpful: false,
      relationship: 'client',
      projectDuration: '6 months',
      wouldWorkAgain: true
    },
    {
      id: '2',
      reviewerId: 'user2',
      reviewerName: 'Lisa Park',
      reviewerAvatar: '/api/placeholder/50/50',
      reviewerTitle: 'Senior Developer',
      reviewerVerified: true,
      targetUserId: targetUserId || 'current-user',
      projectId: 'proj2',
      projectTitle: 'AI Analytics Dashboard',
      rating: 4,
      comment: 'Solid technical abilities and good collaboration. Helped mentor junior developers and contributed to architecture decisions.',
      pros: ['Strong mentoring', 'Good architecture sense', 'Collaborative approach'],
      cons: ['Sometimes perfectionist', 'Could be faster with MVPs'],
      categories: {
        technical: 4,
        communication: 4,
        reliability: 5,
        creativity: 4,
        leadership: 5
      },
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      isPublic: true,
      isVerified: true,
      helpfulVotes: 8,
      userVotedHelpful: true,
      relationship: 'colleague',
      projectDuration: '4 months',
      wouldWorkAgain: true,
      responseFromUser: {
        comment: 'Thank you for the feedback! I\'ll work on being more agile with MVP development.',
        createdAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000)
      }
    }
  ];

  const mockReputationScore: ReputationScore = {
    overall: 4.6,
    technical: 4.8,
    communication: 4.5,
    reliability: 4.9,
    creativity: 4.3,
    leadership: 4.4,
    trend: 'up',
    change: 0.2,
    percentile: 89,
    totalReviews: 23,
    endorsements: 47,
    verifiedReviews: 18,
    averageRating: 4.6
  };

  const mockTrustIndicators: TrustIndicator[] = [
    {
      id: '1',
      type: 'github_verified',
      verifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      status: 'verified',
      score: 25
    },
    {
      id: '2',
      type: 'linkedin_verified',
      verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'verified',
      score: 20
    },
    {
      id: '3',
      type: 'email_verified',
      verifiedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      status: 'verified',
      score: 15
    },
    {
      id: '4',
      type: 'identity_verified',
      verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      status: 'verified',
      score: 30
    },
    {
      id: '5',
      type: 'portfolio_verified',
      verifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      status: 'verified',
      score: 10
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEndorsements(mockEndorsements);
      setReviews(mockReviews);
      setReputationScore(mockReputationScore);
      setTrustIndicators(mockTrustIndicators);
      setLoading(false);
    }, 1000);
  }, [targetUserId]);

  const getTrustScore = () => {
    return trustIndicators.reduce((sum, indicator) => 
      indicator.status === 'verified' ? sum + indicator.score : sum, 0
    );
  };

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Elite', color: 'text-purple-400' };
    if (score >= 70) return { level: 'High', color: 'text-green-400' };
    if (score >= 50) return { level: 'Medium', color: 'text-yellow-400' };
    if (score >= 30) return { level: 'Basic', color: 'text-orange-400' };
    return { level: 'New', color: 'text-gray-400' };
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-400';
    if (score >= 4.0) return 'text-blue-400';
    if (score >= 3.5) return 'text-yellow-400';
    if (score >= 3.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <StarSolid
            key={i}
            className={`${size} ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
          />
        ))}
        <span className="text-sm text-gray-300 ml-2">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleVoteHelpful = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            userVotedHelpful: !review.userVotedHelpful,
            helpfulVotes: review.userVotedHelpful ? review.helpfulVotes - 1 : review.helpfulVotes + 1
          }
        : review
    ));
    toast.success('Thank you for your feedback!');
  };

  const submitReview = () => {
    // In a real app, this would make an API call
    toast.success('Review submitted successfully!');
    setShowWriteReviewModal(false);
    // Reset form
    setNewReview({
      rating: 5,
      comment: '',
      pros: [''],
      cons: [''],
      categories: {
        technical: 5,
        communication: 5,
        reliability: 5,
        creativity: 5,
        leadership: 5
      },
      isPublic: true,
      relationship: 'peer',
      wouldWorkAgain: true,
      projectId: ''
    });
  };

  const submitEndorsement = () => {
    // In a real app, this would make an API call
    toast.success('Skill endorsed successfully!');
    setShowEndorseModal(false);
    // Reset form
    setNewEndorsement({
      skillName: '',
      comment: '',
      strength: 5,
      relationship: 'colleague',
      projectContext: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="text-gray-400">Loading reputation data...</span>
        </div>
      </div>
    );
  }

  if (!reputationScore) return null;

  const trustScore = getTrustScore();
  const trustLevel = getTrustLevel(trustScore);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <ShieldSolid className="w-8 h-8 text-blue-400" />
            <span>Reputation System</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Professional reviews and skill endorsements
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {showEndorseSkills && (
            <button
              onClick={() => setShowEndorseModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <HandThumbUpIcon className="w-4 h-4" />
              <span>Endorse Skills</span>
            </button>
          )}
          
          {showWriteReview && (
            <button
              onClick={() => setShowWriteReviewModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              <span>Write Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Reputation Overview */}
      <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-green-600/20 rounded-2xl p-6 border border-blue-500/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {reputationScore.overall.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mb-2">
              {renderStars(reputationScore.overall, 'w-6 h-6')}
            </div>
            <div className="text-sm text-gray-400">Overall Rating</div>
            <div className={`text-sm font-medium ${reputationScore.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {reputationScore.trend === 'up' ? '+' : '-'}{reputationScore.change.toFixed(1)} this month
            </div>
          </div>

          {/* Trust Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {trustScore}%
            </div>
            <div className={`text-lg font-semibold ${trustLevel.color} mb-2`}>
              {trustLevel.level} Trust
            </div>
            <div className="text-sm text-gray-400">Verification Score</div>
            <div className="text-sm text-gray-400">
              Top {100 - reputationScore.percentile}% of users
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Reviews:</span>
              <span className="text-white">{reputationScore.totalReviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Endorsements:</span>
              <span className="text-white">{reputationScore.endorsements}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Verified:</span>
              <span className="text-white">{reputationScore.verifiedReviews}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Would hire again:</span>
              <span className="text-green-400">94%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skill Breakdown */}
      <div className="bg-secondary-800/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Skill Ratings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(reputationScore).filter(([key]) => 
            ['technical', 'communication', 'reliability', 'creativity', 'leadership'].includes(key)
          ).map(([skill, score]) => (
            <div key={skill} className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(score as number)} mb-1`}>
                {(score as number).toFixed(1)}
              </div>
              <div className="text-sm text-gray-300 capitalize">{skill}</div>
              <div className="w-full bg-secondary-700 rounded-full h-2 mt-2">
                <div
                  className="h-2 bg-gradient-to-r from-primary-500 to-blue-400 rounded-full"
                  style={{ width: `${((score as number) / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary-800 rounded-lg p-1">
        {[
          { key: 'reviews', label: 'Reviews', count: reviews.length },
          { key: 'endorsements', label: 'Endorsements', count: endorsements.length },
          { key: 'trust', label: 'Trust & Verification', count: trustIndicators.filter(t => t.status === 'verified').length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-2 py-1 bg-secondary-600 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'reviews' && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {reviews.map((review) => (
              <div key={review.id} className="bg-secondary-800/80 rounded-xl p-6 border border-secondary-700/50">
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={review.reviewerAvatar}
                      alt={review.reviewerName}
                      className="w-12 h-12 rounded-full border-2 border-primary-500/30"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-white">{review.reviewerName}</h4>
                        {review.reviewerVerified && (
                          <CheckBadgeIcon className="w-5 h-5 text-blue-400" />
                        )}
                        {review.isVerified && (
                          <ShieldSolid className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{review.reviewerTitle}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {review.relationship} • {review.projectDuration}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {renderStars(review.rating)}
                    <div className="text-xs text-gray-400 mt-1">
                      {review.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Project Context */}
                {review.projectTitle && (
                  <div className="mb-4 p-3 bg-secondary-700/50 rounded-lg">
                    <div className="text-sm text-primary-300">Project: {review.projectTitle}</div>
                  </div>
                )}

                {/* Review Content */}
                <div className="mb-4">
                  <p className="text-gray-300">{review.comment}</p>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="text-sm font-medium text-green-400 mb-2">Strengths</h5>
                    <ul className="space-y-1">
                      {review.pros.map((pro, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                          <HandThumbUpIcon className="w-3 h-3 text-green-400" />
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-yellow-400 mb-2">Areas for Growth</h5>
                    <ul className="space-y-1">
                      {review.cons.map((con, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-center space-x-2">
                          <ExclamationTriangleIcon className="w-3 h-3 text-yellow-400" />
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Category Ratings */}
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-300 mb-3">Detailed Ratings</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(review.categories).map(([category, score]) => (
                      <div key={category} className="text-center">
                        <div className="text-sm font-medium text-white">{score.toFixed(1)}</div>
                        <div className="text-xs text-gray-400 capitalize">{category}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Response */}
                {review.responseFromUser && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Response from user</span>
                    </div>
                    <p className="text-sm text-gray-300">{review.responseFromUser.comment}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {review.responseFromUser.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-secondary-700/50">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVoteHelpful(review.id)}
                      className={`flex items-center space-x-2 text-sm transition-colors ${
                        review.userVotedHelpful 
                          ? 'text-green-400' 
                          : 'text-gray-400 hover:text-green-400'
                      }`}
                    >
                      <ThumbUpSolid className="w-4 h-4" />
                      <span>Helpful ({review.helpfulVotes})</span>
                    </button>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <EyeIcon className="w-4 h-4" />
                      <span>{review.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {review.wouldWorkAgain ? (
                      <div className="flex items-center space-x-1 text-green-400 text-sm">
                        <HeartSolid className="w-4 h-4" />
                        <span>Would work again</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                        <XMarkIcon className="w-4 h-4" />
                        <span>One-time collaboration</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'endorsements' && (
          <motion.div
            key="endorsements"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {endorsements.map((endorsement) => (
              <div key={endorsement.id} className="bg-secondary-800/80 rounded-xl p-6 border border-secondary-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white text-lg">{endorsement.skillName}</h4>
                    <div className="flex items-center space-x-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <StarSolid
                          key={i}
                          className={`w-4 h-4 ${
                            i < endorsement.strength ? 'text-yellow-400' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={endorsement.endorsedBy.avatar}
                    alt={endorsement.endorsedBy.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{endorsement.endorsedBy.name}</span>
                      {endorsement.endorsedBy.verified && (
                        <CheckBadgeIcon className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{endorsement.endorsedBy.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{endorsement.relationship}</p>
                  </div>
                </div>

                {endorsement.comment && (
                  <p className="text-gray-300 text-sm mb-3">"{endorsement.comment}"</p>
                )}

                {endorsement.projectContext && (
                  <div className="mb-3 p-2 bg-secondary-700/50 rounded text-sm text-gray-400">
                    Project: {endorsement.projectContext}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {endorsement.endorsedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'trust' && (
          <motion.div
            key="trust"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Trust Score Overview */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trust Score Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trustIndicators.map((indicator) => {
                  const getIndicatorInfo = (type: string) => {
                    switch (type) {
                      case 'github_verified':
                        return { icon: CodeBracketIcon, label: 'GitHub Verified', color: 'text-green-400' };
                      case 'linkedin_verified':
                        return { icon: UserCircleIcon, label: 'LinkedIn Verified', color: 'text-blue-400' };
                      case 'email_verified':
                        return { icon: CheckBadgeIcon, label: 'Email Verified', color: 'text-cyan-400' };
                      case 'phone_verified':
                        return { icon: CheckBadgeIcon, label: 'Phone Verified', color: 'text-purple-400' };
                      case 'identity_verified':
                        return { icon: ShieldSolid, label: 'Identity Verified', color: 'text-yellow-400' };
                      case 'portfolio_verified':
                        return { icon: TrophyIcon, label: 'Portfolio Verified', color: 'text-orange-400' };
                      default:
                        return { icon: CheckBadgeIcon, label: 'Unknown', color: 'text-gray-400' };
                    }
                  };

                  const info = getIndicatorInfo(indicator.type);
                  const Icon = info.icon;

                  return (
                    <div key={indicator.id} className="flex items-center space-x-3 p-4 bg-secondary-700/50 rounded-lg">
                      <Icon className={`w-6 h-6 ${info.color}`} />
                      <div>
                        <div className="font-medium text-white">{info.label}</div>
                        <div className="text-sm text-gray-400">
                          +{indicator.score} trust points
                        </div>
                        <div className="text-xs text-gray-500">
                          Verified {indicator.verifiedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Benefits */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trust Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Higher visibility in search results</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Premium project recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300">Access to verified-only collaborations</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Priority customer support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Enhanced profile features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-gray-300">Trust badge on profile</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReputationSystem;