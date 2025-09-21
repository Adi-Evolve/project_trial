import React from "react";

const LoginForm = () => {
  return (
    <div>
      <h2>Login with MetaMask</h2>
      <p>Please refresh the page to use MetaMask authentication</p>
      <button onClick={() => window.location.reload()}>Refresh Page</button>
    </div>
  );
};

export default LoginForm;