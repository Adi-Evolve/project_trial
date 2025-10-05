import React from 'react';

const OnboardingTourPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
    <div className="max-w-xl w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
      <h1 className="text-3xl font-bold mb-4 text-blue-700 dark:text-blue-300">Welcome to ProjectForge!</h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">Take a quick tour to discover the platform's key features and get started faster.</p>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
        <li>Discover and join innovative projects</li>
        <li>Collaborate with talented people</li>
        <li>Track your progress and achievements</li>
        <li>Share ideas and get feedback</li>
        <li>Manage your profile and settings</li>
      </ul>
      <div className="mt-8 flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Start Exploring</button>
      </div>
    </div>
  </div>
);

export default OnboardingTourPage;
