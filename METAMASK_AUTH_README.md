# MetaMask Authentication System

This project implements a complete MetaMask-based authentication system for Web3 applications. Users can connect their MetaMask wallet, verify ownership through message signing, and complete their profile setup.

## Features

### 🦊 MetaMask Integration
- **Wallet Detection**: Automatically detects if MetaMask is installed
- **Connection Flow**: Seamless wallet connection with user confirmation
- **Network Information**: Displays current network and wallet balance
- **Message Signing**: Verifies wallet ownership through cryptographic signing

### 👤 User Profile Setup
- **Multi-step Onboarding**: Welcome → Basic Info → Role Selection → Additional Details
- **Role-based Authentication**: Users can select between "Fund Raiser" or "Donor" roles
- **Profile Data Collection**: Name, age, college, bio, skills, and interests
- **Form Validation**: Comprehensive validation with user-friendly error messages

### 🔐 Authentication State Management
- **Persistent Sessions**: Authentication state persisted in localStorage
- **Wallet Monitoring**: Automatically detects wallet disconnection
- **Context-based State**: React Context for global authentication state
- **Type Safety**: Full TypeScript support with comprehensive interfaces

## Components

### 1. MetaMaskAuth Component (`src/components/auth/MetaMaskAuth.tsx`)
Handles the wallet connection and verification process:

```tsx
import MetaMaskAuth from './components/auth/MetaMaskAuth';

<MetaMaskAuth 
  onAuthSuccess={(address, isNewUser) => {
    console.log('Wallet connected:', address);
    console.log('Is new user:', isNewUser);
  }}
  onClose={() => console.log('Auth modal closed')}
/>
```

**Features:**
- MetaMask installation detection with download prompt
- Wallet connection with account selection
- Balance and network information display
- Message signing for ownership verification
- Step-by-step progress indicators
- Responsive design with animations

### 2. UserProfileSetup Component (`src/components/auth/UserProfileSetup.tsx`)
Multi-step user onboarding after wallet verification:

```tsx
import UserProfileSetup from './components/auth/UserProfileSetup';

<UserProfileSetup 
  walletAddress="0x742d35Cc6635C0532925a3b8D6A8EFCD99df4FE6"
  isNewUser={true}
  onComplete={(userData) => {
    console.log('Profile setup complete:', userData);
  }}
  onBack={() => console.log('Going back to wallet connection')}
/>
```

**Steps:**
1. **Welcome**: Introduction and wallet confirmation
2. **Basic Info**: Name, age, and college (required fields)
3. **Role Selection**: Fund Raiser or Donor with visual selection
4. **Additional Details**: Bio, skills, and interests (optional)
5. **Completion**: Summary and confirmation

### 3. AuthFlow Component (`src/components/auth/AuthFlow.tsx`)
Orchestrates the complete authentication flow:

```tsx
import { AuthFlow } from './components/auth/AuthFlow';

<AuthFlow 
  onAuthComplete={() => {
    console.log('Authentication flow completed');
  }}
/>
```

**Flow:**
1. Wallet Connection → Profile Setup → Application Access
2. Automatic state management between steps
3. Handles both new and returning users
4. Integration with AuthContext for global state

### 4. AuthContext (`src/context/AuthContext.tsx`)
Provides global authentication state management:

```tsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { 
    user, 
    walletInfo, 
    isAuthenticated, 
    isLoading,
    login, 
    logout, 
    updateUser 
  } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please connect your wallet</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

## Data Structures

### User Interface
```typescript
interface User {
  walletAddress: string;      // Ethereum wallet address
  name: string;              // User's full name
  age: number;               // User's age
  college: string;           // College/University name
  role: 'fund_raiser' | 'donor'; // User role selection
  bio?: string;              // Optional biography
  skills?: string[];         // Optional skills array
  interests?: string[];      // Optional interests array
  isVerified: boolean;       // Wallet verification status
  joinedAt: Date;           // Registration timestamp
}
```

### WalletInfo Interface
```typescript
interface WalletInfo {
  address: string;           // Wallet address
  balance: string;           // ETH balance
  network: string;           // Network name
  chainId: string;          // Chain ID
}
```

## Authentication Flow

### 1. Initial Load
- Check localStorage for existing authentication
- Verify MetaMask connection status
- Auto-login if valid session exists

### 2. New User Flow
```
User visits app → MetaMask not connected → Show MetaMask Auth
→ Connect wallet → Sign verification message → Profile setup
→ Complete registration → Access application
```

### 3. Returning User Flow
```
User visits app → Check localStorage → Verify wallet connection
→ Auto-login → Access application
```

### 4. Wallet Disconnection
```
Wallet disconnected → Clear authentication → Show MetaMask Auth
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install ethers react-hot-toast
```

### 2. Wrap App with AuthProvider
```tsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <YourAppContent />
    </AuthProvider>
  );
}
```

### 3. Use AuthFlow Component
```tsx
import { AuthFlow } from './components/auth/AuthFlow';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <AuthFlow />;
  
  return <MainApplication />;
}
```

## Security Features

### ✅ Wallet Ownership Verification
- Message signing proves wallet ownership
- Prevents unauthorized access
- Cryptographically secure verification

### ✅ Session Management
- Automatic session persistence
- Wallet disconnection detection
- Secure logout functionality

### ✅ Network Validation
- Displays current network information
- Helps users verify correct network connection
- Balance information for transparency

## Browser Compatibility

- **Chrome**: Full support with MetaMask extension
- **Firefox**: Full support with MetaMask extension  
- **Safari**: Limited support (MetaMask mobile browser)
- **Edge**: Full support with MetaMask extension

## Error Handling

The system includes comprehensive error handling for:
- MetaMask not installed
- User rejection of connection
- Network errors
- Transaction failures
- Form validation errors
- Invalid wallet addresses

## Future Enhancements

### Planned Features
- [ ] Multi-wallet support (WalletConnect, Coinbase Wallet)
- [ ] ENS name resolution
- [ ] Profile picture upload to IPFS
- [ ] Social media integration
- [ ] Email notifications
- [ ] Mobile-responsive improvements

### Security Improvements
- [ ] Nonce-based message signing
- [ ] Session timeout management
- [ ] Rate limiting for auth attempts
- [ ] Audit logging for security events

---

## Usage Example

Here's a complete example of integrating the authentication system:

```tsx
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthFlow } from './components/auth/AuthFlow';

function Dashboard() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Role: {user.role}</p>
      <p>Wallet: {user.walletAddress}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <AuthFlow onAuthComplete={() => console.log('Auth complete!')} />;
  }
  
  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
```

This implementation provides a complete, production-ready MetaMask authentication system with excellent user experience and robust security features.