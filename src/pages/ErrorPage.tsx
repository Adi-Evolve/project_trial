import React from 'react';

const ErrorPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
    <h1 className="text-4xl font-bold text-red-600 mb-4">Oops!</h1>
    <p className="text-lg text-gray-700 mb-6">Something went wrong. Please try again or contact support.</p>
    <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded">Go Home</a>
  </div>
);

export default ErrorPage;
