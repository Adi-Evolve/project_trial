import React from 'react';

type Milestone = {
  id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  completed?: boolean;
};

const MilestoneFlowchart: React.FC<{ milestones: Milestone[] }> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="my-8">
      <h3 className="font-bold mb-4">Project Workflow</h3>
      <div className="flex items-start space-x-4 overflow-auto">
        {milestones.map((m, idx) => (
          <div key={m.id} className="flex-shrink-0 w-60 p-4 border rounded bg-white">
            <div className="flex items-center justify-between">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${m.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{idx + 1}</div>
              <div className="text-xs text-gray-400">{m.due_date ? new Date(m.due_date).toLocaleDateString() : ''}</div>
            </div>
            <h4 className="font-semibold mt-2">{m.title}</h4>
            {m.description && <p className="text-sm text-gray-600 mt-1">{m.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MilestoneFlowchart;
