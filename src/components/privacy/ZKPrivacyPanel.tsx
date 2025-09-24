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
  zkPrivacyService, 
  ZKProofData, 
  ZKCommitmentInfo,
  ZKProofStatus 
} from '../../services/zkPrivacy';
import { advancedContractService } from '../../services/advancedContracts';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Users,
  BarChart3,
  Info
} from 'lucide-react';

interface ZKPrivacyPanelProps {
  campaignId?: number;
  onContributionSuccess?: (commitment: string) => void;
  className?: string;
}

export const ZKPrivacyPanel: React.FC<ZKPrivacyPanelProps> = ({
  campaignId,
  onContributionSuccess,
  className
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Anonymous contribution form
  const [contributionForm, setContributionForm] = useState({
    amount: '',
    secret: '',
    minAmount: '0.001',
    useTimeDelay: false,
    delayMinutes: 5
  });

  // Commitment verification
  const [verificationForm, setVerificationForm] = useState({
    commitment: '',
    result: null as boolean | null
  });

  // Batch contribution form
  const [batchForm, setBatchForm] = useState({
    totalAmount: '',
    numberOfContributions: 5,
    secret: '',
    executing: false,
    progress: 0
  });

  // Privacy metrics
  const [privacyMetrics, setPrivacyMetrics] = useState({
    commitmentCount: 0,
    totalZKPContributions: 0,
    averagePrivacyScore: 0,
    activeNullifiers: 0
  });

  // Generated proof data
  const [currentProof, setCurrentProof] = useState<ZKProofData | null>(null);
  const [proofStatus, setProofStatus] = useState<ZKProofStatus>(ZKProofStatus.PENDING);

  useEffect(() => {
    initializeZKP();
  }, []);

  const initializeZKP = async () => {
    try {
      setLoading(true);
      await zkPrivacyService.initialize();
      setIsInitialized(true);
      await loadPrivacyMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize ZKP system');
    } finally {
      setLoading(false);
    }
  };

  const loadPrivacyMetrics = async () => {
    try {
      // In a real implementation, these would come from the blockchain or backend
      setPrivacyMetrics({
        commitmentCount: Math.floor(Math.random() * 1000),
        totalZKPContributions: Math.floor(Math.random() * 500),
        averagePrivacyScore: 75 + Math.floor(Math.random() * 20),
        activeNullifiers: Math.floor(Math.random() * 800)
      });
    } catch (err) {
      console.error('Failed to load privacy metrics:', err);
    }
  };

  const generateZKProof = async () => {
    if (!campaignId || !contributionForm.amount || !contributionForm.secret) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setProofStatus(ZKProofStatus.PENDING);

      const proof = await zkPrivacyService.generateZKProof(
        contributionForm.amount,
        contributionForm.secret,
        campaignId,
        contributionForm.minAmount,
        '1000' // max amount
      );

      setCurrentProof(proof);
      setProofStatus(ZKProofStatus.VERIFIED);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate ZK proof');
      setProofStatus(ZKProofStatus.FAILED);
    } finally {
      setLoading(false);
    }
  };

  const makeAnonymousContribution = async () => {
    if (!campaignId || !currentProof) {
      setError('Please generate a ZK proof first');
      return;
    }

    try {
      setLoading(true);

      const result = await zkPrivacyService.makeAnonymousContribution(
        campaignId,
        contributionForm.amount,
        contributionForm.secret,
        contributionForm.minAmount
      );

      if (onContributionSuccess) {
        onContributionSuccess(result.commitment);
      }

      // Reset form
      setContributionForm({
        amount: '',
        secret: '',
        minAmount: '0.001',
        useTimeDelay: false,
        delayMinutes: 5
      });
      setCurrentProof(null);
      setProofStatus(ZKProofStatus.PENDING);

      await loadPrivacyMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make anonymous contribution');
    } finally {
      setLoading(false);
    }
  };

  const verifyCommitment = async () => {
    if (!verificationForm.commitment) {
      setError('Please enter a commitment to verify');
      return;
    }

    try {
      setLoading(true);
      const info = await zkPrivacyService.getCommitmentInfo(verificationForm.commitment);
      setVerificationForm(prev => ({ ...prev, result: info.isRegistered }));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify commitment');
    } finally {
      setLoading(false);
    }
  };

  const executeBatchContributions = async () => {
    if (!campaignId || !batchForm.totalAmount || !batchForm.secret) {
      setError('Please fill in all batch contribution fields');
      return;
    }

    try {
      setBatchForm(prev => ({ ...prev, executing: true, progress: 0 }));

      // Create anonymous pool
      const poolData = await zkPrivacyService.createAnonymousPool(
        campaignId,
        batchForm.totalAmount,
        batchForm.numberOfContributions,
        batchForm.secret
      );

      setBatchForm(prev => ({ ...prev, progress: 25 }));

      // Execute pool contributions
      const txHashes = await zkPrivacyService.executeAnonymousPool(poolData, campaignId);

      setBatchForm(prev => ({ ...prev, progress: 100 }));

      // Reset form
      setBatchForm({
        totalAmount: '',
        numberOfContributions: 5,
        secret: '',
        executing: false,
        progress: 0
      });

      await loadPrivacyMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute batch contributions');
    } finally {
      setBatchForm(prev => ({ ...prev, executing: false, progress: 0 }));
    }
  };

  const calculatePrivacyScore = () => {
    if (!contributionForm.amount) return 0;

    return zkPrivacyService.calculatePrivacyScore({
      amount: contributionForm.amount,
      isZKP: true,
      poolSize: batchForm.numberOfContributions,
      timeDelay: contributionForm.useTimeDelay ? contributionForm.delayMinutes * 60 : undefined
    });
  };

  if (loading && !isInitialized) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing ZK Privacy System...</p>
        </div>
      </div>
    );
  }

  const privacyScore = calculatePrivacyScore();

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Privacy Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commitments</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.commitmentCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered commitments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ZKP Contributions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.totalZKPContributions}</div>
            <p className="text-xs text-muted-foreground">
              Anonymous donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.averagePrivacyScore}%</div>
            <p className="text-xs text-muted-foreground">
              Average anonymity level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Nullifiers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{privacyMetrics.activeNullifiers}</div>
            <p className="text-xs text-muted-foreground">
              Unique participants
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contribute" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contribute">Anonymous Contribution</TabsTrigger>
          <TabsTrigger value="batch">Batch Contributions</TabsTrigger>
          <TabsTrigger value="verify">Verify Commitment</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="contribute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <EyeOff className="w-5 h-5 mr-2" />
                Anonymous Contribution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!campaignId ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Please select a campaign to make anonymous contributions
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Contribution Amount (ETH)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={contributionForm.amount}
                        onChange={(e) => setContributionForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Secret Phrase</label>
                      <input
                        type="password"
                        value={contributionForm.secret}
                        onChange={(e) => setContributionForm(prev => ({ ...prev, secret: e.target.value }))}
                        placeholder="Enter secret phrase"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Minimum Amount (ETH)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={contributionForm.minAmount}
                        onChange={(e) => setContributionForm(prev => ({ ...prev, minAmount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Privacy Score</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${privacyScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{privacyScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useTimeDelay"
                      checked={contributionForm.useTimeDelay}
                      onChange={(e) => setContributionForm(prev => ({ ...prev, useTimeDelay: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="useTimeDelay" className="text-sm">Use time delay for enhanced privacy</label>
                    {contributionForm.useTimeDelay && (
                      <input
                        type="number"
                        value={contributionForm.delayMinutes}
                        onChange={(e) => setContributionForm(prev => ({ ...prev, delayMinutes: parseInt(e.target.value) }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                        min="1"
                        max="60"
                      />
                    )}
                  </div>

                  {/* Current Proof Status */}
                  {currentProof && (
                    <Card className="bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">ZK Proof Generated</span>
                          <Badge variant={proofStatus === ZKProofStatus.VERIFIED ? "default" : "secondary"}>
                            {proofStatus === ZKProofStatus.VERIFIED && <CheckCircle className="w-3 h-3 mr-1" />}
                            {proofStatus === ZKProofStatus.FAILED && <XCircle className="w-3 h-3 mr-1" />}
                            {proofStatus === ZKProofStatus.PENDING && <Clock className="w-3 h-3 mr-1" />}
                            {proofStatus}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 font-mono break-all">
                          Commitment: {currentProof.commitment.slice(0, 20)}...
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      onClick={generateZKProof}
                      disabled={loading || !contributionForm.amount || !contributionForm.secret}
                      className="flex-1"
                    >
                      {loading ? 'Generating...' : 'Generate ZK Proof'}
                    </Button>
                    <Button
                      onClick={makeAnonymousContribution}
                      disabled={loading || !currentProof || proofStatus !== ZKProofStatus.VERIFIED}
                      className="flex-1"
                    >
                      {loading ? 'Contributing...' : 'Make Anonymous Contribution'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Batch Anonymous Contributions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Batch contributions increase privacy by creating multiple anonymous donations from a single source.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Total Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={batchForm.totalAmount}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Number of Contributions</label>
                  <input
                    type="number"
                    value={batchForm.numberOfContributions}
                    onChange={(e) => setBatchForm(prev => ({ ...prev, numberOfContributions: parseInt(e.target.value) }))}
                    min="2"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Master Secret</label>
                <input
                  type="password"
                  value={batchForm.secret}
                  onChange={(e) => setBatchForm(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="Enter master secret for batch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {batchForm.totalAmount && batchForm.numberOfContributions > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    Each contribution: {(parseFloat(batchForm.totalAmount) / batchForm.numberOfContributions).toFixed(4)} ETH
                  </p>
                  <p className="text-sm text-gray-600">
                    Enhanced privacy score: {zkPrivacyService.calculatePrivacyScore({
                      amount: batchForm.totalAmount,
                      isZKP: true,
                      poolSize: batchForm.numberOfContributions
                    })}%
                  </p>
                </div>
              )}

              {batchForm.executing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Executing batch contributions...</span>
                    <span>{batchForm.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${batchForm.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button
                onClick={executeBatchContributions}
                disabled={loading || batchForm.executing || !batchForm.totalAmount || !batchForm.secret || !campaignId}
                className="w-full"
              >
                {batchForm.executing ? 'Executing Batch...' : 'Execute Batch Contributions'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Verify Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Commitment Hash</label>
                <input
                  type="text"
                  value={verificationForm.commitment}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, commitment: e.target.value }))}
                  placeholder="0x..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {verificationForm.result !== null && (
                <Card className={verificationForm.result ? "bg-green-50" : "bg-red-50"}>
                  <CardContent className="pt-4">
                    <div className="flex items-center">
                      {verificationForm.result ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <span className="font-medium">
                        {verificationForm.result ? 'Commitment is valid and registered' : 'Commitment not found or invalid'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={verifyCommitment}
                disabled={loading || !verificationForm.commitment}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Commitment'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy Tools & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Zero-Knowledge Proofs</h4>
                    <p className="text-sm text-gray-600">
                      Prove you have funds without revealing the exact amount or your identity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Commitment Schemes</h4>
                    <p className="text-sm text-gray-600">
                      Lock in your contribution details while keeping them hidden until revelation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Nullifier Protection</h4>
                    <p className="text-sm text-gray-600">
                      Prevent double-spending while maintaining complete anonymity.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-2">Privacy Pools</h4>
                    <p className="text-sm text-gray-600">
                      Mix your contributions with others for enhanced anonymity.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Tips:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Use different secrets for each contribution</li>
                    <li>Consider using batch contributions for larger amounts</li>
                    <li>Enable time delays to further obscure patterns</li>
                    <li>Keep your secret phrases secure and never share them</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZKPrivacyPanel;