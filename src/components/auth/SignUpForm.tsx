import React from "react";

const SignUpForm = () => {
  return (
    <div>
      <h2>Sign Up with MetaMask</h2>
      <p>Please refresh the page to use MetaMask authentication</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );
};

export default SignUpForm;