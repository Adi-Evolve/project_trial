import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  oracleService, 
  OracleInfo, 
  VerificationRequest, 
  OracleVote,
  ConsensusResult,
  VerificationStatus 
} from '../../services/oracleService';
import { 
  Eye, 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Shield,
  Zap,
  Target,
  Activity
} from 'lucide-react';
// Deprecated: All oracle/blockchain logic removed. Use centralized Supabase logic only.
interface OracleNetworkProps {
  currentUserAddress?: string;
  onVerificationComplete?: (requestId: number, approved: boolean) => void;
  className?: string;
}

export const OracleNetwork: React.FC<OracleNetworkProps> = ({
  currentUserAddress,
  onVerificationComplete,
  className
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Oracle data
  const [oracles, setOracles] = useState<OracleInfo[]>([]);
  const [isCurrentUserOracle, setIsCurrentUserOracle] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [pendingVotes, setPendingVotes] = useState<VerificationRequest[]>([]);

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalOracles: 0,
    activeOracles: 0,
    averageReputation: 0,
    averageAccuracy: 0,
    totalVerifications: 0,
    consensusRate: 0
  });

  const [verificationStats, setVerificationStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    averageConsensusTime: 0
  });

  // New verification request form
  const [newRequestForm, setNewRequestForm] = useState({
    campaignId: '',
    milestoneIndex: '',
    ipfsHash: '',
    submitting: false
  });

  // Voting
  const [votingStates, setVotingStates] = useState<Record<number, boolean>>({});

  useEffect(() => {
    initializeOracle();
  }, [currentUserAddress]);

  const initializeOracle = async () => {
    try {
      setLoading(true);
      await oracleService.initialize();
      setIsInitialized(true);

      await Promise.all([
        loadOracleData(),
        loadVerificationRequests(),
        loadMetrics(),
        checkUserOracleStatus()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize oracle network');
    } finally {
      setLoading(false);
    }
  };

  const loadOracleData = async () => {
    try {
      const oracleList = await oracleService.getActiveOracles();
      setOracles(oracleList);
    } catch (err) {
      console.error('Failed to load oracle data:', err);
    }
  };

  const loadVerificationRequests = async () => {
    try {
      const [allRequests, pending] = await Promise.all([
        oracleService.getAllVerificationRequests(),
        oracleService.getPendingVerificationRequests()
      ]);

      setVerificationRequests(allRequests);

      if (currentUserAddress && isCurrentUserOracle) {
        const needingVotes = await oracleService.getRequestsRequiringVote(currentUserAddress);
        setPendingVotes(needingVotes);
      }
    } catch (err) {
      console.error('Failed to load verification requests:', err);
    }
  };

  const loadMetrics = async () => {
    try {
      const [performance, stats] = await Promise.all([
        oracleService.getOraclePerformanceMetrics(),
        oracleService.getVerificationStats()
      ]);

      setPerformanceMetrics(performance);
      setVerificationStats(stats);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const checkUserOracleStatus = async () => {
    if (!currentUserAddress) return;

    try {
      const isOracle = await oracleService.isOracle(currentUserAddress);
      setIsCurrentUserOracle(isOracle);
    } catch (err) {
      console.error('Failed to check oracle status:', err);
    }
  };

  const handleSubmitVerificationRequest = async () => {
    if (!newRequestForm.campaignId || !newRequestForm.milestoneIndex || !newRequestForm.ipfsHash) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setNewRequestForm(prev => ({ ...prev, submitting: true }));

      const result = await oracleService.requestMilestoneVerification(
        parseInt(newRequestForm.campaignId),
        parseInt(newRequestForm.milestoneIndex),
        newRequestForm.ipfsHash
      );

      setNewRequestForm({
        campaignId: '',
        milestoneIndex: '',
        ipfsHash: '',
        submitting: false
      });

      await loadVerificationRequests();
      await loadMetrics();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit verification request');
      setNewRequestForm(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleVote = async (requestId: number, approved: boolean) => {
    if (!isCurrentUserOracle) {
      setError('Only oracles can vote on verifications');
      return;
    }

    try {
      setVotingStates(prev => ({ ...prev, [requestId]: true }));

      const txHash = await oracleService.voteOnMilestone(requestId, approved);

      await loadVerificationRequests();
      await loadMetrics();

      // Check if consensus was reached
      const consensus = await oracleService.calculateConsensus(requestId);
      if (consensus.consensusReached && onVerificationComplete) {
        onVerificationComplete(requestId, consensus.approved);
      }

      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit vote');
    } finally {
      setVotingStates(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.APPROVED:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case VerificationStatus.VOTING:
        return <Vote className="w-4 h-4 text-blue-600" />;
      case VerificationStatus.CONSENSUS_REACHED:
        return <Target className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const variants = {
      [VerificationStatus.APPROVED]: "default",
      [VerificationStatus.REJECTED]: "destructive",
      [VerificationStatus.VOTING]: "secondary",
      [VerificationStatus.CONSENSUS_REACHED]: "default",
      [VerificationStatus.PENDING]: "secondary"
    } as const;

    return (
      <Badge variant={variants[status] || "secondary"}>
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const renderVerificationRequest = (request: VerificationRequest, index: number) => {
    const status = oracleService.getVerificationStatus(request);
    const isVoting = votingStates[request.requestId];
    const canVote = isCurrentUserOracle && status === VerificationStatus.VOTING;

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Request #{request.requestId}
          </CardTitle>
          {getStatusBadge(status)}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Campaign:</span>
                <p className="text-gray-600">#{request.campaignId}</p>
              </div>
              <div>
                <span className="font-medium">Milestone:</span>
                <p className="text-gray-600">#{request.milestoneIndex}</p>
              </div>
            </div>

            <div className="text-sm">
              <span className="font-medium">IPFS Hash:</span>
              <p className="text-gray-600 font-mono text-xs break-all">{request.ipfsHash}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Approvals:</span>
                <p className="text-green-600">{request.approvalCount}</p>
              </div>
              <div>
                <span className="font-medium">Rejections:</span>
                <p className="text-red-600">{request.rejectionCount}</p>
              </div>
            </div>

            {request.approvalCount + request.rejectionCount > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Consensus Progress</span>
                  <span>{request.approvalCount}/{request.approvalCount + request.rejectionCount} votes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(request.approvalCount / (request.approvalCount + request.rejectionCount)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}

            {canVote && (
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(request.requestId, true)}
                  disabled={isVoting}
                  className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
                >
                  {isVoting ? 'Voting...' : 'Approve'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(request.requestId, false)}
                  disabled={isVoting}
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isVoting ? 'Voting...' : 'Reject'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !isInitialized) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing Oracle Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Oracles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.activeOracles}</div>
            <p className="text-xs text-muted-foreground">
              of {performanceMetrics.totalOracles} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.averageAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Network reliability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consensus Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.consensusRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Successful decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Votes</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verificationStats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Oracle Status */}
      {currentUserAddress && (
        <Card className={isCurrentUserOracle ? "bg-green-50" : "bg-gray-50"}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className={`w-5 h-5 mr-2 ${isCurrentUserOracle ? 'text-green-600' : 'text-gray-600'}`} />
                <span className="font-medium">
                  {isCurrentUserOracle ? 'You are an Oracle' : 'You are not an Oracle'}
                </span>
              </div>
              {isCurrentUserOracle && (
                <Badge variant="default">
                  <Activity className="w-3 h-3 mr-1" />
                  {pendingVotes.length} pending votes
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Verification Requests</TabsTrigger>
          <TabsTrigger value="oracles">Oracle Network</TabsTrigger>
          <TabsTrigger value="submit">Submit Request</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Milestone Verification Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {verificationRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No verification requests found
                </div>
              ) : (
                <div className="space-y-4">
                  {verificationRequests.map((request, index) => renderVerificationRequest(request, index))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oracles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Oracle Network Members</CardTitle>
            </CardHeader>
            <CardContent>
              {oracles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No oracles found
                </div>
              ) : (
                <div className="space-y-4">
                  {oracles.map((oracle, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm">{oracle.address}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant={oracle.isActive ? "default" : "secondary"}>
                              {oracle.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {currentUserAddress === oracle.address && (
                              <Badge variant="outline">You</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Reputation:</span>
                            <p className="text-blue-600">{oracle.reputation}</p>
                          </div>
                          <div>
                            <span className="font-medium">Accuracy:</span>
                            <p className="text-green-600">{oracle.accuracy.toFixed(1)}%</p>
                          </div>
                          <div>
                            <span className="font-medium">Total Votes:</span>
                            <p className="text-gray-600">{oracle.totalVotes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit Verification Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign ID</label>
                  <input
                    type="number"
                    value={newRequestForm.campaignId}
                    onChange={(e) => setNewRequestForm(prev => ({ ...prev, campaignId: e.target.value }))}
                    placeholder="Campaign ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Milestone Index</label>
                  <input
                    type="number"
                    value={newRequestForm.milestoneIndex}
                    onChange={(e) => setNewRequestForm(prev => ({ ...prev, milestoneIndex: e.target.value }))}
                    placeholder="Milestone Index"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">IPFS Hash (Proof Documents)</label>
                <input
                  type="text"
                  value={newRequestForm.ipfsHash}
                  onChange={(e) => setNewRequestForm(prev => ({ ...prev, ipfsHash: e.target.value }))}
                  placeholder="QmXXXXXX..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleSubmitVerificationRequest}
                disabled={newRequestForm.submitting || !newRequestForm.campaignId || !newRequestForm.milestoneIndex || !newRequestForm.ipfsHash}
                className="w-full"
              >
                {newRequestForm.submitting ? 'Submitting...' : 'Submit Verification Request'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Approved:</span>
                  <span className="text-green-600 font-medium">{verificationStats.approvedRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rejected:</span>
                  <span className="text-red-600 font-medium">{verificationStats.rejectedRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="text-yellow-600 font-medium">{verificationStats.pendingRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Time:</span>
                  <span className="text-blue-600 font-medium">{verificationStats.averageConsensusTime}h</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Verifications:</span>
                  <span className="font-medium">{performanceMetrics.totalVerifications}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Accuracy:</span>
                  <span className="text-green-600 font-medium">{performanceMetrics.averageAccuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Reputation:</span>
                  <span className="text-blue-600 font-medium">{performanceMetrics.averageReputation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Success:</span>
                  <span className="text-purple-600 font-medium">{performanceMetrics.consensusRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OracleNetwork;