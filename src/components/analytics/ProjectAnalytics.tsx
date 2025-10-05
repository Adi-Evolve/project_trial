import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface ProjectAnalyticsProps {
  projectId?: string;
  userId?: string;
  className?: string;
}

type AnalyticsData = {
  views: { total: number; trend: number; daily: Array<{ date: string; views: number; uniqueViews?: number }>; };
  engagement: { likes: number; comments: number; shares: number; bookmarks: number; rating: number; reviews: number; };
  funding: { total: number; goal: number; backers: number; averagePledge: number; dailyFunding?: Array<{ date: string; amount: number }> };
  demographics: { ageGroups: Array<{ name: string; value: number; color?: string }>; locations: Array<{ country: string; users: number; percentage: number }>; };
  performance?: { conversionRate?: number; bounceRate?: number; averageSessionTime?: string; returnVisitors?: number };
};

const mockAnalyticsData: AnalyticsData = {
  views: {
    total: 12456,
    trend: 12,
    daily: Array.from({ length: 14 }).map((_, i) => ({ date: new Date(Date.now() - (13 - i) * 24 * 3600 * 1000).toISOString(), views: Math.round(200 + Math.random() * 800) }))
  },
  engagement: { likes: 420, comments: 86, shares: 32, bookmarks: 58, rating: 4.3, reviews: 24 },
  funding: { total: 54000, goal: 100000, backers: 320, averagePledge: 168, dailyFunding: Array.from({ length: 14 }).map((_, i) => ({ date: new Date(Date.now() - (13 - i) * 24 * 3600 * 1000).toISOString(), amount: Math.round(100 + Math.random() * 1500) })) },
  demographics: {
    ageGroups: [
      { name: '18-24', value: 28, color: '#60a5fa' },
      { name: '25-34', value: 44, color: '#7c3aed' },
      { name: '35-44', value: 18, color: '#f97316' },
      { name: '45+', value: 10, color: '#10b981' }
    ],
    locations: [
      { country: 'United States', users: 5400, percentage: 43 },
      { country: 'India', users: 2100, percentage: 17 },
      { country: 'Germany', users: 900, percentage: 7 }
    ]
  },
  performance: { conversionRate: 3.4, bounceRate: 52.1, averageSessionTime: '2m 34s', returnVisitors: 22 }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

const getTrendColor = (t: number) => (t >= 0 ? 'text-green-400' : 'text-red-400');

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ projectId, userId, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    // Simulate fetching analytics for projectId/userId
    setIsLoading(true);
    const t = setTimeout(() => {
      setAnalyticsData(mockAnalyticsData);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [projectId, userId]);

  if (isLoading || !analyticsData) {
    return (
      <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
          <span className="ml-3 text-white font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <DocumentChartBarIcon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Project Analytics</h3>
            <div className="text-sm text-secondary-400">Overview</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 bg-secondary-700 hover:bg-secondary-600 rounded-lg">
            <ArrowPathIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Views (14d)</div>
          <div className="text-2xl font-bold mt-1">{formatNumber(analyticsData.views.total)}</div>
          <div className={`text-sm ${getTrendColor(analyticsData.views.trend)}`}>{analyticsData.views.trend}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Likes</div>
          <div className="text-2xl font-bold mt-1">{formatNumber(analyticsData.engagement.likes)}</div>
          <div className="text-sm text-gray-500">Comments {analyticsData.engagement.comments}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-xs text-gray-500">Funding</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(analyticsData.funding.total)}</div>
          <div className="text-sm text-gray-500">Goal {formatCurrency(analyticsData.funding.goal)}</div>
        </div>
      </div>

      <div style={{ width: '100%', height: 220 }} className="mb-4">
        <ResponsiveContainer>
          <LineChart data={analyticsData.views.daily.map(d => ({ ...d, date: new Date(d.date).toLocaleDateString() }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Top Age Groups</div>
          <ul className="mt-2 text-sm text-gray-700">
            {analyticsData.demographics.ageGroups.map(g => (
              <li key={g.name} className="flex justify-between"><span>{g.name}</span><span>{g.value}%</span></li>
            ))}
          </ul>
        </div>

        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-500">Engagement</div>
          <div className="text-xl font-bold mt-1">{analyticsData.engagement.likes}</div>
          <div className="text-sm text-gray-500">Reviews {analyticsData.engagement.reviews} • Rating {analyticsData.engagement.rating}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;