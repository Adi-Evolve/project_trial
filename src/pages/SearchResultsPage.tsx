import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  UserIcon,
  ClockIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  BookmarkIcon,
  UserPlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link, useSearchParams } from 'react-router-dom';
import supabase, { supabase as supabaseClient, TABLES } from '../services/supabase';

interface SearchResult {
  id: string;
  type: 'project' | 'idea' | 'user' | 'content';
  title: string;
  description: string;
  image?: string;
  author?: {
    name: string;
    avatar: string;
    username: string;
  };
  tags: string[];
  stats: {
    likes: number;
    views: number;
    comments?: number;
    followers?: number;
  };
  createdAt: string;
  relevanceScore: number;
  isBookmarked?: boolean;
  isFollowing?: boolean;
}

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch search results from Supabase
  useEffect(() => {
    const q = searchTerm?.trim();
    if (!q) {
      // load popular projects as fallback
      (async () => {
        try {
          const { data: projects } = await supabaseClient
            .from('projects')
            .select('id,title,summary,cover_image,creator_id,created_at,views,likes')
            .order('views', { ascending: false })
            .limit(12);

          const mapped = (projects || []).map(p => ({
            id: p.id,
            type: 'project' as const,
            title: p.title,
            description: p.summary || '',
            image: p.cover_image || undefined,
            author: undefined,
            tags: [],
            stats: { likes: p.likes || 0, views: p.views || 0 },
            createdAt: p.created_at,
            relevanceScore: 0.5
          })) as SearchResult[];
          setResults(mapped);
        } catch (err) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    setLoading(true);
    (async () => {
      try {
        // Search projects
        const { data: projects } = await supabaseClient
          .from('projects')
          .select('id,title,summary,cover_image,creator_id,created_at,views,likes')
          .ilike('title', `%${q}%`)
          .limit(50);

        // Search ideas
        const { data: ideas } = await supabaseClient
          .from('ideas')
          .select('id,title,summary,created_at')
          .ilike('title', `%${q}%`)
          .limit(50);

        // Search users
        const { data: users } = await supabaseClient
          .from('users')
          .select('id,username,full_name,avatar_url')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
          .limit(50);

        // Search project updates / content
        const { data: updates } = await supabaseClient
          .from('project_updates')
          .select('id,title,body,project_id,created_at')
          .ilike('title', `%${q}%`)
          .limit(50);

  const out: SearchResult[] = [];

        (projects || []).forEach(p => out.push({
          id: p.id,
          type: 'project',
          title: p.title,
          description: p.summary || '',
          image: p.cover_image || undefined,
          author: undefined,
          tags: [],
          stats: { likes: p.likes || 0, views: p.views || 0 },
          createdAt: p.created_at,
          relevanceScore: 0.9
        } as SearchResult));

        (ideas || []).forEach(i => out.push({
          id: i.id,
          type: 'idea',
          title: i.title,
          description: i.summary || '',
          tags: [],
          stats: { likes: 0, views: 0 },
          createdAt: i.created_at,
          relevanceScore: 0.7
        } as SearchResult));

        (users || []).forEach(u => out.push({
          id: u.id,
          type: 'user',
          title: u.full_name || u.username,
          description: `@${u.username}`,
          image: u.avatar_url || undefined,
          author: { name: u.full_name || u.username, avatar: u.avatar_url || '', username: u.username },
          tags: [],
          stats: { likes: 0, views: 0 },
          createdAt: new Date().toISOString(),
          relevanceScore: 0.95
        } as SearchResult));

        (updates || []).forEach(u => out.push({
          id: u.id,
          type: 'content',
          title: u.title,
          description: (u.body || '').slice(0, 200),
          tags: [],
          stats: { likes: 0, views: 0 },
          createdAt: u.created_at,
          relevanceScore: 0.6
        } as SearchResult));

        // Basic dedupe by id+type
        const dedupedMap = new Map();
        out.forEach(r => dedupedMap.set(`${r.type}:${r.id}`, r));
        const final = Array.from(dedupedMap.values()).sort((a, b) => b.relevanceScore - a.relevanceScore);
        setResults(final);
      } catch (err) {
        console.error('Search error', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [searchTerm]);

  useEffect(() => {
    let filtered = results;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(result => result.type === selectedType);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(result =>
        selectedTags.some(tag => result.tags.includes(tag))
      );
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(result => new Date(result.createdAt) >= filterDate);
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'popular':
          return b.stats.likes - a.stats.likes;
        case 'views':
          return b.stats.views - a.stats.views;
        default:
          return 0;
      }
    });

    setFilteredResults(filtered);
  }, [results, selectedType, selectedTags, dateFilter, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleBookmark = (id: string) => {
    setResults(results.map(result =>
      result.id === id ? { ...result, isBookmarked: !result.isBookmarked } : result
    ));
  };

  const toggleFollow = (id: string) => {
    setResults(results.map(result =>
      result.id === id ? { ...result, isFollowing: !result.isFollowing } : result
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <RocketLaunchIcon className="w-5 h-5" />;
      case 'idea':
        return <LightBulbIcon className="w-5 h-5" />;
      case 'user':
        return <UserIcon className="w-5 h-5" />;
      case 'content':
        return <ChatBubbleLeftIcon className="w-5 h-5" />;
      default:
        return <MagnifyingGlassIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'idea':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'user':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'content':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Get popular tags from results
  const popularTags = Array.from(
    new Set(results.flatMap(result => result.tags))
  ).slice(0, 12);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Searching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Search Results
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects, ideas, people, and content..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              {filteredResults.length} results found
              {searchTerm && (
                <span> for "<span className="font-medium text-gray-900 dark:text-white">{searchTerm}</span>"</span>
              )}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            {/* Type Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Type
              </h3>
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Results', count: results.length },
                  { id: 'project', label: 'Projects', count: results.filter(r => r.type === 'project').length },
                  { id: 'idea', label: 'Ideas', count: results.filter(r => r.type === 'idea').length },
                  { id: 'user', label: 'People', count: results.filter(r => r.type === 'user').length },
                  { id: 'content', label: 'Content', count: results.filter(r => r.type === 'content').length }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedType === type.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{type.label}</span>
                      <span className="text-sm">({type.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Selected Tags:
                    </span>
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => toggleTag(tag)}
                          className="hover:text-blue-900 dark:hover:text-blue-200"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Date
              </h3>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Time</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* Sort and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Liked</option>
                <option value="views">Most Viewed</option>
              </select>

              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 flex items-center justify-center ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 flex items-center justify-center ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Results List */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
              }>
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image */}
                    {result.image && (
                      <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} overflow-hidden`}>
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <StarIcon className="w-3 h-3 text-yellow-500 mr-1" />
                            <span>{(result.relevanceScore * 100).toFixed(0)}% match</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {result.type !== 'user' && (
                            <button
                              onClick={() => toggleBookmark(result.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                result.isBookmarked
                                  ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30'
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                              }`}
                            >
                              <BookmarkIcon className="w-4 h-4" />
                            </button>
                          )}
                          {result.type === 'user' && (
                            <button
                              onClick={() => toggleFollow(result.id)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                result.isFollowing
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                              }`}
                            >
                              {result.isFollowing ? 'Following' : 'Follow'}
                            </button>
                          )}
                        </div>
                      </div>

                      <Link
                        to={result.type === 'user' ? `/profile/${result.author?.username}` : `/${result.type}s/${result.id}`}
                        className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {result.description}
                        </p>
                      </Link>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {result.tags.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                        {result.tags.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{result.tags.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between">
                        {result.author && result.type !== 'user' && (
                          <div className="flex items-center space-x-2">
                            <img
                              src={result.author.avatar}
                              alt={result.author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {result.author.name}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <HeartIcon className="w-3 h-3" />
                            <span>{result.stats.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <EyeIcon className="w-3 h-3" />
                            <span>{result.stats.views}</span>
                          </div>
                          {result.stats.comments && (
                            <div className="flex items-center space-x-1">
                              <ChatBubbleLeftIcon className="w-3 h-3" />
                              <span>{result.stats.comments}</span>
                            </div>
                          )}
                          {result.stats.followers && (
                            <div className="flex items-center space-x-1">
                              <UserPlusIcon className="w-3 h-3" />
                              <span>{result.stats.followers}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatTimeAgo(result.createdAt)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;