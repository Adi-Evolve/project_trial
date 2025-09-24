# 🚀 Smart Contract Deployment Guide (Remix IDE)

Since Hardhat is having dependency conflicts, let's use Remix IDE for deployment - it's easier and more reliable!

## Step 1: Open Remix IDE

1. **Go to**: https://remix.ethereum.org/
2. **Wait for it to load** completely

## Step 2: Create the Contract File

1. **Click "File Explorer"** (folder icon) in the left panel
2. **Right-click on "contracts"** folder → **"New File"**
3. **Name it**: `ProjectFunding.sol`
4. **Copy and paste** the entire contract code from `c:\Users\adiin\OneDrive\Desktop\projectforge\contracts\ProjectFunding.sol`

## Step 3: Compile the Contract

1. **Click "Solidity Compiler"** (second icon in left panel)
2. **Select compiler version**: `0.8.28`
3. **Click "Compile ProjectFunding.sol"**
4. **Wait for green checkmark** ✅

## Step 4: Deploy to Sepolia

1. **Click "Deploy & Run Transactions"** (third icon)
2. **Environment**: Select **"Injected Provider - MetaMask"**
3. **MetaMask will pop up** → Connect your account
4. **Make sure you're on Sepolia network** in MetaMask
5. **Contract**: Select **"ProjectFunding"**
6. **Click "Deploy"**
7. **MetaMask will ask for confirmation** → Click "Confirm"
8. **Wait for deployment** (30-60 seconds)

## Step 5: Get Contract Address

1. **After deployment**, look in the "Deployed Contracts" section
2. **Copy the contract address** (starts with 0x...)
3. **Save this address** - you'll need it for the .env file

## Step 6: Update .env File

Replace `CONTRACT_ADDRESS_AFTER_DEPLOYMENT` in your .env file with the actual deployed address:

```env
REACT_APP_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

## Step 7: Verify Contract (Optional)

1. **Go to**: https://sepolia.etherscan.io/
2. **Search for your contract address**
3. **Click "Contract"** tab → **"Verify and Publish"**
4. **Follow the verification steps**

---

## 🎯 What This Contract Does:

1. **Two-Step Donation Process**:
   - Donor sends ETH → Contract takes 2.5% fee for platform → Remaining goes to pending withdrawals
   - Platform (your wallet) gets fee immediately
   - Creator can withdraw their portion later

2. **Automatic Fee Collection**: Your MetaMask wallet gets 2.5% of every donation automatically

3. **Transparent Tracking**: All donations and transfers are logged with events

4. **Security Features**: ReentrancyGuard, Pausable, Ownable patterns

---

**📝 After deployment, you'll have:**
- ✅ Smart contract on Sepolia testnet
- ✅ Your wallet as platform fee recipient
- ✅ Contract address for frontend integration

**⏭️ Next Steps:**
1. Complete EmailJS setup
2. Run Supabase database migration  
3. Test the complete donation flow