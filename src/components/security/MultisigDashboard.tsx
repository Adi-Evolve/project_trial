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
  multisigWalletService, 
  MultisigTransaction, 
  MultisigWalletInfo 
} from '../../services/multisigWallet';
import { advancedContractService } from '../../services/advancedContracts';
import { Wallet, Users, Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface MultisigDashboardProps {
  className?: string;
}

export const MultisigDashboard: React.FC<MultisigDashboardProps> = ({ className }) => {
  const [walletInfo, setWalletInfo] = useState<MultisigWalletInfo | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<MultisigTransaction[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);

  // New transaction form state
  const [newTxForm, setNewTxForm] = useState({
    destination: '',
    amount: '',
    data: '0x',
    type: 'transfer' as 'transfer' | 'contract' | 'emergency'
  });

  useEffect(() => {
    initializeMultisig();
    setupEventListeners();
    
    return () => {
      multisigWalletService.removeAllListeners();
    };
  }, []);

  const initializeMultisig = async () => {
    try {
      setLoading(true);
      await multisigWalletService.initialize();
      
      const [info, pending, ownerStatus] = await Promise.all([
        multisigWalletService.getWalletInfo(),
        multisigWalletService.getPendingTransactions(),
        multisigWalletService.getCurrentOwnerStatus()
      ]);

      setWalletInfo(info);
      setPendingTransactions(pending);
      setIsOwner(ownerStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize multisig');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    multisigWalletService.onTransactionSubmission((transactionId) => {
      refreshData();
    });

    multisigWalletService.onTransactionConfirmation((sender, transactionId) => {
      refreshData();
    });

    multisigWalletService.onTransactionExecution((transactionId) => {
      refreshData();
    });
  };

  const refreshData = async () => {
    try {
      const [info, pending] = await Promise.all([
        multisigWalletService.getWalletInfo(),
        multisigWalletService.getPendingTransactions()
      ]);
      setWalletInfo(info);
      setPendingTransactions(pending);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  const handleSubmitTransaction = async () => {
    if (!isOwner) {
      setError('Only wallet owners can submit transactions');
      return;
    }

    try {
      setLoading(true);
      const { txHash, transactionId } = await multisigWalletService.submitTransaction(
        newTxForm.destination,
        newTxForm.amount,
        newTxForm.data
      );

      setNewTxForm({
        destination: '',
        amount: '',
        data: '0x',
        type: 'transfer'
      });

      await refreshData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransaction = async (transactionId: number) => {
    if (!isOwner) return;
    
    try {
      await multisigWalletService.confirmTransaction(transactionId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm transaction');
    }
  };

  const handleExecuteTransaction = async (transactionId: number) => {
    if (!isOwner) return;
    
    try {
      await multisigWalletService.executeTransaction(transactionId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute transaction');
    }
  };

  const handleRevokeConfirmation = async (transactionId: number) => {
    if (!isOwner) return;
    
    try {
      await multisigWalletService.revokeConfirmation(transactionId);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke confirmation');
    }
  };

  const handleEmergencyPause = async () => {
    if (!isOwner) return;
    
    const contractAddress = process.env.REACT_APP_CROWDFUNDING_CONTRACT_ADDRESS;
    if (!contractAddress) {
      setError('Contract address not configured');
      return;
    }

    try {
      const { txHash, transactionId } = await multisigWalletService.submitEmergencyPause(contractAddress);
      await refreshData();
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit emergency pause');
    }
  };

  const renderTransactionCard = (tx: MultisigTransaction, index: number) => {
    const canExecute = tx.confirmations >= tx.requiredConfirmations && !tx.executed;
    const progress = (tx.confirmations / tx.requiredConfirmations) * 100;

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Transaction #{tx.nonce}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {tx.executed ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Executed
              </Badge>
            ) : canExecute ? (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">To:</span>
                <p className="text-gray-600 font-mono text-xs break-all">{tx.to}</p>
              </div>
              <div>
                <span className="font-medium">Amount:</span>
                <p className="text-gray-900">{tx.value} ETH</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Confirmations</span>
                <span>{tx.confirmations}/{tx.requiredConfirmations}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {isOwner && !tx.executed && (
              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleConfirmTransaction(tx.nonce)}
                  className="flex-1"
                >
                  Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRevokeConfirmation(tx.nonce)}
                  className="flex-1"
                >
                  Revoke
                </Button>
                {canExecute && (
                  <Button
                    size="sm"
                    onClick={() => handleExecuteTransaction(tx.nonce)}
                    className="flex-1"
                  >
                    Execute
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && !walletInfo) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading multisig wallet...</p>
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

      {/* Wallet Overview */}
      {walletInfo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletInfo.balance} ETH</div>
              <p className="text-xs text-muted-foreground">
                Secure multisig funds
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walletInfo.owners.length}</div>
              <p className="text-xs text-muted-foreground">
                {walletInfo.requiredConfirmations} of {walletInfo.owners.length} required
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Transactions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting confirmations
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="submit">Submit Transaction</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending transactions
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTransactions.map((tx, index) => renderTransactionCard(tx, index))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submit New Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              {!isOwner ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Only wallet owners can submit transactions
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction Type</label>
                    <select
                      value={newTxForm.type}
                      onChange={(e) => setNewTxForm(prev => ({ 
                        ...prev, 
                        type: e.target.value as 'transfer' | 'contract' | 'emergency'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="transfer">ETH Transfer</option>
                      <option value="contract">Contract Interaction</option>
                      <option value="emergency">Emergency Action</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Destination Address</label>
                    <input
                      type="text"
                      value={newTxForm.destination}
                      onChange={(e) => setNewTxForm(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.001"
                      value={newTxForm.amount}
                      onChange={(e) => setNewTxForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {newTxForm.type === 'contract' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Transaction Data</label>
                      <textarea
                        value={newTxForm.data}
                        onChange={(e) => setNewTxForm(prev => ({ ...prev, data: e.target.value }))}
                        placeholder="0x..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleSubmitTransaction}
                    disabled={loading || !newTxForm.destination || !newTxForm.amount}
                    className="w-full"
                  >
                    {loading ? 'Submitting...' : 'Submit Transaction'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {!isOwner ? (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Only wallet owners can perform emergency actions
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Emergency actions require multisig approval and should only be used in critical situations.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    variant="destructive"
                    onClick={handleEmergencyPause}
                    className="w-full"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Emergency Pause Platform
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Wallet Owners List */}
      {walletInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Wallet Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {walletInfo.owners.map((owner, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <span className="font-mono text-sm">{owner}</span>
                  {isOwner && owner.toLowerCase() === walletInfo.owners.find(o => o.toLowerCase() === owner.toLowerCase())?.toLowerCase() && (
                    <Badge variant="secondary">You</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MultisigDashboard;