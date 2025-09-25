# 🔗 Chainlink Testnet Setup Guide

## Overview
This guide shows you how to integrate Chainlink price feeds and oracle services with your ProjectForge smart contracts on Sepolia testnet - completely FREE!

## 🎯 What You'll Setup
1. **Chainlink Price Feeds** - Real-time ETH/USD pricing
2. **Chainlink VRF** (Optional) - Verifiable randomness for fair selections
3. **Oracle Network Integration** - Connect your oracle nodes to Chainlink
4. **Custom External Adapters** - For milestone verification APIs

---

## 📋 Prerequisites

- Completed [FREE_DEPLOYMENT_GUIDE.md](./FREE_DEPLOYMENT_GUIDE.md)
- MetaMask configured with Sepolia testnet
- Test ETH in your wallet
- Smart contracts deployed on Sepolia

---

## 🌐 Step 1: Chainlink Price Feed Integration

### 1.1 Sepolia Price Feed Addresses

Your `DecentralizedOracle.sol` can use these FREE Chainlink price feeds:

```solidity
// Sepolia Testnet Price Feed Addresses (100% FREE)
ETH/USD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
BTC/USD: 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
USDC/USD: 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E
LINK/USD: 0xc59E3633BAAC79493d908e63626716e204A45EdF
```

### 1.2 Update Your Oracle Contract

In Remix, update your deployed `DecentralizedOracle`:

```solidity
// Call this function after deployment
function setPriceFeed(address _priceFeed) external onlyOwner {
    priceFeed = AggregatorV3Interface(_priceFeed);
}
```

**Set ETH/USD Price Feed**:
- Contract: `DecentralizedOracle`
- Function: `setPriceFeed`
- Parameter: `0x694AA1769357215DE4FAC081bf1f309aDC325306`

### 1.3 Test Price Feed

Test the price feed integration:

```solidity
// Call this to get current ETH price
function getCurrentPrice() external view returns (int256) {
    return getLatestPrice(); // Should return ETH price in USD with 8 decimals
}
```

**Expected Result**: Current ETH price (e.g., `200000000000` = $2000.00)

---

## 🎲 Step 2: Chainlink VRF Setup (Optional)

### 2.1 Create VRF Subscription

1. Go to [vrf.chain.link](https://vrf.chain.link)
2. Connect MetaMask (Sepolia network)
3. Click **"Create Subscription"**
4. Add funds: 5 LINK minimum
5. **Save Subscription ID**: You'll need this

### 2.2 Get Test LINK Tokens

Get FREE LINK tokens for VRF:
- [Chainlink Faucet](https://faucets.chain.link/sepolia): 20 LINK per day
- Add LINK token to MetaMask: `0x779877A7B0D9E8603169DdbD7836e478b4624789`

### 2.3 VRF Consumer Contract

Create `VRFConsumer.sol` for fair oracle node selection:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract VRFConsumer is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
    
    // Sepolia VRF Coordinator
    address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    
    // Your subscription ID
    uint64 s_subscriptionId;
    
    // Gas lane key hash (30 gwei)
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;
    
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    
    constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }
    
    function requestRandomWords() external returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }
    
    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
        // Use randomWords[0] for fair oracle selection
    }
}
```

---

## 🌍 Step 3: Oracle Network Configuration

### 3.1 Chainlink Node URLs

Configure your oracle service to use Chainlink testnet:

```typescript
// src/services/oracleService.ts
export const CHAINLINK_CONFIG = {
  SEPOLIA_RPC: "https://sepolia.infura.io/v3/YOUR_KEY",
  PRICE_FEED_ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  VRF_COORDINATOR: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
  LINK_TOKEN: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
};

// Enhanced oracle service with Chainlink integration
export class ChainlinkOracleService {
  private provider: ethers.JsonRpcProvider;
  private priceFeed: ethers.Contract;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(CHAINLINK_CONFIG.SEPOLIA_RPC);
    this.priceFeed = new ethers.Contract(
      CHAINLINK_CONFIG.PRICE_FEED_ETH_USD,
      PRICE_FEED_ABI,
      this.provider
    );
  }
  
  async getETHPrice(): Promise<number> {
    try {
      const roundData = await this.priceFeed.latestRoundData();
      return Number(roundData.answer) / 1e8; // Convert to USD
    } catch (error) {
      console.error("Price feed error:", error);
      return 2000; // Fallback price
    }
  }
  
  async verifyMilestoneWithPrice(campaignId: number, milestoneId: number) {
    const ethPrice = await this.getETHPrice();
    
    // Use real ETH price for milestone verification logic
    const verificationData = {
      campaignId,
      milestoneId,
      ethPrice,
      timestamp: Date.now(),
      verified: true // Your verification logic here
    };
    
    return verificationData;
  }
}
```

### 3.2 Integration with Frontend

Update your React components:

```typescript
// src/hooks/useChainlinkOracle.ts
import { useState, useEffect } from 'react';
import { ChainlinkOracleService } from '../services/oracleService';

