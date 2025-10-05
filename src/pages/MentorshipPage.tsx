import React from 'react';

const MentorshipPage: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-green-100 dark:from-gray-900 dark:to-gray-800 p-8">
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-yellow-700 dark:text-yellow-300">Mentorship & Matching</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Find a Mentor or Collaborator</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Get matched with mentors or collaborators based on your skills and interests.</p>
        <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-600">[Matching system coming soon]</div>
      </div>
    </div>
  </div>
);

export default MentorshipPage;
