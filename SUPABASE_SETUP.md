# Quick Setup Guide for Supabase Email Verification

## Step 1: Install Supabase Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Go to **Settings > API**
5. Copy your **Project URL** and **anon/public key**

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
```bash
cp .env.template .env
```

2. Update the `.env` file with your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Enable Email Authentication in Supabase

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Enable **Email** provider
3. Configure **Email Templates** (optional):
   - Go to **Authentication > Email Templates**
   - Customize the **Magic Link** or **OTP** template
   - Test the email delivery

## Step 5: Test the Setup

1. Start your development server:
```bash
npm start
```

2. Go through the authentication flow:
   - Connect MetaMask wallet
   - Fill in profile information with a valid email
   - Check your email for the verification code
   - Enter the code to complete verification

## Step 6: Verify Email Delivery

If emails aren't being sent:

1. Check your Supabase project logs:
   - Go to **Logs > Auth Logs**
   - Look for any error messages

2. Verify your email provider settings:
   - Go to **Settings > Auth**
   - Check SMTP configuration (if using custom provider)

3. Test with a different email provider:
   - Try Gmail, Outlook, or other major providers

## Step 7: Production Configuration (Optional)

For production, consider:

1. **Custom Email Domain**: Set up a custom domain for email sending
2. **SMTP Provider**: Use SendGrid, Mailgun, or similar for better delivery
3. **Email Templates**: Customize templates to match your brand
4. **Rate Limiting**: Configure appropriate rate limits
5. **Monitoring**: Set up alerts for email delivery failures

## Troubleshooting

### Common Issues:

1. **Emails not received**:
   - Check spam folder
   - Verify email address is correct
   - Check Supabase logs for errors

2. **Invalid verification code**:
   - Codes expire after 10 minutes
   - Each code can only be used once
   - Check for typos in the code

3. **Rate limiting**:
   - Wait 60 seconds between resend requests
   - Maximum 5 attempts per session

4. **Environment variables not loaded**:
   - Restart your development server
   - Check `.env` file is in project root
   - Verify variable names match exactly

### Debug Mode:

Enable debug logging in development:

```env
REACT_APP_DEBUG_EMAIL=true
REACT_APP_NODE_ENV=development
```

This will log verification codes to the console for testing.

## Support

If you encounter issues:

1. Check the [Supabase documentation](https://supabase.com/docs/guides/auth)
2. Review the email verification logs in your Supabase dashboard
3. Test with different email providers
4. Verify your network connection and firewall settings

The system is designed to gracefully handle failures and provide clear error messages to users.

---

## Project Milestone Verification Setup

### Add milestone_check Column to Projects Table

In Supabase SQL Editor, run the following SQL to add the milestone verification column:

```sql
-- Add milestone_check column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS milestone_check boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN projects.milestone_check IS 'Oracle verification status: false on creation/new milestone, true after oracle verification';

-- Update existing projects to have milestone_check = false
UPDATE projects SET milestone_check = false WHERE milestone_check IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_milestone_check ON projects(milestone_check);
```

### Milestone Check Workflow

The `milestone_check` column follows this lifecycle:

1. **Project Creation**: `milestone_check = false`
2. **Oracle Verification (Pass)**: `milestone_check = true`
3. **New Milestone Added**: `milestone_check = false` (automatically)
4. **Oracle Verification (Pass)**: `milestone_check = true`

### Oracle Integration

For testing phase, use testnet oracles:
- Chainlink testnet for milestone verification
- Mock oracle service for development
- Automated verification based on milestone criteria

### Required Environment Variables

Add to your `.env` file:

```env
# Oracle Configuration (Testnet)
REACT_APP_ORACLE_ENABLED=true
REACT_APP_CHAINLINK_TESTNET_URL=https://sepolia.infura.io/v3/your-key
REACT_APP_ORACLE_CONTRACT_ADDRESS=0x...
REACT_APP_ORACLE_PRIVATE_KEY=your-testnet-private-key
```