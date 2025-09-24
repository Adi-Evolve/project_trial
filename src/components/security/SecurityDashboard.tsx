import React from 'react';

interface SecurityDashboardProps {
  adminAddress: string;
  className?: string;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ adminAddress, className }) => {
  return (
    <div className={className}>
      <h1>Security Dashboard</h1>
      <p>Admin: {adminAddress}</p>
      <p>Security monitoring will be implemented here.</p>
    </div>
  );
};

export default SecurityDashboard;
