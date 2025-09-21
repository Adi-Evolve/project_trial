import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ProjectAnalyticsProps {
  projectId: string;
  className?: string;
}

interface AnalyticsData {
  views: {
    total: number;
    trend: number;
    daily: Array<{ date: string; views: number; uniqueViews: number }>;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    bookmarks: number;
    rating: number;
    reviews: number;
  };
  funding: {
    total: number;
    goal: number;
    backers: number;
    averagePledge: number;
    dailyFunding: Array<{ date: string; amount: number; backers: number }>;
  };
  demographics: {
    ageGroups: Array<{ name: string; value: number; color: string }>;
    locations: Array<{ country: string; percentage: number; users: number }>;
    interests: Array<{ category: string; percentage: number }>;
  };
  performance: {
    conversionRate: number;
    bounceRate: number;
    averageSessionTime: string;
    returnVisitors: number;
  };
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projectId, className = '' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'funding' | 'audience'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [projectId, selectedTimeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockData: AnalyticsData = {
        views: {
          total: 15420,
          trend: 12.5,
          daily: [
            { date: '2024-01-01', views: 450, uniqueViews: 380 },
            { date: '2024-01-02', views: 520, uniqueViews: 420 },
            { date: '2024-01-03', views: 480, uniqueViews: 390 },
            { date: '2024-01-04', views: 610, uniqueViews: 480 },
            { date: '2024-01-05', views: 580, uniqueViews: 460 },
            { date: '2024-01-06', views: 720, uniqueViews: 580 },
            { date: '2024-01-07', views: 680, uniqueViews: 540 },
          ]
        },
        engagement: {
          likes: 1240,
          comments: 186,
          shares: 94,
          bookmarks: 312,
          rating: 4.7,
          reviews: 89
        },
        funding: {
          total: 125000,
          goal: 200000,
          backers: 284,
          averagePledge: 440,
          dailyFunding: [
            { date: '2024-01-01', amount: 8500, backers: 12 },
            { date: '2024-01-02', amount: 12000, backers: 18 },
            { date: '2024-01-03', amount: 9500, backers: 15 },
            { date: '2024-01-04', amount: 15000, backers: 22 },
            { date: '2024-01-05', amount: 11000, backers: 16 },
            { date: '2024-01-06', amount: 18500, backers: 28 },
            { date: '2024-01-07', amount: 14500, backers: 21 },
          ]
        },
        demographics: {
          ageGroups: [
            { name: '18-24', value: 25, color: '#3b82f6' },
            { name: '25-34', value: 40, color: '#8b5cf6' },
            { name: '35-44', value: 20, color: '#06d6a0' },
            { name: '45-54', value: 10, color: '#f59e0b' },
            { name: '55+', value: 5, color: '#ef4444' },
          ],
          locations: [
            { country: 'United States', percentage: 35, users: 5397 },
            { country: 'United Kingdom', percentage: 15, users: 2313 },
            { country: 'Canada', percentage: 12, users: 1850 },
            { country: 'Germany', percentage: 8, users: 1234 },
            { country: 'Australia', percentage: 6, users: 925 },
            { country: 'Others', percentage: 24, users: 3701 },
          ],
          interests: [
            { category: 'Technology', percentage: 45 },
            { category: 'Innovation', percentage: 32 },
            { category: 'Startup', percentage: 28 },
            { category: 'Design', percentage: 22 },
            { category: 'Business', percentage: 18 },
          ]
        },
        performance: {
          conversionRate: 3.2,
          bounceRate: 24.5,
          averageSessionTime: '4:32',
          returnVisitors: 68
        }
      };
      
      setAnalyticsData(mockData);
      setIsLoading(false);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-400' : 'text-red-400';
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'engagement', label: 'Engagement', icon: HeartIcon },
    { id: 'funding', label: 'Funding', icon: CurrencyDollarIcon },
    { id: 'audience', label: 'Audience', icon: UserGroupIcon },
  ];

  if (isLoading || !analyticsData) {
    return (
      <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          />
          <span className="ml-3 text-white font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <DocumentChartBarIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Project Analytics</h2>
              <p className="text-secondary-400">Comprehensive insights and performance metrics</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={fetchAnalyticsData}
              className="p-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-secondary-700/50">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-secondary-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Views',
                  value: analyticsData.views.total,
                  trend: analyticsData.views.trend,
                  icon: EyeIcon,
                  format: 'number'
                },
                {
                  label: 'Funding Raised',
                  value: analyticsData.funding.total,
                  trend: 8.3,
                  icon: CurrencyDollarIcon,
                  format: 'currency'
                },
                {
                  label: 'Total Backers',
                  value: analyticsData.funding.backers,
                  trend: 15.2,
                  icon: UserGroupIcon,
                  format: 'number'
                },
                {
                  label: 'Engagement Rate',
                  value: 4.7,
                  trend: 2.1,
                  icon: HeartIcon,
                  format: 'percentage'
                }
              ].map((metric, index) => {
                const Icon = metric.icon;
                const TrendIcon = getTrendIcon(metric.trend);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5 text-secondary-400" />
                      <div className={`flex items-center space-x-1 text-sm ${getTrendColor(metric.trend)}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{Math.abs(metric.trend)}%</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {metric.format === 'currency' 
                        ? formatCurrency(metric.value)
                        : metric.format === 'percentage'
                        ? `${metric.value}%`
                        : formatNumber(metric.value)
                      }
                    </div>
                    <div className="text-sm text-secondary-400">{metric.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Views Chart */}
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Views Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.views.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    name="Total Views"
                  />
                  <Area
                    type="monotone"
                    dataKey="uniqueViews"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                    name="Unique Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Funding Progress */}
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Funding Progress</h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-secondary-400">Progress</span>
                  <span className="text-white font-medium">
                    {Math.round((analyticsData.funding.total / analyticsData.funding.goal) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-secondary-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(analyticsData.funding.total / analyticsData.funding.goal) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-primary-500 to-purple-500 h-3 rounded-full"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-green-400">{formatCurrency(analyticsData.funding.total)} raised</span>
                  <span className="text-secondary-400">{formatCurrency(analyticsData.funding.goal)} goal</span>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analyticsData.funding.dailyFunding}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" name="Daily Funding" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'engagement' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Likes', value: analyticsData.engagement.likes, icon: HeartIcon, color: 'text-red-400' },
                { label: 'Comments', value: analyticsData.engagement.comments, icon: ChatBubbleLeftRightIcon, color: 'text-blue-400' },
                { label: 'Shares', value: analyticsData.engagement.shares, icon: ShareIcon, color: 'text-green-400' },
                { label: 'Bookmarks', value: analyticsData.engagement.bookmarks, icon: StarIcon, color: 'text-yellow-400' },
                { label: 'Rating', value: analyticsData.engagement.rating, icon: StarIcon, color: 'text-purple-400' },
                { label: 'Reviews', value: analyticsData.engagement.reviews, icon: ChatBubbleLeftRightIcon, color: 'text-orange-400' },
              ].map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div key={index} className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${metric.color}`} />
                    <div className="text-xl font-bold text-white">
                      {metric.label === 'Rating' ? metric.value.toFixed(1) : formatNumber(metric.value)}
                    </div>
                    <div className="text-sm text-secondary-400">{metric.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-2xl font-bold text-white">{formatCurrency(analyticsData.funding.total)}</div>
                <div className="text-sm text-secondary-400">Total Raised</div>
              </div>
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-2xl font-bold text-white">{analyticsData.funding.backers}</div>
                <div className="text-sm text-secondary-400">Total Backers</div>
              </div>
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-2xl font-bold text-white">{formatCurrency(analyticsData.funding.averagePledge)}</div>
                <div className="text-sm text-secondary-400">Average Pledge</div>
              </div>
              <div className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="text-2xl font-bold text-white">
                  {Math.round((analyticsData.funding.total / analyticsData.funding.goal) * 100)}%
                </div>
                <div className="text-sm text-secondary-400">Goal Progress</div>
              </div>
            </div>

            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Daily Funding</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.funding.dailyFunding}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Daily Amount"
                  />
                  <Line
                    type="monotone"
                    dataKey="backers"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Daily Backers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'audience' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Demographics */}
              <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Age Demographics</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={analyticsData.demographics.ageGroups}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {analyticsData.demographics.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Metrics */}
              <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
                <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Conversion Rate</span>
                    <span className="text-white font-medium">{analyticsData.performance.conversionRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Bounce Rate</span>
                    <span className="text-white font-medium">{analyticsData.performance.bounceRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Avg Session Time</span>
                    <span className="text-white font-medium">{analyticsData.performance.averageSessionTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-400">Return Visitors</span>
                    <span className="text-white font-medium">{analyticsData.performance.returnVisitors}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="bg-secondary-700/30 rounded-lg p-6 border border-secondary-600/50">
              <h3 className="text-lg font-semibold text-white mb-4">Geographic Distribution</h3>
              <div className="space-y-3">
                {analyticsData.demographics.locations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-white font-medium">{location.country}</span>
                      <span className="text-secondary-400">({formatNumber(location.users)} users)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-secondary-700 rounded-full h-2">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${location.percentage}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-12 text-right">{location.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAnalytics;