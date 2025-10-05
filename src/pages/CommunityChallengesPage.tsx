import React from 'react';

const CommunityChallengesPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-pink-50 to-yellow-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-pink-700 dark:text-pink-300">Community Challenges</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Upcoming Challenges</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
          <li>AI for Good Hackathon (Oct 2025)</li>
          <li>Open Source Sustainability Sprint (Nov 2025)</li>
          <li>Winter Innovation Jam (Dec 2025)</li>
        </ul>
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors">Submit Your Idea</button>
        </div>
      </div>
    </div>
  </div>
);

export default CommunityChallengesPage;
