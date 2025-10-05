import React from 'react';

const ReputationBadge: React.FC<{ points: number }> = ({ points }) => (
  <span className="inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs font-bold ml-2">
    ⭐ {points} Reputation
  </span>
);

export default ReputationBadge;
