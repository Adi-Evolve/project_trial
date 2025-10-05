import React from 'react';

const IntegrationsPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300">Integrations</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Connect Your Tools</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>Google Drive for video uploads</li>
          <li>Google Calendar for project deadlines</li>
          <li>More OAuth providers (coming soon)</li>
        </ul>
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Manage Integrations</button>
        </div>
      </div>
    </div>
  </div>
);

export default IntegrationsPage;
