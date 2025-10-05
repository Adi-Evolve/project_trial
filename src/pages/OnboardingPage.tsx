import React from 'react';

const OnboardingPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
    <h1 className="text-3xl font-bold mb-4">Welcome to ProjectForge!</h1>
    <p className="mb-6 text-lg text-gray-700">Let’s get you started. Complete your profile and explore projects.</p>
    {/* Add onboarding steps or wizard here */}
    <button className="px-6 py-2 bg-blue-600 text-white rounded shadow">Get Started</button>
  </div>
);

export default OnboardingPage;
