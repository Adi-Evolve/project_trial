import React from "react";
import { supabase } from '../../services/supabase';

const SignUpForm = () => {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold mb-2">Sign Up</h2>
      <button onClick={handleGoogleLogin} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full">Sign up with Google</button>
      <button onClick={handleGitHubLogin} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 w-full">Sign up with GitHub</button>
    </div>
  );
};

export default SignUpForm;