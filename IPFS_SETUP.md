# IPFS/Pinata Setup Instructions

## Getting Pinata Credentials

To enable IPFS file uploads, you need to configure Pinata credentials:

### 1. Create a Pinata Account
- Go to [https://pinata.cloud/](https://pinata.cloud/)
- Sign up for a free account

### 2. Get API Keys
1. After logging in, go to **API Keys** in your dashboard
2. Click **"New Key"**
3. Select the permissions you need:
   - ✅ **pinFileToIPFS**
   - ✅ **pinJSONToIPFS**
   - ✅ **hashMetadata**
4. Give your key a name (e.g., "ProjectForge Development")
5. Click **Generate Key**
6. Copy the **API Key** and **API Secret**

### 3. Get JWT Token (Recommended)
1. In your Pinata dashboard, go to **API Keys**
2. Click **"Generate JWT"**
3. Set an expiration date (or leave blank for no expiration)
4. Copy the JWT token

### 4. Update Your Environment Variables

Add these to your `.env` file:

```properties
# IPFS/Pinata Configuration
REACT_APP_PINATA_API_KEY=your_actual_api_key_here
REACT_APP_PINATA_SECRET_KEY=your_actual_secret_key_here
REACT_APP_PINATA_JWT=your_actual_jwt_token_here
REACT_APP_PINATA_GATEWAY=https://gateway.pinata.cloud
```

### 5. Restart Your Development Server

After updating the `.env` file:
```bash
npm start
```

## Notes

- **JWT Token**: Using JWT is recommended as it's more secure than API Key + Secret
- **Free Tier**: Pinata offers 1GB free storage
- **Development**: The app will use mock IPFS hashes if Pinata is not configured
- **Production**: Make sure to set up Pinata properly for production deployment

## Testing IPFS Upload

1. Configure Pinata credentials
2. Restart the app
3. Try creating a project with images
4. Check the browser console for IPFS upload success messages