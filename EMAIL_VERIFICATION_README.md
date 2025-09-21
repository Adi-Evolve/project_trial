# MetaMask Authentication with Email Verification

This project implements a complete Web3 authentication system combining MetaMask wallet connection with email verification using Supabase.

## Updated Features

### 🔧 **Enhanced User Profile**
- **Email Collection**: Required email address for all users
- **Date of Birth**: Replaced age field with proper date picker
- **Email Verification**: Supabase-powered email verification system
- **Form Validation**: Enhanced validation for email format and date of birth

### 📧 **Email Verification System**
- **Supabase Integration**: Uses Supabase Auth for reliable email verification
- **OTP Codes**: 6-digit verification codes sent via email
- **Rate Limiting**: Built-in cooldown and retry limits
- **Skip Option**: Users can skip verification but with limited functionality

## Authentication Flow

### Updated User Journey
```
1. Connect MetaMask Wallet
   ↓
2. Sign Verification Message
   ↓
3. Complete Profile Setup
   - Full Name (required)
   - Email Address (required)
   - Date of Birth (required)
   - College/University (required)
   - Role Selection (Fund Raiser / Donor)
   - Bio, Skills, Interests (optional)
   ↓
4. Email Verification
   - Auto-send verification code
   - Enter 6-digit code
   - Option to skip (with warnings)
   ↓
5. Access Application
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Create a `.env` file from the template:

```bash
cp .env.template .env
```

4. Update `.env` with your credentials:

```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Email Authentication in Supabase

1. Go to **Authentication > Settings** in your Supabase dashboard
2. Enable **Email** provider
3. Configure **Email Templates** (optional):
   - Customize the verification email template
   - Set your sender name and email
4. Configure **SMTP** (optional for custom email provider)

### 4. Configure Email Verification

The system supports multiple verification flows:

#### Option A: Magic Link (Default)
```typescript
// Supabase will send a magic link to verify email
const { error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    shouldCreateUser: false
  }
});
```

#### Option B: OTP Code
```typescript
// Supabase will send a 6-digit OTP code
const { error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    shouldCreateUser: false,
    data: { verification_type: 'signup' }
  }
});
```

## Component Updates

### 1. Enhanced User Interface

```typescript
interface User {
  walletAddress: string;
  email: string;                 // NEW: Required email
  name: string;
  dateOfBirth: string;          // CHANGED: From age to DOB
  college: string;
  role: 'fund_raiser' | 'donor';
  bio?: string;
  skills?: string[];
  interests?: string[];
  isVerified: boolean;
  isEmailVerified: boolean;     // NEW: Email verification status
  joinedAt: Date;
}
```

### 2. Updated Profile Setup Form

The `UserProfileSetup` component now includes:

```tsx
// Email field with validation
<input
  type="email"
  value={userData.email || ''}
  onChange={(e) => handleInputChange('email', e.target.value)}
  placeholder="Enter your email address"
  required
/>

// Date of birth picker
<input
  type="date"
  value={userData.dateOfBirth || ''}
  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
  max={new Date().toISOString().split('T')[0]}
  required
/>
```

### 3. Email Verification Component

New `EmailVerification` component features:
- Auto-send verification code on mount
- 6-digit code input with formatting
- Resend functionality with cooldown
- Skip option with warnings
- Real-time validation

```tsx
<EmailVerification
  email={userEmail}
  onVerificationComplete={handleComplete}
  onBack={handleBack}
  onSkip={handleSkip}
  allowSkip={true}
/>
```

## Email Verification Service

### Core Service Methods

```typescript
// Send verification email
const result = await emailVerificationService.sendVerificationEmail(email);

// Verify email with OTP code
const result = await emailVerificationService.verifyEmail(token, email);

// Resend verification
const result = await emailVerificationService.resendVerificationEmail(email);
```

### Verification Manager

Advanced state management for email verification:

```typescript
const manager = new EmailVerificationManager(email, onStateChange);

// Send verification
await manager.sendVerification();

// Verify with code
await manager.verifyEmail(token);

// Check if can resend
const canResend = manager.canResend();

// Get cooldown time
const timeLeft = manager.getTimeUntilNextResend();
```

## Configuration Options

### Email Verification Settings

```typescript
// In emailVerification.ts
const EMAIL_CONFIG = {
  cooldownPeriod: 60000,        // 1 minute between resends
  maxResendAttempts: 5,         // Maximum resend attempts
  codeExpiryTime: 600000,       // 10 minutes code validity
  autoSendOnMount: true         // Auto-send when component loads
};
```

