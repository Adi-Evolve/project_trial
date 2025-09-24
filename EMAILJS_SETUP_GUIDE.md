# 📧 EmailJS Setup Guide for ProjectForge

## Step 1: EmailJS Account Setup

1. **Go to EmailJS Dashboard**: https://dashboard.emailjs.com/
2. **Sign up/Login** with your account
3. **Verify your email** if required

## Step 2: Add Email Service

1. **Click "Email Services"** in the left sidebar
2. **Click "Add New Service"**
3. **Choose your email provider**:
   - **Gmail** (recommended for testing)
   - Outlook
   - Yahoo
   - Or any SMTP service

### For Gmail Setup:
1. Select **Gmail**
2. **Service ID**: Will be auto-generated (copy this for .env)
3. **Authorize** your Gmail account
4. **Save the service**

## Step 3: Create Email Templates

### Template 1: Donor Confirmation Email

1. **Click "Email Templates"** → **"Create New Template"**
2. **Template Name**: `donor_confirmation`
3. **Subject**: `✅ Donation Confirmed - {{project_title}}`
4. **Content**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Thank You for Your Donation!</h1>
        </div>
        <div class="content">
            <p>Hi {{donor_name}},</p>
            
            <p>Your donation has been <strong>successfully processed</strong> and transferred to support <strong>{{project_title}}</strong>!</p>
            
            <div class="amount">💰 {{amount}} ETH</div>
            
            <div class="details">
                <h3>Transaction Details:</h3>
                <div class="detail-row">
                    <span><strong>Project:</strong></span>
                    <span>{{project_title}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Creator:</strong></span>
                    <span>{{creator_name}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Transaction Hash:</strong></span>
                    <span style="word-break: break-all;">{{transaction_hash}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Date:</strong></span>
                    <span>{{donation_date}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Platform Fee:</strong></span>
                    <span>{{platform_fee}} ETH (2.5%)</span>
                </div>
                <div class="detail-row">
                    <span><strong>Amount to Creator:</strong></span>
                    <span>{{creator_amount}} ETH</span>
                </div>
            </div>
            
            <p>🔗 <strong>Blockchain Verification:</strong> Your transaction is permanently recorded on the Ethereum blockchain and can be verified at: <br>
            <a href="https://sepolia.etherscan.io/tx/{{transaction_hash}}" target="_blank">View on Etherscan</a></p>
            
            <p>Thank you for supporting innovation and helping creators bring their projects to life! 🚀</p>
            
            <div class="footer">
                <p>Best regards,<br>
                <strong>ProjectForge Team</strong></p>
                <p><a href="mailto:support@projectforge.com">support@projectforge.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
```

5. **Save the template** and copy the **Template ID**

### Template 2: Creator Notification Email

1. **Create another template**
2. **Template Name**: `creator_notification`
3. **Subject**: `🎉 New Donation Received - {{project_title}}`
4. **Content**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%); color: white; text-align: center; padding: 30px; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .amount { font-size: 24px; font-weight: bold; color: #56ab2f; text-align: center; margin: 20px 0; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; color: #666; }
        .action-btn { background: #56ab2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 New Donation Received!</h1>
        </div>
        <div class="content">
            <p>Hi {{creator_name}},</p>
            
            <p>Great news! You've received a new donation for <strong>{{project_title}}</strong>!</p>
            
            <div class="amount">🎉 {{creator_amount}} ETH</div>
            
            <div class="details">
                <h3>Donation Details:</h3>
                <div class="detail-row">
                    <span><strong>Donor:</strong></span>
                    <span>{{donor_name}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Total Donation:</strong></span>
                    <span>{{amount}} ETH</span>
                </div>
                <div class="detail-row">
                    <span><strong>Platform Fee:</strong></span>
                    <span>{{platform_fee}} ETH</span>
                </div>
                <div class="detail-row">
                    <span><strong>Your Amount:</strong></span>
                    <span>{{creator_amount}} ETH</span>
                </div>
                <div class="detail-row">
                    <span><strong>Transaction Hash:</strong></span>
                    <span style="word-break: break-all;">{{transaction_hash}}</span>
                </div>
                <div class="detail-row">
                    <span><strong>Date:</strong></span>
                    <span>{{donation_date}}</span>
                </div>
            </div>
            
            <p>💡 <strong>Message from Donor:</strong><br>
            "{{donor_message}}"</p>
            
            <p>🔗 <strong>View Transaction:</strong> <a href="https://sepolia.etherscan.io/tx/{{transaction_hash}}" target="_blank">Etherscan</a></p>
            
            <a href="https://projectforge.com/dashboard" class="action-btn">View Project Dashboard</a>
            
            <p>The funds are now available in your project wallet and will be transferred to you according to your withdrawal schedule.</p>
            
            <div class="footer">
                <p>Keep up the great work!<br>
                <strong>ProjectForge Team</strong></p>
            </div>
        </div>
    </div>
</body>
</html>
```

## Step 4: Get Configuration Values

After creating both templates, collect these values:

1. **Service ID**: From Email Services page
2. **Template ID (Donor)**: From donor_confirmation template
3. **Template ID (Creator)**: From creator_notification template  
4. **Public Key**: Go to Account → General → Public Key

## Step 5: Update Your .env File

Replace these values in your `.env` file:

```env
REACT_APP_EMAILJS_SERVICE_ID=service_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID_DONOR=template_xxxxxxx
REACT_APP_EMAILJS_TEMPLATE_ID_CREATOR=template_xxxxxxx
REACT_APP_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

## Step 6: Test EmailJS

1. **Go to EmailJS dashboard**
2. **Click "Test Service"**
3. **Send a test email** to verify it works

---

## ⚠️ Important Notes:

1. **Gmail Limitations**: Free Gmail accounts have sending limits
2. **Domain Verification**: For production, verify your domain
3. **Template Variables**: Use {{variable_name}} syntax
4. **HTML Support**: EmailJS supports full HTML templates

---

**📧 Once you've completed this setup, let me know and I'll help you deploy the smart contract using Remix IDE (easier than Hardhat)!**