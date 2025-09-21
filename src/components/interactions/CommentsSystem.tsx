import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftIcon,
  HeartIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  FlagIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
    verified: boolean;
  };
  parentId?: string;
  replies: Comment[];
  likes: number;
  isLiked: boolean;
  edited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentsSystemProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CommentsSystem: React.FC<CommentsSystemProps> = ({
  projectId,
  isOpen,
  onClose
}) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  // Mock comments data
  const mockComments: Comment[] = [
    {
      id: '1',
      content: 'This is an amazing project! I\'d love to contribute with my React and TypeScript expertise. When do you plan to start development?',
      author: {
        id: 'user1',
        username: 'react_dev_pro',
        fullName: 'Sarah Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        verified: true
      },
      replies: [
        {
          id: '2',
          content: 'Thanks Sarah! We\'re planning to start next week. Would you be interested in joining our development team?',
          author: {
            id: 'project_owner',
            username: 'project_creator',
            fullName: 'Alex Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            verified: true
          },
          parentId: '1',
          replies: [],
          likes: 8,
          isLiked: false,
          edited: false,
          createdAt: '2025-09-14T10:30:00Z',
          updatedAt: '2025-09-14T10:30:00Z'
        }
      ],
      likes: 24,
      isLiked: true,
      edited: false,
      createdAt: '2025-09-14T09:15:00Z',
      updatedAt: '2025-09-14T09:15:00Z'
    },
    {
      id: '3',
      content: 'Great concept! I have experience with AI/ML models. Have you considered using transformer architectures for the symptom analysis?',
      author: {
        id: 'user2',
        username: 'ai_researcher',
        fullName: 'Dr. Michael Kumar',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        verified: true
      },
      parentId: undefined,
      replies: [],
      likes: 15,
      isLiked: false,
      edited: false,
      createdAt: '2025-09-14T11:45:00Z',
      updatedAt: '2025-09-14T11:45:00Z'
    },
    {
      id: '4',
      content: 'This could really make a difference in healthcare accessibility. Count me in for UI/UX design!',
      author: {
        id: 'user3',
        username: 'design_ninja',
        fullName: 'Emma Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
        verified: false
      },
      parentId: undefined,
      replies: [],
      likes: 12,
      isLiked: false,
      edited: false,
      createdAt: '2025-09-14T12:20:00Z',
      updatedAt: '2025-09-14T12:20:00Z'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, projectId]);

  const loadComments = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setComments(mockComments);
      setLoading(false);
    }, 500);
  };

  const sortComments = (comments: Comment[]): Comment[] => {
    const sorted = [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    // Sort replies recursively
    return sorted.map(comment => ({
      ...comment,
      replies: sortComments(comment.replies)
    }));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim() || !isAuthenticated) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: {
        id: user!.walletAddress || user!.id || '',
        username: user!.walletAddress?.slice(0, 8) + '...' || user!.username || '',
        fullName: user!.name || user!.fullName || '',
        avatar: user!.avatarUrl,
        verified: user!.isVerified
      },
      replies: [],
      likes: 0,
      isLiked: false,
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast.success('Comment posted!');
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    const reply: Comment = {
      id: Date.now().toString(),
      content: replyContent,
      author: {
        id: user!.walletAddress || user!.id || '',
        username: user!.walletAddress?.slice(0, 8) + '...' || user!.username || '',
        fullName: user!.name || user!.fullName || '',
        avatar: user!.avatarUrl,
        verified: user!.isVerified
      },
      parentId,
      replies: [],
      likes: 0,
      isLiked: false,
      edited: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments(prev => prev.map(comment => 
      comment.id === parentId
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ));

    setReplyingTo(null);
    setReplyContent('');
    toast.success('Reply posted!');
  };

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like comments');
      return;
    }

    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : comment
      ));
    }
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? {
            ...comment,
            content: newContent,
            edited: true,
            updatedAt: new Date().toISOString()
          }
        : comment
    ));
    setEditingComment(null);
    setEditContent('');
    toast.success('Comment updated!');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    toast.success('Comment deleted!');
  };

  const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return commentDate.toLocaleDateString();
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean; parentId?: string }> = ({ 
    comment, 
    isReply = false, 
    parentId 
  }) => {
    const [showActions, setShowActions] = useState(false);
    const isOwner = user?.id === comment.author.id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-8 border-l-2 border-secondary-700 pl-4' : ''}`}
      >
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {comment.author.fullName[0]}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-white text-sm">
                {comment.author.fullName}
              </span>
              <span className="text-secondary-400 text-sm">
                @{comment.author.username}
              </span>
              {comment.author.verified && (
                <span className="text-primary-400 text-xs">✓</span>
              )}
              <span className="text-secondary-500 text-xs">
                {formatRelativeTime(comment.createdAt)}
              </span>
              {comment.edited && (
                <span className="text-secondary-500 text-xs">(edited)</span>
              )}
            </div>

            {/* Content */}
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditComment(comment.id, editContent)}
                    className="px-3 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-secondary-600 text-secondary-300 rounded text-xs hover:bg-secondary-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-secondary-200 text-sm mb-2">{comment.content}</p>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleLikeComment(comment.id, isReply, parentId)}
                className={`flex items-center space-x-1 text-xs transition-colors ${
                  comment.isLiked ? 'text-red-400' : 'text-secondary-400 hover:text-red-400'
                }`}
              >
                {comment.isLiked ? (
                  <HeartSolidIcon className="w-3 h-3" />
                ) : (
                  <HeartIcon className="w-3 h-3" />
                )}
                <span>{comment.likes}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-secondary-400 hover:text-white transition-colors"
                >
                  Reply
                </button>
              )}

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="text-secondary-400 hover:text-white transition-colors"
                  >
                    <EllipsisHorizontalIcon className="w-3 h-3" />
                  </button>

                  {showActions && (
                    <div className="absolute top-full left-0 mt-1 bg-secondary-800 border border-secondary-700 rounded-lg shadow-xl z-10">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                          setShowActions(false);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-xs text-secondary-300 hover:text-white hover:bg-secondary-700 transition-colors w-full text-left"
                      >
                        <PencilIcon className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id);
                          setShowActions(false);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-secondary-700 transition-colors w-full text-left"
                      >
                        <TrashIcon className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isOwner && (
                <button className="text-xs text-secondary-400 hover:text-white transition-colors">
                  <FlagIcon className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Reply Input */}
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex space-x-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Reply to ${comment.author.fullName}...`}
                    className="flex-1 p-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={2}
                  />
                  <button
                    onClick={() => handleSubmitReply(comment.id)}
                    className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="mt-2 text-xs text-secondary-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-4">
                {comment.replies.map(reply => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    isReply={true} 
                    parentId={comment.id} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[80vh] glass rounded-2xl border border-secondary-700/50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
            <div className="flex items-center space-x-3">
              <ChatBubbleLeftIcon className="w-6 h-6 text-primary-400" />
              <h3 className="text-xl font-semibold text-white">
                Comments ({comments.length})
              </h3>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>

              <button
                onClick={onClose}
                className="text-secondary-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Comment Input */}
          {isAuthenticated && (
            <div className="p-6 border-b border-secondary-700/50">
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.fullName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this project..."
                    className="w-full p-3 bg-secondary-700 border border-secondary-600 rounded-lg text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-secondary-400">
                      {newComment.length}/500
                    </span>
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"
                />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-white mb-2">No comments yet</h4>
                <p className="text-secondary-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortComments(comments).map(comment => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentsSystem;