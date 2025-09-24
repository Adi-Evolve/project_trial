# Blockchain Funding System Setup Guide

## Overview

This guide will help you set up the complete blockchain funding system for ProjectForge, including:
- Smart contract deployment on Sepolia testnet
- Supabase database configuration
- EmailJS email notifications
- Web3 wallet integration

## Prerequisites

- Node.js and npm installed
- MetaMask browser extension
- Supabase account
- EmailJS account
- Sepolia ETH for contract deployment

## Step 1: Environment Configuration

1. Copy the environment template:
```bash
cp .env.template .env
```

2. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com) and create a project
   - Navigate to Settings > API
   - Copy your Project URL and anon key
   - Update `.env` file with these values

3. Set up EmailJS:
   - Go to [emailjs.com](https://emailjs.com) and create an account
   - Create a new service (Gmail, Outlook, etc.)
   - Create two email templates:
     - Template for donor confirmations
     - Template for creator notifications
   - Update `.env` file with service ID, template IDs, and public key

## Step 2: Database Setup

1. Run the database migration in your Supabase project:
   - Go to Supabase Dashboard > SQL Editor
   - Copy and paste the content from `supabase/migrations/001_create_blockchain_funding_tables.sql`
   - Execute the migration

2. Verify tables are created:
   - Check that all tables exist: `projects`, `transactions`, `donations`, `email_notifications`, etc.
   - Verify RLS policies are enabled

## Step 3: Smart Contract Deployment

### Option A: Using Remix IDE (Recommended for beginners)

1. Open [remix.ethereum.org](https://remix.ethereum.org)

2. Create a new file `ProjectFunding.sol` and copy the contract code from `contracts/ProjectFunding.sol`

3. Install OpenZeppelin contracts:
   - In Remix, go to File Explorer
   - Click on the package manager
   - Search for `@openzeppelin/contracts` and install

4. Compile the contract:
   - Select Solidity Compiler
   - Choose compiler version 0.8.19 or later
   - Click "Compile ProjectFunding.sol"

5. Deploy to Sepolia:
   - Switch MetaMask to Sepolia testnet
   - Get Sepolia ETH from faucet: [sepoliafaucet.com](https://sepoliafaucet.com)
   - In Remix, go to Deploy & Run
   - Select "Injected Provider - MetaMask"
   - Set constructor parameter (fee recipient address)
   - Click Deploy
   - Copy the deployed contract address to `.env`

### Option B: Using Hardhat (Advanced)

1. Install Hardhat:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Initialize Hardhat:
```bash
npx hardhat
```

3. Configure `hardhat.config.js`:
```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: ["YOUR_PRIVATE_KEY"] // Be careful with private keys!
    }
  }
};
```

4. Deploy script:
```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const ProjectFunding = await ethers.getContractFactory("ProjectFunding");
  const projectFunding = await ProjectFunding.deploy(deployer.address);

  console.log("Contract deployed to:", projectFunding.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

5. Deploy:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## Step 4: EmailJS Template Setup

### Template for Donor Confirmations (REACT_APP_EMAILJS_TEMPLATE_DONATION_SENT)

Subject: `Donation Confirmation - {{project_title}}`

Template:
```
Hello {{donor_name}},

Thank you for your generous donation of {{donation_amount}} ETH to "{{project_title}}" by {{project_creator}}!

Transaction Details:
- Amount: {{donation_amount}} ETH
- Transaction Hash: {{transaction_hash}}
- Timestamp: {{timestamp}}
{{#donation_message}}
- Your Message: "{{donation_message}}"
{{/donation_message}}

You can view your transaction on the blockchain:
{{block_explorer_url}}

Visit the project page:
{{project_url}}

Thank you for supporting innovation on ProjectForge!

Best regards,
The ProjectForge Team
```

### Template for Creator Notifications (REACT_APP_EMAILJS_TEMPLATE_DONATION_RECEIVED)

Subject: `New Donation Received - {{project_title}}`

Template:
```
Hello {{creator_name}},

Great news! You've received a new donation for your project "{{project_title}}".

Donation Details:
- Donor: {{donor_name}}
- Amount: {{donation_amount}} ETH
- Transaction Hash: {{transaction_hash}}
- Timestamp: {{timestamp}}
{{#donation_message}}
- Message from donor: "{{donation_message}}"
{{/donation_message}}

View the transaction:
{{block_explorer_url}}

Manage your project:
{{project_url}}

Keep up the great work!

Best regards,
The ProjectForge Team
```

## Step 5: Testing the System

1. Start the development server:
```bash
npm start
```

2. Connect MetaMask to Sepolia testnet

3. Navigate to a project funding page

4. Test the donation flow:
   - Connect wallet
   - Enter donation amount and details
   - Confirm transaction
   - Check that emails are sent
   - Verify data is saved to Supabase

## Step 6: Production Deployment

### Smart Contract

1. Deploy to Ethereum mainnet (when ready for production)
2. Update contract address in environment variables
3. Consider using a multisig wallet for contract ownership

### Database

1. Enable SSL and RLS properly
2. Set up database backups
3. Configure appropriate rate limits

### Email Service

1. Set up custom domain for emails
2. Use professional email provider (SendGrid, Mailgun)
3. Configure email templates with your branding

## Troubleshooting

### Common Issues

1. **Transaction failures:**
   - Check you have enough Sepolia ETH
   - Verify contract address is correct
   - Check gas limit settings

2. **Email not sending:**
   - Verify EmailJS configuration
   - Check spam folder
   - Test with different email providers

3. **Database errors:**
   - Check RLS policies
   - Verify migration was run correctly
   - Check network connectivity to Supabase

4. **MetaMask connection issues:**
   - Clear browser cache
   - Reset MetaMask
   - Check network settings

### Debug Mode

Enable debug mode in `.env`:
```
REACT_APP_DEBUG_EMAIL=true
REACT_APP_NODE_ENV=development
```

This will log additional information to help with troubleshooting.

## Security Considerations

1. **Smart Contract:**
   - Audit contract before mainnet deployment
   - Use timelock for critical functions
   - Implement emergency pause functionality

2. **Environment Variables:**
   - Never commit `.env` file
   - Use different keys for development/production
   - Rotate keys regularly

3. **Database:**
   - Enable RLS on all tables
   - Use appropriate user permissions
   - Monitor for suspicious activity

4. **Email:**
   - Validate email addresses
   - Implement rate limiting
   - Don't expose sensitive data in emails

## Support

For technical support:
1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Test each component individually
4. Review the transaction history on Etherscan

## Next Steps

Once the basic system is working:
1. Add project creation from the frontend
2. Implement fund withdrawal functionality
3. Add advanced analytics and reporting
4. Integrate with other blockchains
5. Add governance features