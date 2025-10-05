import React from 'react';

const AdminDashboardPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">View, verify, suspend, or promote users.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Go to User List</button>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-2">Content Moderation</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Review reported projects, comments, and users.</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Moderate Content</button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-2">Platform Analytics</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Track platform growth, engagement, and trends.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">View Analytics</button>
      </div>
    </div>
  </div>
);

export default AdminDashboardPage;
