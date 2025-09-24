# 🔧 Environment Variables Setup Guide

## ⚠️ IMPORTANT: You need to configure these values before proceeding

### 1. 🌐 **Sepolia Testnet Configuration**

#### Get Infura Project ID:
1. Go to [Infura.io](https://infura.io) and create a free account
2. Create a new project and select "Web3 API"
3. Copy your Project ID from the dashboard
4. Replace `YOUR_INFURA_PROJECT_ID` in your .env file

**Example:**
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456...
REACT_APP_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456...
```

#### Get Your Wallet Private Key:
1. Open MetaMask
2. Click on the three dots menu → Account Details → Export Private Key
3. Enter your password and copy the private key
4. Replace `YOUR_WALLET_PRIVATE_KEY` in your .env file

**⚠️ SECURITY NOTE:** Never share your private key publicly!

**Example:**
```
SEPOLIA_PRIVATE_KEY=0x1234567890abcdef...
```

#### Get Sepolia ETH for Testing:
1. Visit a Sepolia faucet like: https://sepoliafaucet.com/
2. Enter your wallet address
3. Receive free test ETH for deployment and testing

### 2. 📧 **EmailJS Configuration**

#### Set up EmailJS Account:
1. Go to [EmailJS.com](https://emailjs.com) and create a free account
2. Add an email service (Gmail, Outlook, etc.)
3. Create two email templates:
   - **Donor Confirmation Template**
   - **Creator Notification Template**

#### Replace these values in .env:
```
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID_DONOR=template_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID_CREATOR=template_xxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

### 3. 📄 **Email Template Examples**

#### Donor Confirmation Template:
```
Subject: ✅ Donation Confirmed - {{project_title}}

Hi {{donor_name}},

Thank you for your donation to {{project_title}}!

💰 Amount: {{amount}} ETH
🏗️ Project: {{project_title}}
👤 Creator: {{creator_name}}
🔗 Transaction: {{transaction_hash}}
📅 Date: {{donation_date}}

Your funds have been successfully transferred using blockchain technology.

Best regards,
ProjectForge Team
```

#### Creator Notification Template:
```
Subject: 🎉 New Donation Received - {{project_title}}

Hi {{creator_name}},

Great news! You've received a new donation for {{project_title}}.

💰 Amount: {{amount}} ETH
👤 Donor: {{donor_name}}
🔗 Transaction: {{transaction_hash}}
📅 Date: {{donation_date}}

The funds are now available in your project wallet.

Best regards,
ProjectForge Team
```

## 🚀 Next Steps

After configuring your environment variables:

1. **Deploy Smart Contract**: We'll deploy to Sepolia testnet
2. **Update Contract Address**: Add the deployed address to .env
3. **Test Email System**: Verify EmailJS templates work
4. **Run Database Migration**: Set up the Supabase schema
5. **Test End-to-End**: Complete donation flow testing

---

**📋 Current Status:** Environment variables template created
**⏭️ Next Action:** Configure your Infura, MetaMask, and EmailJS accounts