### Validation Rules

```typescript
// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Date of birth validation
const dobValid = userData.dateOfBirth && new Date(userData.dateOfBirth) <= new Date();

// Complete validation
const isValid = userData.name && userData.college && dobValid && emailValid;
```

## Error Handling

### Email Verification Errors

```typescript
enum EmailVerificationError {
  INVALID_EMAIL = 'INVALID_EMAIL',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  VERIFICATION_EXPIRED = 'VERIFICATION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
```

### Error Messages

The system provides user-friendly error messages:
- Invalid email format
- Rate limiting notifications
- Expired verification codes
- Network connectivity issues
- Service unavailability

## Security Features

### ✅ Enhanced Security
- **Email Ownership Verification**: Proves email access through OTP
- **Rate Limiting**: Prevents spam and abuse
- **Code Expiration**: Time-limited verification codes
- **Wallet + Email Verification**: Dual authentication layer

### ✅ Privacy Protection
- **No Email Storage**: Email verification doesn't require account creation
- **Temporary Codes**: OTP codes automatically expire
- **Optional Verification**: Users can skip if needed

## Usage Examples

### Complete Authentication Flow

```tsx
import { AuthFlow } from './components/auth/AuthFlow';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingScreen />;
  
  if (!isAuthenticated) {
    return <AuthFlow onAuthComplete={() => console.log('Auth complete!')} />;
  }
  
  return (
    <Dashboard>
      <h1>Welcome, {user.name}!</h1>
      <p>Email: {user.email} {user.isEmailVerified ? '✅' : '❌'}</p>
      <p>DOB: {new Date(user.dateOfBirth).toLocaleDateString()}</p>
    </Dashboard>
  );
}
```

### Manual Email Verification

```tsx
import { useAuth } from './context/AuthContext';

function ProfileSettings() {
  const { user, sendEmailVerification, verifyEmail } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  
  const handleSendVerification = async () => {
    if (user?.email) {
      const success = await sendEmailVerification(user.email);
      if (success) {
        toast.success('Verification email sent!');
      }
    }
  };
  
  const handleVerifyCode = async () => {
    const success = await verifyEmail(verificationCode);
    if (success) {
      toast.success('Email verified successfully!');
    }
  };
  
  return (
    <div>
      {!user?.isEmailVerified && (
        <div>
          <button onClick={handleSendVerification}>
            Send Verification Email
          </button>
          <input
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter verification code"
          />
          <button onClick={handleVerifyCode}>
            Verify Email
          </button>
        </div>
      )}
    </div>
  );
}
```

## Supabase Configuration

### Email Templates

You can customize the verification email in Supabase:

1. Go to **Authentication > Email Templates**
2. Select **Magic Link** or **OTP** template
3. Customize the email content:

```html
<h2>Verify your email for ProjectForge</h2>
<p>Hi there!</p>
<p>Please verify your email address by entering this code:</p>
<h1 style="font-size: 32px; text-align: center;">{{ .Token }}</h1>
<p>This code will expire in 10 minutes.</p>
<p>If you didn't request this, please ignore this email.</p>
```

### RLS Policies

Set up Row Level Security if needed:

```sql
-- Enable RLS on auth tables if storing additional user data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON public.users
FOR SELECT USING (auth.uid() = user_id);
```

## Testing

### Test Email Verification

For development, you can use test email providers:

```typescript
// In development, log verification codes
if (process.env.NODE_ENV === 'development') {
  console.log('Verification code:', token);
}
```

### Mock Verification (Development)

```typescript
// Skip actual email sending in development
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
  // Auto-verify for testing
  return { success: true };
}
```

## Deployment Checklist

### Production Setup
- [ ] Configure production Supabase project
- [ ] Set up custom email domain
- [ ] Configure email templates
- [ ] Set up monitoring for email delivery
- [ ] Test verification flow end-to-end
- [ ] Configure rate limiting
- [ ] Set up error tracking

### Environment Variables
```env
# Production
REACT_APP_SUPABASE_URL=https://prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=prod-anon-key
REACT_APP_NODE_ENV=production
REACT_APP_DEBUG_EMAIL=false
```

This enhanced authentication system provides a secure, user-friendly way to verify user identity through both wallet ownership and email verification, ensuring better security and communication capabilities for your application.