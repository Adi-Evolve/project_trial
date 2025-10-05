import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { errorHandler } from './errorHandler';
// This file is deprecated. All blockchain/web3 logic removed. Use Supabase for all storage and logic.
// Smart contract ABI for project funding
export const PROJECT_FUNDING_ABI = [
  {
    "inputs": [
      {
        "internalType": "address payable",
        "name": "_feeRecipient",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "donor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "DonationMade",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "ProjectCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "projectId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "name": "ProjectStatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_deadline",
        "type": "uint256"
      }
    ],
    "name": "createProject",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      }
    ],
    "name": "donate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      }
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      }
    ],
    "name": "getProject",
    "outputs": [
      {
        "internalType": "address",
        "name": "creator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "targetAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "raisedAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "fundsWithdrawn",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_projectId",
        "type": "string"
      }
    ],
    "name": "getProjectDonations",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "donor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "message",
            "type": "string"
          }
        ],
        "internalType": "struct ProjectFunding.Donation[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Sepolia testnet configuration
export const SEPOLIA_CONFIG = {
  chainId: '0xaa36a7', // 11155111 in hex
  chainName: 'Sepolia Testnet',
  nativeCurrency: {
    name: 'SepoliaETH',
    symbol: 'SEP',
    decimals: 18,
  },
  rpcUrls: [
    'https://sepolia.infura.io/v3/', // You'll need to add your Infura project ID
    'https://rpc.sepolia.org',
    'https://rpc2.sepolia.org',
    'https://rpc.sepolia.dev'
  ],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

// Contract address on Sepolia (you'll need to deploy and update this)
export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '';

export interface DonationEvent {
  projectId: string;
  donor: string;
  amount: string;
  message: string;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface ProjectData {
  creator: string;
  targetAmount: string;
  raisedAmount: string;
  deadline: number;
  isActive: boolean;
  fundsWithdrawn: boolean;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  gasUsed: number;
  status: boolean;
  from: string;
  to: string;
}

class Web3Service {
  private web3: Web3 | null = null;
  private contract: Contract<typeof PROJECT_FUNDING_ABI> | null = null;
  private account: string | null = null;

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.web3 = new Web3(window.ethereum);
      this.initializeContract();
    } else {
      console.warn('MetaMask not detected. Please install MetaMask.');
    }
  }

  private initializeContract() {
    if (this.web3 && CONTRACT_ADDRESS) {
      this.contract = new this.web3.eth.Contract(PROJECT_FUNDING_ABI, CONTRACT_ADDRESS);
    }
  }

  async connectWallet(): Promise<{ success: boolean; account?: string; error?: string }> {
    const context = errorHandler.createContext('connectWallet', 'Web3Service');
    
    try {
      if (!window.ethereum) {
        const error = {
          code: 'no_metamask',
          message: 'MetaMask extension not detected'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log('🔗 Attempting to connect to MetaMask...');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        const error = {
          code: 'no_accounts',
          message: 'No accounts available'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      this.account = accounts[0];
      console.log('✅ Connected to account:', this.account);

      // Check if we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log('🌐 Current network:', chainId);
      
      if (chainId !== SEPOLIA_CONFIG.chainId) {
        console.log('🔄 Switching to Sepolia network...');
        
        // Try to switch to Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CONFIG.chainId }],
          });
          console.log('✅ Successfully switched to Sepolia');
        } catch (switchError: any) {
          console.log('📡 Network switch error:', switchError);
          
          // If the chain doesn't exist, add it
          if (switchError.code === 4902) {
            console.log('➕ Adding Sepolia network to MetaMask...');
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SEPOLIA_CONFIG],
            });
            console.log('✅ Sepolia network added successfully');
          } else {
            throw switchError;
          }
        }
      } else {
        console.log('✅ Already on Sepolia network');
      }

      return { success: true, account: this.account || undefined };
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  async getAccount(): Promise<string | null> {
    if (this.account) return this.account;

    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          this.account = accounts[0];
          return this.account;
        }
      }
    } catch (error) {
      console.error('Failed to get account:', error);
    }
    return null;
  }

  async getBalance(address?: string): Promise<string> {
    if (!this.web3) throw new Error('Web3 not initialized');
    
    const targetAddress = address || this.account;
    if (!targetAddress) throw new Error('No address provided');

    const balance = await this.web3.eth.getBalance(targetAddress);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  async createProject(
    projectId: string,
    targetAmountEth: string,
    deadline: Date
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Contract or account not available');
      }

      const targetAmountWei = this.web3!.utils.toWei(targetAmountEth, 'ether');
      const deadlineTimestamp = Math.floor(deadline.getTime() / 1000);

      const tx = await this.contract.methods
        .createProject(projectId, targetAmountWei, deadlineTimestamp)
        .send({ from: this.account });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error: any) {
      console.error('Failed to create project:', error);
      return { success: false, error: error.message || 'Failed to create project' };
    }
  }

  async donate(
    projectId: string,
    amountEth: string,
    message: string = ''
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const context = errorHandler.createContext('donate', 'Web3Service', 
      `projectId: ${projectId}, amount: ${amountEth} ETH`);
    
    try {
      if (!this.contract || !this.account) {
        const error = {
          code: 'service_not_ready',
          message: 'Web3 service not properly initialized'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log('💰 Starting donation process...');
      console.log(`📊 Project: ${projectId}, Amount: ${amountEth} ETH`);

      // First, verify the project exists and is valid
      console.log('🔍 Verifying project exists on blockchain...');
      const projectData = await this.getProject(projectId);
      
      if (!projectData) {
        console.log('❌ Project not found on blockchain');
        const error = {
          code: 'project_not_found',
          message: `Project ${projectId} does not exist on the blockchain. Please ensure the project has been created first.`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log('✅ Project found on blockchain:', {
        creator: projectData.creator,
        targetAmount: projectData.targetAmount + ' ETH',
        raisedAmount: projectData.raisedAmount + ' ETH',
        deadline: new Date(projectData.deadline * 1000).toISOString(),
        isActive: projectData.isActive,
        fundsWithdrawn: projectData.fundsWithdrawn
      });

      // Check if project is active
      if (!projectData.isActive) {
        console.log('❌ Project is not active');
        const error = {
          code: 'project_inactive',
          message: 'This project is no longer accepting donations as it has been deactivated.'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      // Check if deadline has passed
      const currentTime = Math.floor(Date.now() / 1000);
      if (projectData.deadline && currentTime > projectData.deadline) {
        console.log('❌ Project deadline has passed');
        const error = {
          code: 'project_expired',
          message: `This project's funding deadline has passed on ${new Date(projectData.deadline * 1000).toLocaleDateString()}.`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      const amountWei = this.web3!.utils.toWei(amountEth, 'ether');
      console.log(`💎 Amount in Wei: ${amountWei}`);

      // Check user balance before transaction
      const balanceWei = await this.web3!.eth.getBalance(this.account);
      const balanceEth = this.web3!.utils.fromWei(balanceWei, 'ether');
      console.log(`💳 Current balance: ${balanceEth} ETH`);

      if (parseFloat(balanceEth) < parseFloat(amountEth)) {
        const error = {
          code: 'insufficient_funds',
          message: `Insufficient balance. Required: ${amountEth} ETH, Available: ${balanceEth} ETH`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log('🚀 Sending donation transaction...');

      const tx = await this.contract.methods
        .donate(projectId, message)
        .send({ 
          from: this.account,
          value: amountWei
        });

      console.log('✅ Donation successful!');
      console.log(`🔗 Transaction hash: ${tx.transactionHash}`);

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error: any) {
      console.error('❌ Donation failed:', error);
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  async withdrawFunds(projectId: string): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.account) {
        throw new Error('Contract or account not available');
      }

      const tx = await this.contract.methods
        .withdrawFunds(projectId)
        .send({ from: this.account });

      return { success: true, transactionHash: tx.transactionHash };
    } catch (error: any) {
      console.error('Failed to withdraw funds:', error);
      return { success: false, error: error.message || 'Failed to withdraw funds' };
    }
  }

  async getProject(projectId: string): Promise<ProjectData | null> {
    try {
      if (!this.contract) {
        throw new Error('Contract not available');
      }

      const result = await this.contract.methods.getProject(projectId).call();
      
      return {
        creator: result.creator,
        targetAmount: this.web3!.utils.fromWei(result.targetAmount, 'ether'),
        raisedAmount: this.web3!.utils.fromWei(result.raisedAmount, 'ether'),
        deadline: Number(result.deadline),
        isActive: result.isActive,
        fundsWithdrawn: result.fundsWithdrawn,
      };
    } catch (error: any) {
      console.error('Failed to get project:', error);
      return null;
    }
  }

  async getProjectDonations(projectId: string): Promise<DonationEvent[]> {
    try {
      if (!this.contract) {
        throw new Error('Contract not available');
      }

      const donations = await this.contract.methods.getProjectDonations(projectId).call();
      
      return donations.map((donation: any) => ({
        projectId,
        donor: donation.donor,
        amount: this.web3!.utils.fromWei(donation.amount, 'ether'),
        message: donation.message,
        timestamp: Number(donation.timestamp),
        transactionHash: '',
        blockNumber: 0,
      }));
    } catch (error: any) {
      console.error('Failed to get project donations:', error);
      return [];
    }
  }

  async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    try {
      if (!this.web3) throw new Error('Web3 not initialized');

      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      if (!receipt) return null;

      return {
        transactionHash: receipt.transactionHash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
        status: Boolean(receipt.status),
        from: receipt.from,
        to: receipt.to || '',
      };
    } catch (error: any) {
      console.error('Failed to get transaction receipt:', error);
      return null;
    }
  }

  // Listen for donation events
  subscribeToDonationEvents(
    projectId: string,
    callback: (event: DonationEvent) => void
  ): (() => void) | null {
    try {
      if (!this.contract) {
        throw new Error('Contract not available');
      }

      const eventFilter = this.contract.events.DonationMade({
        filter: { projectId },
        fromBlock: 'latest'
      });

      eventFilter.on('data', (event: any) => {
        const donationEvent: DonationEvent = {
          projectId: event.returnValues.projectId,
          donor: event.returnValues.donor,
          amount: this.web3!.utils.fromWei(event.returnValues.amount, 'ether'),
          message: event.returnValues.message,
          timestamp: Number(event.returnValues.timestamp),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
        };
        callback(donationEvent);
      });

      // Return unsubscribe function
      return () => {
        eventFilter.unsubscribe();
      };
    } catch (error: any) {
      console.error('Failed to subscribe to donation events:', error);
      return null;
    }
  }

  // Utility methods
  isValidAddress(address: string): boolean {
    if (!this.web3) return false;
    return this.web3.utils.isAddress(address);
  }

  toWei(amount: string, unit: 'ether' | 'gwei' | 'wei' = 'ether'): string {
    if (!this.web3) throw new Error('Web3 not initialized');
    return this.web3.utils.toWei(amount, unit);
  }

  fromWei(amount: string, unit: 'ether' | 'gwei' | 'wei' = 'ether'): string {
    if (!this.web3) throw new Error('Web3 not initialized');
    return this.web3.utils.fromWei(amount, unit);
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async estimateGas(
    projectId: string,
    amountEth: string,
    message: string = ''
  ): Promise<{ gasEstimate: number; gasPriceGwei: string; totalCostEth: string }> {
    try {
      if (!this.contract || !this.account || !this.web3) {
        throw new Error('Contract, account, or web3 not available');
      }

      const amountWei = this.web3.utils.toWei(amountEth, 'ether');
      
      const gasEstimate = await this.contract.methods
        .donate(projectId, message)
        .estimateGas({ 
          from: this.account,
          value: amountWei
        });

      const gasPrice = await this.web3.eth.getGasPrice();
      const gasPriceGwei = this.web3.utils.fromWei(gasPrice, 'gwei');
      const totalCostWei = BigInt(gasEstimate) * BigInt(gasPrice);
      const totalCostEth = this.web3.utils.fromWei(totalCostWei.toString(), 'ether');

      return {
        gasEstimate: Number(gasEstimate),
        gasPriceGwei,
        totalCostEth,
      };
    } catch (error: any) {
      console.error('Failed to estimate gas:', error);
      throw error;
    }
  }

  /**
   * Send direct ETH transfer (for testing purposes)
   */
  async sendDirectTransfer(
    to: string,
    amountEth: string
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const context = errorHandler.createContext('sendDirectTransfer', 'Web3Service', 
      `to: ${to}, amount: ${amountEth} ETH`);
    
    try {
      if (!this.web3 || !this.account) {
        const error = {
          code: 'service_not_ready',
          message: 'Web3 service not properly initialized'
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      console.log('🔄 Starting direct ETH transfer...');
      console.log(`📤 From: ${this.account}`);
      console.log(`📥 To: ${to}`);
      console.log(`💰 Amount: ${amountEth} ETH`);

      // Validate recipient address
      if (!this.web3.utils.isAddress(to)) {
        const error = {
          code: 'invalid_address',
          message: `Invalid recipient address: ${to}`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }

      const amountWei = this.web3.utils.toWei(amountEth, 'ether');
      console.log(`💎 Amount in Wei: ${amountWei}`);

      // Check user balance before transaction
      const balanceWei = await this.web3.eth.getBalance(this.account);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      console.log(`💳 Current balance: ${balanceEth} ETH`);

      if (parseFloat(balanceEth) < parseFloat(amountEth)) {
        const error = {
          code: 'insufficient_funds',
          message: `Insufficient balance. Required: ${amountEth} ETH, Available: ${balanceEth} ETH`
        };
        const errorDetails = errorHandler.handleError(error, context);
        return { success: false, error: errorDetails.userMessage };
      }
      
      console.log('⛽ Estimating gas...');
      // Estimate gas
      const gasEstimate = await this.web3.eth.estimateGas({
        from: this.account,
        to: to,
        value: amountWei
      });

      const gasWithBuffer = Math.floor(Number(gasEstimate) * 1.2);
      console.log(`⛽ Gas estimate: ${gasEstimate}, with buffer: ${gasWithBuffer}`);

      console.log('🚀 Sending transaction...');
      // Send transaction
      const receipt = await this.web3.eth.sendTransaction({
        from: this.account,
        to: to,
        value: amountWei,
        gas: gasWithBuffer // Add 20% buffer
      });

      console.log('✅ Direct transfer successful!');
      console.log(`🔗 Transaction hash: ${receipt.transactionHash}`);

      return { 
        success: true, 
        transactionHash: receipt.transactionHash?.toString() || ''
      };
    } catch (error: any) {
      console.error('❌ Direct transfer failed:', error);
      const errorDetails = errorHandler.handleError(error, context);
      return { success: false, error: errorDetails.userMessage };
    }
  }

  /**
   * Helper method to convert Wei to Ether
   */
  convertWeiToEth(weiAmount: string): string {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    return this.web3.utils.fromWei(weiAmount, 'ether');
  }

  /**
   * Helper method to convert Ether to Wei
   */
  convertEthToWei(ethAmount: string): string {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    return this.web3.utils.toWei(ethAmount, 'ether');
  }

}

// Export singleton instance
export const web3Service = new Web3Service();

declare global {
  interface Window {
    ethereum?: any;
  }
}