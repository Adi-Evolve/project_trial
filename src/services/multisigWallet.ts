import { ethers } from 'ethers';

// Multisig wallet configuration
const MULTISIG_WALLET_ADDRESS = process.env.REACT_APP_MULTISIG_WALLET_ADDRESS;

export interface MultisigTransaction {
  to: string;
  value: string;
  data: string;
  executed: boolean;
  confirmations: number;
  requiredConfirmations: number;
  nonce: number;
  timestamp: number;
}

export interface MultisigWalletInfo {
  address: string;
  owners: string[];
  requiredConfirmations: number;
  transactionCount: number;
  balance: string;
}

class MultisigWalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  // Standard multisig wallet ABI - simplified for essential functions
  private multisigABI = [
    "function owners(uint256) view returns (address)",
    "function getOwners() view returns (address[])",
    "function required() view returns (uint256)",
    "function transactionCount() view returns (uint256)",
    "function transactions(uint256) view returns (address destination, uint256 value, bytes data, bool executed)",
    "function getConfirmationCount(uint256 transactionId) view returns (uint256)",
    "function getConfirmations(uint256 transactionId) view returns (address[])",
    "function isConfirmed(uint256 transactionId) view returns (bool)",
    "function submitTransaction(address destination, uint256 value, bytes data) returns (uint256)",
    "function confirmTransaction(uint256 transactionId)",
    "function revokeConfirmation(uint256 transactionId)",
    "function executeTransaction(uint256 transactionId)",
    "function isOwner(address owner) view returns (bool)",
    "event Submission(uint256 indexed transactionId)",
    "event Confirmation(address indexed sender, uint256 indexed transactionId)",
    "event Revocation(address indexed sender, uint256 indexed transactionId)",
    "event Execution(uint256 indexed transactionId)",
    "event ExecutionFailure(uint256 indexed transactionId)",
    "event Deposit(address indexed sender, uint256 value)"
  ];

  async initialize(): Promise<void> {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not found');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
  }

  private getMultisigContract(): ethers.Contract {
    if (!this.signer || !MULTISIG_WALLET_ADDRESS) {
      throw new Error('Multisig wallet not properly configured');
    }
    return new ethers.Contract(MULTISIG_WALLET_ADDRESS, this.multisigABI, this.signer);
  }

  async getWalletInfo(): Promise<MultisigWalletInfo> {
    const contract = this.getMultisigContract();
    
    const [owners, requiredConfirmations, transactionCount, balance] = await Promise.all([
      contract.getOwners(),
      contract.required(),
      contract.transactionCount(),
      this.provider!.getBalance(MULTISIG_WALLET_ADDRESS!)
    ]);

    return {
      address: MULTISIG_WALLET_ADDRESS!,
      owners,
      requiredConfirmations: Number(requiredConfirmations),
      transactionCount: Number(transactionCount),
      balance: ethers.formatEther(balance)
    };
  }

  async isOwner(address: string): Promise<boolean> {
    const contract = this.getMultisigContract();
    return await contract.isOwner(address);
  }

  async getCurrentOwnerStatus(): Promise<boolean> {
    const currentAddress = await this.signer!.getAddress();
    return await this.isOwner(currentAddress);
  }

  async submitTransaction(
    destination: string,
    value: string,
    data: string = '0x'
  ): Promise<{ txHash: string; transactionId: number }> {
    const contract = this.getMultisigContract();
    const valueWei = ethers.parseEther(value);
    
    const tx = await contract.submitTransaction(destination, valueWei, data);
    const receipt = await tx.wait();
    
    // Extract transaction ID from event logs
    const submissionEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === 'Submission';
      } catch {
        return false;
      }
    });

    let transactionId = 0;
    if (submissionEvent) {
      const parsed = contract.interface.parseLog(submissionEvent);
      transactionId = Number(parsed?.args.transactionId || 0);
    }

    return {
      txHash: tx.hash,
      transactionId
    };
  }

  async confirmTransaction(transactionId: number): Promise<string> {
    const contract = this.getMultisigContract();
    const tx = await contract.confirmTransaction(transactionId);
    return tx.hash;
  }

  async revokeConfirmation(transactionId: number): Promise<string> {
    const contract = this.getMultisigContract();
    const tx = await contract.revokeConfirmation(transactionId);
    return tx.hash;
  }

  async executeTransaction(transactionId: number): Promise<string> {
    const contract = this.getMultisigContract();
    const tx = await contract.executeTransaction(transactionId);
    return tx.hash;
  }

  async getTransaction(transactionId: number): Promise<MultisigTransaction> {
    const contract = this.getMultisigContract();
    
    const [transaction, confirmationCount, confirmations] = await Promise.all([
      contract.transactions(transactionId),
      contract.getConfirmationCount(transactionId),
      contract.getConfirmations(transactionId)
    ]);

    const requiredConfirmations = await contract.required();

    return {
      to: transaction.destination,
      value: ethers.formatEther(transaction.value),
      data: transaction.data,
      executed: transaction.executed,
      confirmations: Number(confirmationCount),
      requiredConfirmations: Number(requiredConfirmations),
      nonce: transactionId,
      timestamp: 0 // Would need additional contract storage for timestamp
    };
  }

  async getPendingTransactions(): Promise<MultisigTransaction[]> {
    const contract = this.getMultisigContract();
    const transactionCount = await contract.transactionCount();
    const transactions: MultisigTransaction[] = [];

    for (let i = 0; i < Number(transactionCount); i++) {
      const transaction = await this.getTransaction(i);
      if (!transaction.executed) {
        transactions.push(transaction);
      }
    }

    return transactions;
  }

  async getConfirmations(transactionId: number): Promise<string[]> {
    const contract = this.getMultisigContract();
    return await contract.getConfirmations(transactionId);
  }

  async isTransactionConfirmed(transactionId: number): Promise<boolean> {
    const contract = this.getMultisigContract();
    return await contract.isConfirmed(transactionId);
  }

  // Platform-specific methods for crowdfunding integration
  async submitPlatformFeeWithdrawal(amount: string): Promise<{ txHash: string; transactionId: number }> {
    // Submit transaction to withdraw platform fees to multisig wallet
    return await this.submitTransaction(
      MULTISIG_WALLET_ADDRESS!, // Send to self for approval workflow
      amount,
      '0x' // Simple ETH transfer
    );
  }

  async submitEmergencyPause(contractAddress: string): Promise<{ txHash: string; transactionId: number }> {
    // Create transaction data for emergency pause
    const emergencyPauseData = '0x853828b6'; // Function selector for emergencyPause()
    
    return await this.submitTransaction(
      contractAddress,
      '0', // No ETH value
      emergencyPauseData
    );
  }

  async submitContractUpgrade(
    contractAddress: string,
    newImplementation: string
  ): Promise<{ txHash: string; transactionId: number }> {
    // Create transaction data for contract upgrade (proxy pattern)
    const upgradeInterface = new ethers.Interface([
      "function upgrade(address newImplementation)"
    ]);
    
    const upgradeData = upgradeInterface.encodeFunctionData("upgrade", [newImplementation]);
    
    return await this.submitTransaction(
      contractAddress,
      '0',
      upgradeData
    );
  }

  async submitOwnershipTransfer(
    contractAddress: string,
    newOwner: string
  ): Promise<{ txHash: string; transactionId: number }> {
    // Create transaction data for ownership transfer
    const ownershipInterface = new ethers.Interface([
      "function transferOwnership(address newOwner)"
    ]);
    
    const transferData = ownershipInterface.encodeFunctionData("transferOwnership", [newOwner]);
    
    return await this.submitTransaction(
      contractAddress,
      '0',
      transferData
    );
  }

  // Event listeners for real-time updates
  onTransactionSubmission(callback: (transactionId: number) => void): void {
    const contract = this.getMultisigContract();
    contract.on('Submission', (transactionId) => {
      callback(Number(transactionId));
    });
  }

  onTransactionConfirmation(callback: (sender: string, transactionId: number) => void): void {
    const contract = this.getMultisigContract();
    contract.on('Confirmation', (sender, transactionId) => {
      callback(sender, Number(transactionId));
    });
  }

  onTransactionExecution(callback: (transactionId: number) => void): void {
    const contract = this.getMultisigContract();
    contract.on('Execution', (transactionId) => {
      callback(Number(transactionId));
    });
  }

  onTransactionRevocation(callback: (sender: string, transactionId: number) => void): void {
    const contract = this.getMultisigContract();
    contract.on('Revocation', (sender, transactionId) => {
      callback(sender, Number(transactionId));
    });
  }

  removeAllListeners(): void {
    const contract = this.getMultisigContract();
    contract.removeAllListeners();
  }

  // Utility methods
  async getWalletBalance(): Promise<string> {
    if (!this.provider || !MULTISIG_WALLET_ADDRESS) {
      throw new Error('Provider or multisig address not configured');
    }
    
    const balance = await this.provider.getBalance(MULTISIG_WALLET_ADDRESS);
    return ethers.formatEther(balance);
  }

  async estimateGas(
    destination: string,
    value: string,
    data: string = '0x'
  ): Promise<string> {
    const contract = this.getMultisigContract();
    const valueWei = ethers.parseEther(value);
    
    const estimatedGas = await contract.submitTransaction.estimateGas(destination, valueWei, data);
    return estimatedGas.toString();
  }
}

// Export singleton instance
export const multisigWalletService = new MultisigWalletService();
export default MultisigWalletService;