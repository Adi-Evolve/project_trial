import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { escrowService, Milestone, EscrowRelease, ProjectEscrow } from '../../services/escrowService';
import { useAuth } from '../../context/AuthContext';

interface EscrowManagementProps {
  projectId: string;
  isOwner: boolean;
}

export const EscrowManagement: React.FC<EscrowManagementProps> = ({ 
  projectId, 
  isOwner 
}) => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [releases, setReleases] = useState<EscrowRelease[]>([]);
  const [escrowStatus, setEscrowStatus] = useState<ProjectEscrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'milestones' | 'releases' | 'create'>('milestones');
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  
  // Form state for creating milestones
  const [newMilestones, setNewMilestones] = useState<Array<{
    title: string;
    description: string;
    targetAmount: number;
    dueDate: string;
  }>>([
    { title: '', description: '', targetAmount: 0, dueDate: '' }
  ]);

  useEffect(() => {
    loadEscrowData();
  }, [projectId]);

  const loadEscrowData = async () => {
    setLoading(true);
    try {
      // Load milestones
      const milestonesResult = await escrowService.getProjectMilestones(projectId);
      if (milestonesResult.success) {
        setMilestones(milestonesResult.milestones || []);
      }

      // Load escrow status
      const statusResult = await escrowService.getProjectEscrowStatus(projectId);
      if (statusResult.success) {
        setEscrowStatus(statusResult.escrow || null);
      }
    } catch (error) {
      console.error('Error loading escrow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMilestoneField = () => {
    setNewMilestones([...newMilestones, { title: '', description: '', targetAmount: 0, dueDate: '' }]);
  };

  const updateMilestoneField = (index: number, field: string, value: any) => {
    const updated = newMilestones.map((milestone, i) => 
      i === index ? { ...milestone, [field]: value } : milestone
    );
    setNewMilestones(updated);
  };

  const removeMilestoneField = (index: number) => {
    setNewMilestones(newMilestones.filter((_, i) => i !== index));
  };

  const createMilestones = async () => {
    if (!user?.walletAddress) return;

    try {
      setLoading(true);
      const milestonesToCreate = newMilestones.map(milestone => ({
        ...milestone,
        projectId,
        status: 'pending' as const
      }));

      const result = await escrowService.createMilestones(projectId, milestonesToCreate);
      
      if (result.success) {
        setNewMilestones([{ title: '', description: '', targetAmount: 0, dueDate: '' }]);
        setShowCreateMilestone(false);
        await loadEscrowData();
        alert('Milestones created successfully!');
      } else {
        alert(`Error creating milestones: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating milestones:', error);
      alert('Failed to create milestones');
    } finally {
      setLoading(false);
    }
  };

  const submitMilestoneCompletion = async (milestoneId: string, evidence: string) => {
    try {
      const result = await escrowService.submitMilestoneCompletion(milestoneId, evidence);
      if (result.success) {
        await loadEscrowData();
        alert('Milestone submitted for review!');
      } else {
        alert(`Error submitting milestone: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting milestone:', error);
    }
  };

  const requestMilestoneRelease = async (milestoneId: string) => {
    if (!user?.walletAddress) return;

    try {
      const result = await escrowService.requestMilestoneRelease(projectId, milestoneId, user.walletAddress);
      if (result.success) {
        await loadEscrowData();
        alert('Fund release requested!');
      } else {
        alert(`Error requesting release: ${result.error}`);
      }
    } catch (error) {
      console.error('Error requesting release:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'in_review':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'released':
        return <CurrencyDollarIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'released': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const totalPercentage = newMilestones.reduce((sum, m) => sum + (m.targetAmount || 0), 0);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Escrow Status */}
      {escrowStatus && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Escrow Status
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              escrowStatus.escrowStatus === 'completed' ? 'bg-green-100 text-green-800' :
              escrowStatus.escrowStatus === 'active' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {escrowStatus.escrowStatus.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{escrowStatus.totalFunds}</div>
              <div className="text-sm text-gray-600">Total Funds (ETH)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{escrowStatus.releasedFunds}</div>
              <div className="text-sm text-gray-600">Released (ETH)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{escrowStatus.lockedFunds}</div>
              <div className="text-sm text-gray-600">Locked (ETH)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {escrowStatus.completedMilestones}/{escrowStatus.milestoneCount}
              </div>
              <div className="text-sm text-gray-600">Milestones</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['milestones', 'releases', 'create'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-gray-900">Project Milestones</h4>
              {isOwner && milestones.length === 0 && (
                <button
                  onClick={() => {setActiveTab('create'); setShowCreateMilestone(true);}}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Create Milestones
                </button>
              )}
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-12">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones defined</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isOwner ? 'Create milestones to enable escrow fund releases.' : 'Milestones will appear here once the project owner creates them.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        {getStatusIcon(milestone.status)}
                        <h5 className="ml-2 text-lg font-medium text-gray-900">{milestone.title}</h5>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-indigo-600">
                          {milestone.targetAmount}% of funds
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{milestone.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Due: {new Date(milestone.dueDate).toLocaleDateString()}
                      </div>
                      
                      <div className="flex space-x-2">
                        {isOwner && milestone.status === 'pending' && (
                          <button
                            onClick={() => {
                              const evidence = prompt('Please provide evidence of milestone completion:');
                              if (evidence) {
                                submitMilestoneCompletion(milestone.id, evidence);
                              }
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Submit Completion
                          </button>
                        )}
                        
                        {isOwner && milestone.status === 'approved' && (
                          <button
                            onClick={() => requestMilestoneRelease(milestone.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Request Release
                          </button>
                        )}
                      </div>
                    </div>

                    {milestone.evidence && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm"><strong>Evidence:</strong> {milestone.evidence}</p>
                      </div>
                    )}

                    {milestone.reviewerComments && (
                      <div className="mt-2 p-3 bg-blue-50 rounded">
                        <p className="text-sm"><strong>Reviewer Comments:</strong> {milestone.reviewerComments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div>
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Create Milestones</h4>
              <p className="text-sm text-gray-600">
                Define milestones for your project. Each milestone represents a percentage of the total funds that will be released upon completion.
              </p>
            </div>

            <div className="space-y-6">
              {newMilestones.map((milestone, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-medium text-gray-900">Milestone {index + 1}</h5>
                    {newMilestones.length > 1 && (
                      <button
                        onClick={() => removeMilestoneField(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestoneField(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Initial Development"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fund Percentage</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={milestone.targetAmount}
                        onChange={(e) => updateMilestoneField(index, 'targetAmount', parseFloat(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="25.00"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={milestone.description}
                        onChange={(e) => updateMilestoneField(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Describe what needs to be accomplished for this milestone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={milestone.dueDate}
                        onChange={(e) => updateMilestoneField(index, 'dueDate', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <button
                  onClick={addMilestoneField}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  + Add Another Milestone
                </button>

                <div className="text-sm text-gray-600">
                  Total: {totalPercentage.toFixed(2)}% 
                  {totalPercentage !== 100 && (
                    <span className="text-red-600 ml-1">(Must equal 100%)</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setActiveTab('milestones')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createMilestones}
                  disabled={totalPercentage !== 100 || loading || newMilestones.some(m => !m.title || !m.description || !m.dueDate)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Milestones'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Releases Tab */}
        {activeTab === 'releases' && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-6">Fund Releases</h4>
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No releases yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Fund releases will appear here as milestones are completed and approved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};