import React from 'react';

// Centralized AuthFlow: Google and GitHub only
const AuthFlow: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-2xl font-bold mb-4">Sign in to ProjectForge</h2>
      <p className="mb-6 text-gray-500">Use your official email and GitHub to continue</p>
      <div className="w-full max-w-xs space-y-4">
        <button
          onClick={async () => await import('../../services/supabase').then(({ supabase }) => supabase.auth.signInWithOAuth({ provider: 'google' }))}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in with Google
        </button>
        <button
          onClick={async () => await import('../../services/supabase').then(({ supabase }) => supabase.auth.signInWithOAuth({ provider: 'github' }))}
          className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Sign in with GitHub
        </button>
      </div>
    </div>
  );
};

export default AuthFlow;