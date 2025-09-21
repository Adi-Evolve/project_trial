import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

// Smart contract ABI for project and idea registration
const PROJECT_REGISTRY_ABI = [
  "function registerProject(string memory projectId, string memory metadataHash, address owner) public returns (uint256)",
  "function registerIdea(string memory ideaId, string memory metadataHash, address owner) public returns (uint256)",
  "function getProjectOwner(string memory projectId) public view returns (address)",
  "function getIdeaOwner(string memory ideaId) public view returns (address)",
  "function verifyOwnership(string memory itemId, address claimedOwner) public view returns (bool)",
  "event ProjectRegistered(string indexed projectId, address indexed owner, uint256 timestamp)",
  "event IdeaRegistered(string indexed ideaId, address indexed owner, uint256 timestamp)"
];

// Mock contract address - in production, deploy a real smart contract
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || '0x742d35Cc67dE6F3e6C4f64Be3fA3f2c2e4F1234A';

interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  gasUsed?: string;
  gasPrice?: string;
}

interface MetadataHash {
  hash: string;
  algorithm: 'sha256' | 'keccak256';
}

class BlockchainService {
  private provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        // Fallback to a public RPC provider for read-only operations
        this.provider = new ethers.JsonRpcProvider(
          process.env.REACT_APP_WEB3_PROVIDER_URL || 'https://polygon-mumbai.g.alchemy.com/v2/demo'
        );
      }
    } catch (error) {
      console.error('Failed to initialize provider:', error);
    }
  }

  // Check if MetaMask or another Web3 wallet is available
  isWeb3Available(): boolean {
    return typeof window !== 'undefined' && !!window.ethereum;
  }

  // Connect to user's wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (!this.isWeb3Available()) {
        toast.error('Please install MetaMask or another Web3 wallet');
        return null;
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.signer = await this.provider!.getSigner();
      const address = await this.signer.getAddress();
      
      // Initialize contract with signer
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_REGISTRY_ABI, this.signer);
      
      toast.success('Wallet connected successfully!');
      return address;
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
      return null;
    }
  }

  // Get current connected wallet address
  async getCurrentAccount(): Promise<string | null> {
    try {
      if (!this.provider) return null;
      
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0 ? accounts[0].address : null;
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  // Create metadata hash for blockchain storage
  private createMetadataHash(data: any): MetadataHash {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    const hash = ethers.keccak256(ethers.toUtf8Bytes(jsonString));
    return {
      hash,
      algorithm: 'keccak256'
    };
  }

  // Register a project on the blockchain
  async registerProject(projectData: {
    id: string;
    title: string;
    description: string;
    author: string;
    timestamp: string;
    category: string;
    tags: string[];
  }): Promise<BlockchainRecord | null> {
    try {
      if (!this.contract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      const metadataHash = this.createMetadataHash(projectData);
      const ownerAddress = await this.signer!.getAddress();

      toast.loading('Registering project on blockchain...', { id: 'blockchain-tx' });

      const tx = await this.contract!.registerProject(
        projectData.id,
        metadataHash.hash,
        ownerAddress
      );

      const receipt = await tx.wait();
      
      toast.success('Project registered on blockchain!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error: any) {
      console.error('Failed to register project:', error);
      toast.error(error.message || 'Failed to register project on blockchain', { id: 'blockchain-tx' });
      return null;
    }
  }

  // Register an idea on the blockchain for ownership protection
  async registerIdea(ideaData: {
    id: string;
    title: string;
    description: string;
    author: string;
    timestamp: string;
    category: string;
    tags: string[];
  }): Promise<BlockchainRecord | null> {
    try {
      if (!this.contract || !this.signer) {
        const connected = await this.connectWallet();
        if (!connected) return null;
      }

      const metadataHash = this.createMetadataHash(ideaData);
      const ownerAddress = await this.signer!.getAddress();

      toast.loading('Protecting idea ownership on blockchain...', { id: 'blockchain-tx' });

      const tx = await this.contract!.registerIdea(
        ideaData.id,
        metadataHash.hash,
        ownerAddress
      );

      const receipt = await tx.wait();
      
      toast.success('Idea ownership protected on blockchain!', { id: 'blockchain-tx' });

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };
    } catch (error: any) {
      console.error('Failed to register idea:', error);
      toast.error(error.message || 'Failed to protect idea on blockchain', { id: 'blockchain-tx' });
      return null;
    }
  }

  // Verify ownership of a project or idea
  async verifyOwnership(itemId: string, claimedOwner: string): Promise<boolean> {
    try {
      if (!this.contract) {
        // Initialize read-only contract for verification
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_REGISTRY_ABI, this.provider);
      }

      const isOwner = await this.contract.verifyOwnership(itemId, claimedOwner);
      return isOwner;
    } catch (error) {
      console.error('Failed to verify ownership:', error);
      return false;
    }
  }

  // Get project owner from blockchain
  async getProjectOwner(projectId: string): Promise<string | null> {
    try {
      if (!this.contract) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_REGISTRY_ABI, this.provider);
      }

      const owner = await this.contract.getProjectOwner(projectId);
      return owner !== ethers.ZeroAddress ? owner : null;
    } catch (error) {
      console.error('Failed to get project owner:', error);
      return null;
    }
  }

  // Get idea owner from blockchain
  async getIdeaOwner(ideaId: string): Promise<string | null> {
    try {
      if (!this.contract) {
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, PROJECT_REGISTRY_ABI, this.provider);
      }

      const owner = await this.contract.getIdeaOwner(ideaId);
      return owner !== ethers.ZeroAddress ? owner : null;
    } catch (error) {
      console.error('Failed to get idea owner:', error);
      return null;
    }
  }

  // Get transaction details
  async getTransactionDetails(txHash: string): Promise<any> {
    try {
      if (!this.provider) return null;

      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt,
        confirmations: receipt?.confirmations || 0
      };
    } catch (error) {
      console.error('Failed to get transaction details:', error);
      return null;
    }
  }

  // Get current network information
  async getNetworkInfo(): Promise<any> {
    try {
      if (!this.provider) return null;

      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
        ensAddress: (network as any).ensAddress || null
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  // Switch to the correct network if needed
  async switchToCorrectNetwork(chainId: number = 80001): Promise<boolean> {
    try {
      if (!this.isWeb3Available()) return false;

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });

      return true;
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        return await this.addNetwork(chainId);
      }
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  // Add a new network to the user's wallet
  private async addNetwork(chainId: number): Promise<boolean> {
    try {
      const networkConfigs: { [key: number]: any } = {
        80001: {
          chainId: '0x13881',
          chainName: 'Mumbai Testnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
          blockExplorerUrls: ['https://mumbai.polygonscan.com/'],
        },
        137: {
          chainId: '0x89',
          chainName: 'Polygon Mainnet',
          nativeCurrency: {
            name: 'MATIC',
            symbol: 'MATIC',
            decimals: 18,
          },
          rpcUrls: ['https://polygon-rpc.com/'],
          blockExplorerUrls: ['https://polygonscan.com/'],
        }
      };

      const config = networkConfigs[chainId];
      if (!config) return false;

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [config],
      });

      return true;
    } catch (error) {
      console.error('Failed to add network:', error);
      return false;
    }
  }

  // Listen for account changes
  onAccountsChanged(callback: (accounts: string[]) => void) {
    if (this.isWeb3Available()) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  // Listen for network changes
  onChainChanged(callback: (chainId: string) => void) {
    if (this.isWeb3Available()) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  // Remove event listeners
  removeAllListeners() {
    if (this.isWeb3Available()) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
  }
}

// Global instance
export const blockchainService = new BlockchainService();
export default blockchainService;

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}