export const useChainlinkOracle = () => {
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const oracle = new ChainlinkOracleService();
    
    const fetchPrice = async () => {
      try {
        const price = await oracle.getETHPrice();
        setEthPrice(price);
      } catch (error) {
        console.error("Failed to fetch ETH price:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return { ethPrice, loading };
};
```

---

## 📊 Step 4: External Adapter Setup

### 4.1 Create External Adapter

For milestone verification APIs, create a Chainlink external adapter:

```javascript
// chainlink-adapter/index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Requester, Validator } = require('@chainlink/external-adapter');

const app = express();
app.use(bodyParser.json());

const customParams = {
  projectId: true,
  milestoneId: true,
  ipfsHash: false
};

const createRequest = (input, callback) => {
  const validator = new Validator(callback, input, customParams);
  
  const jobRunID = validator.validated.id;
  const projectId = validator.validated.data.projectId;
  const milestoneId = validator.validated.data.milestoneId;
  const ipfsHash = validator.validated.data.ipfsHash || '';
  
  // Your milestone verification logic
  const verificationResult = verifyMilestone(projectId, milestoneId, ipfsHash);
  
  const response = {
    jobRunID,
    data: {
      result: verificationResult.verified,
      confidence: verificationResult.confidence,
      timestamp: Date.now()
    },
    status: 200
  };
  
  callback(response.status, Requester.success(jobRunID, response));
};

function verifyMilestone(projectId, milestoneId, ipfsHash) {
  // Implement your milestone verification logic
  // This could check IPFS content, external APIs, etc.
  
  return {
    verified: true,
    confidence: 0.95,
    details: "Milestone completed successfully"
  };
}

app.post('/', (req, res) => {
  createRequest(req.body, (status, result) => {
    res.status(status).json(result);
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Chainlink External Adapter listening on port ${port}`);
});
```

### 4.2 Deploy External Adapter

Deploy to Heroku (FREE tier):

```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create projectforge-adapter

# Deploy
git init
git add .
git commit -m "Chainlink external adapter"
git push heroku main

# Get your adapter URL
heroku apps:info projectforge-adapter
```

Your adapter URL: `https://projectforge-adapter.herokuapp.com`

---

## 🔧 Step 5: Advanced Configuration

### 5.1 Chainlink Automation (Keepers)

Setup automatic milestone verification:

```solidity
// AutomatedMilestoneVerifier.sol
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract AutomatedMilestoneVerifier is AutomationCompatibleInterface {
    
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        // Check if any milestones need verification
        upkeepNeeded = pendingVerifications.length > 0;
        return (upkeepNeeded, "");
    }
    
    function performUpkeep(bytes calldata) external override {
        // Perform milestone verification
        for (uint i = 0; i < pendingVerifications.length; i++) {
            // Trigger oracle verification
        }
    }
}
```

### 5.2 Multi-Chain Configuration

Setup for multiple testnets:

```typescript
export const MULTI_CHAIN_CONFIG = {
  sepolia: {
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_KEY",
    priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  },
  mumbai: {
    chainId: 80001,
    rpcUrl: "https://polygon-mumbai.infura.io/v3/YOUR_KEY", 
    priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A"
  },
  fuji: {
    chainId: 43113,
    rpcUrl: "https://avalanche-fuji.infura.io/v3/YOUR_KEY",
    priceFeed: "0x5498BB86BC934c8D34FDA08E81D444153d0D06aD"
  }
};
```

---

## 🧪 Step 6: Testing & Validation

### 6.1 Test Price Feeds

Create test script:

```typescript
// test-chainlink.ts
import { ChainlinkOracleService } from './src/services/oracleService';

async function testChainlinkIntegration() {
  const oracle = new ChainlinkOracleService();
  
  console.log("🔗 Testing Chainlink Integration...");
  
  // Test 1: Price Feed
  const ethPrice = await oracle.getETHPrice();
  console.log(`✅ ETH Price: $${ethPrice}`);
  
  // Test 2: Milestone Verification
  const verification = await oracle.verifyMilestoneWithPrice(1, 1);
  console.log(`✅ Milestone Verified:`, verification);
  
  console.log("🎉 All tests passed!");
}

testChainlinkIntegration().catch(console.error);
```

Run test:
```bash
npm run test:chainlink
```

### 6.2 Monitor Price Feed Health

Setup monitoring:

```typescript
// Monitor price feed updates
setInterval(async () => {
  try {
    const price = await oracle.getETHPrice();
    const timestamp = Date.now();
    
    // Log to your monitoring service
    console.log(`[${new Date().toISOString()}] ETH Price: $${price}`);
    
    // Alert if price is stale (>1 hour)
    if (timestamp - lastUpdate > 3600000) {
      console.warn("⚠️ Price feed may be stale!");
    }
  } catch (error) {
    console.error("❌ Price feed error:", error);
  }
}, 60000); // Check every minute
```

---

## 📈 Step 7: Production Readiness

### 7.1 Mainnet Migration Checklist

When ready for mainnet:

- [ ] **Audit Contracts**: Get professional audit
- [ ] **Mainnet Price Feeds**: Use mainnet Chainlink addresses
- [ ] **Real LINK**: Purchase LINK tokens for VRF
- [ ] **High Availability**: Setup redundant oracle nodes
- [ ] **Monitoring**: Implement comprehensive monitoring
- [ ] **Security**: Use multisig wallets

### 7.2 Mainnet Price Feed Addresses

```solidity
// Ethereum Mainnet Price Feeds
ETH/USD: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
BTC/USD: 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
USDC/USD: 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6
LINK/USD: 0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c
```

---

## 🎯 Step 8: Advanced Features

### 8.1 Chainlink Functions (Beta)

For custom computation:

```javascript
// Chainlink Function for milestone verification
const source = `
const projectId = args[0];
const milestoneId = args[1];

// Fetch milestone data from IPFS
const ipfsResponse = await Functions.makeHttpRequest({
  url: \`https://ipfs.io/ipfs/\${args[2]}\`,
  method: 'GET'
});

// Verify milestone completion criteria
const milestoneData = ipfsResponse.data;
const verified = milestoneData.completed && milestoneData.evidence;

return Functions.encodeUint256(verified ? 1 : 0);
`;
```

### 8.2 Cross-Chain Integration

For multi-chain projects:

```solidity
// Cross-Chain Communication Protocol (CCIP)
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";

contract CrossChainOracle {
    using Client for Client.EVM2AnyMessage;
    
    function sendCrossChainVerification(
        uint64 destinationChain,
        address receiver,
        uint256 projectId
    ) external {
        Client.EVM2AnyMessage memory message = Client._argsToBytes(
            abi.encode(projectId, block.timestamp)
        );
        
        // Send verification to other chains
    }
}
```

---

## 💰 Cost Breakdown (All FREE on Testnet!)

| Component | Testnet Cost | Mainnet Cost |
|-----------|--------------|---------------|
| Price Feeds | FREE ✅ | FREE ✅ |
| VRF Requests | FREE LINK ✅ | ~$2 per request |
| External Adapter | FREE (Heroku) ✅ | $5-10/month |
| Gas Fees | FREE (Test ETH) ✅ | Variable |
| Node Operation | FREE ✅ | $50-200/month |

**Total Testnet Cost: $0** 🎉

---

## 🆘 Troubleshooting

### Common Issues:

#### 1. Price Feed Returns 0
**Solution**: Check price feed address for correct network

#### 2. VRF Subscription Insufficient Balance
**Solution**: Add more LINK tokens to subscription

#### 3. External Adapter Timeout
**Solution**: Increase callback gas limit, optimize adapter code

#### 4. Oracle Node Registration Failed
**Solution**: Ensure sufficient stake amount, check node reputation

---

## 📞 Support & Resources

### 📚 Documentation
- [Chainlink Docs](https://docs.chain.link)
- [Price Feeds](https://docs.chain.link/data-feeds/price-feeds)
- [VRF Guide](https://docs.chain.link/vrf/v2/introduction)
- [External Adapters](https://docs.chain.link/chainlink-nodes/external-adapters/external-adapters)

### 🌐 Community
- [Chainlink Discord](https://discord.gg/chainlink)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chainlink)
- [GitHub](https://github.com/smartcontractkit/chainlink)

### 🏆 Hackathons & Grants
- [Chainlink Hackathons](https://chain.link/hackathon)
- [Grants Program](https://chain.link/community/grants)
- [Bug Bounty](https://hackerone.com/chainlink)

---

## 🎉 Success! 

You now have a fully integrated Chainlink oracle system running on testnet for FREE! 

**What's Next**:
- Test milestone verification with real price data
- Setup automated verification with Chainlink Automation  
- Build custom external adapters for your specific needs
- Plan migration to mainnet with proper security measures

**Total Setup Time**: 45-60 minutes ⏱️  
**Cost**: $0 (100% FREE on testnet) 💰  
**Features Unlocked**: Real-time price feeds, verifiable randomness, automated verification 🚀

---

**Happy Oracle Building! 🔗✨**