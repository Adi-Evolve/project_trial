import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  StarIcon,
  FireIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalFollowers: number;
    totalProjects: number;
    viewsChange: number;
    likesChange: number;
    followersChange: number;
    projectsChange: number;
  };
  chartData: {
    views: ChartDataPoint[];
    likes: ChartDataPoint[];
    followers: ChartDataPoint[];
  };
  topProjects: TopProject[];
  demographics: {
    countries: CountryData[];
    devices: DeviceData[];
    referrals: ReferralData[];
  };
  engagement: {
    averageTimeOnProfile: number;
    bounceRate: number;
    returnVisitors: number;
    shareRate: number;
  };
}

interface ChartDataPoint {
  date: string;
  value: number;
}

interface TopProject {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  change: number;
  image?: string;
}

interface CountryData {
  country: string;
  visitors: number;
  percentage: number;
}

interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

interface ReferralData {
  source: string;
  visitors: number;
  percentage: number;
}

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeChart, setActiveChart] = useState('views');

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const chartOptions = [
    { value: 'views', label: 'Profile Views', icon: EyeIcon, color: 'blue' },
    { value: 'likes', label: 'Total Likes', icon: HeartIcon, color: 'pink' },
    { value: 'followers', label: 'Followers', icon: UserGroupIcon, color: 'green' }
  ];

  // Mock analytics data
  useEffect(() => {
    const generateChartData = (baseValue: number, days: number): ChartDataPoint[] => {
      const data: ChartDataPoint[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const variation = Math.random() * 0.3 - 0.15; // ±15% variation
        const value = Math.floor(baseValue * (1 + variation));
        data.push({
          date: date.toISOString().split('T')[0],
          value: Math.max(0, value)
        });
      }
      return data;
    };

    const mockAnalytics: AnalyticsData = {
      overview: {
        totalViews: 12547,
        totalLikes: 2834,
        totalFollowers: 1247,
        totalProjects: 8,
        viewsChange: 12.5,
        likesChange: 8.2,
        followersChange: 15.7,
        projectsChange: 0
      },
      chartData: {
        views: generateChartData(400, 30),
        likes: generateChartData(90, 30),
        followers: generateChartData(40, 30)
      },
      topProjects: [
        {
          id: '1',
          title: 'AI Task Manager',
          views: 3254,
          likes: 412,
          comments: 89,
          change: 15.2,
          image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop'
        },
        {
          id: '2',
          title: 'EcoTracker',
          views: 2891,
          likes: 387,
          comments: 76,
          change: 8.7,
          image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=250&fit=crop'
        },
        {
          id: '3',
          title: 'DevFlow',
          views: 2156,
          likes: 298,
          comments: 54,
          change: -3.2,
          image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop'
        },
        {
          id: '4',
          title: 'Smart Budget',
          views: 1847,
          likes: 234,
          comments: 43,
          change: 22.1,
          image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop'
        },
        {
          id: '5',
          title: 'CodeMentor',
          views: 1523,
          likes: 189,
          comments: 32,
          change: 5.9,
          image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop'
        }
      ],
      demographics: {
        countries: [
          { country: 'United States', visitors: 4234, percentage: 33.8 },
          { country: 'United Kingdom', visitors: 2156, percentage: 17.2 },
          { country: 'Canada', visitors: 1847, percentage: 14.7 },
          { country: 'Germany', visitors: 1523, percentage: 12.1 },
          { country: 'Australia', visitors: 1098, percentage: 8.8 },
          { country: 'Other', visitors: 1689, percentage: 13.4 }
        ],
        devices: [
          { device: 'Desktop', visitors: 7528, percentage: 60.0 },
          { device: 'Mobile', visitors: 3762, percentage: 30.0 },
          { device: 'Tablet', visitors: 1257, percentage: 10.0 }
        ],
        referrals: [
          { source: 'Direct', visitors: 5019, percentage: 40.0 },
          { source: 'Search Engines', visitors: 3762, percentage: 30.0 },
          { source: 'Social Media', visitors: 2509, percentage: 20.0 },
          { source: 'Other Websites', visitors: 1257, percentage: 10.0 }
        ]
      },
      engagement: {
        averageTimeOnProfile: 245, // seconds
        bounceRate: 32.5, // percentage
        returnVisitors: 67.8, // percentage
        shareRate: 8.9 // percentage
      }
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, change, icon: Icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {change >= 0 ? (
          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          vs last period
        </span>
      </div>
    </motion.div>
  );

  const SimpleChart: React.FC<{ data: ChartDataPoint[]; color: string }> = ({ data, color }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="h-64 flex items-end space-x-1 px-4">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(point.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.02 }}
              className={`w-full bg-${color}-500 rounded-t-sm min-h-[2px]`}
            />
            {index % 5 === 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {new Date(point.date).getDate()}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Analytics Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics data will appear here once you have projects and activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your profile performance and project engagement
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={analytics.overview.totalViews}
            change={analytics.overview.viewsChange}
            icon={EyeIcon}
            color="blue"
          />
          <StatCard
            title="Total Likes"
            value={analytics.overview.totalLikes}
            change={analytics.overview.likesChange}
            icon={HeartIcon}
            color="pink"
          />
          <StatCard
            title="Followers"
            value={analytics.overview.totalFollowers}
            change={analytics.overview.followersChange}
            icon={UserGroupIcon}
            color="green"
          />
          <StatCard
            title="Projects"
            value={analytics.overview.totalProjects}
            change={analytics.overview.projectsChange}
            icon={ChartBarIcon}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Overview
                </h3>
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {chartOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setActiveChart(option.value)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          activeChart === option.value
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <SimpleChart 
                data={analytics.chartData[activeChart as keyof typeof analytics.chartData]} 
                color={chartOptions.find(opt => opt.value === activeChart)?.color || 'blue'}
              />
            </div>
          </motion.div>

          {/* Engagement Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Engagement Metrics
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg. Time on Profile
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatTime(analytics.engagement.averageTimeOnProfile)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(analytics.engagement.averageTimeOnProfile / 600) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Bounce Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {analytics.engagement.bounceRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${analytics.engagement.bounceRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Return Visitors
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {analytics.engagement.returnVisitors}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${analytics.engagement.returnVisitors}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Share Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {analytics.engagement.shareRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${analytics.engagement.shareRate}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Projects and Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Top Performing Projects
            </h3>
            
            <div className="space-y-4">
              {analytics.topProjects.map((project, index) => (
                <div key={project.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  
                  {project.image && (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {project.views.toLocaleString()} views • {project.likes} likes
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {project.change >= 0 ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      project.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(project.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Audience Demographics
            </h3>
            
            <div className="space-y-6">
              {/* Countries */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Top Countries
                </h4>
                <div className="space-y-2">
                  {analytics.demographics.countries.slice(0, 5).map((country) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {country.country}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${country.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">
                          {country.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devices */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <ComputerDesktopIcon className="w-4 h-4 mr-2" />
                  Device Types
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {analytics.demographics.devices.map((device) => (
                    <div key={device.device} className="text-center">
                      <div className="flex justify-center mb-2">
                        {device.device === 'Desktop' && <ComputerDesktopIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
                        {device.device === 'Mobile' && <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
                        {device.device === 'Tablet' && <ComputerDesktopIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {device.percentage}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {device.device}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;