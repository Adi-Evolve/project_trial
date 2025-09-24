import React from 'react';
import { UserVerificationForm } from '../components/verification/UserVerificationForm';
import { AdminVerificationDashboard } from '../components/verification/AdminVerificationDashboard';
import { useAuth } from '../context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../components/ui/Card';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { 
  Shield, 
  User, 
  Settings, 
  AlertTriangle 
} from 'lucide-react';

const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'user' | 'admin'>('user');
  
  // Check if user is admin (you'd implement this based on your auth system)
  const isAdmin = user?.email?.includes('admin') || user?.role === 'fund_raiser'; // Temp check for demo

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center text-center">
              <Shield className="w-6 h-6 mr-2" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please sign in to access the verification system.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            User Verification System
          </h1>
          <p className="mt-2 text-gray-600">
            {isAdmin 
              ? 'Manage user verification requests and review submitted documents'
              : 'Complete your identity verification to access all platform features'
            }
          </p>
        </div>

        {/* Tab Navigation (for admins) */}
        {isAdmin && (
          <div className="mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('user')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'user'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                My Verification
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'admin'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Admin Dashboard
              </button>
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* User Verification Form */}
          {(!isAdmin || activeTab === 'user') && (
            <UserVerificationForm
              userId={user.walletAddress}
              userEmail={user.email}
              userName={user.name}
              onVerificationSubmitted={(success, message) => {
                if (success) {
                  console.log('Verification submitted successfully:', message);
                } else {
                  console.error('Verification submission failed:', message);
                }
              }}
            />
          )}

          {/* Admin Dashboard */}
          {isAdmin && activeTab === 'admin' && (
            <AdminVerificationDashboard
              adminId={user.walletAddress}
            />
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Help</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Document Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Clear, high-quality images</li>
                    <li>• All text must be readable</li>
                    <li>• Documents must be valid</li>
                    <li>• No edited or modified documents</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Verification Process</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Upload required documents</li>
                    <li>• Admin review (24-48 hours)</li>
                    <li>• Approval notification</li>
                    <li>• Access to full features</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">User Types</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Backer:</strong> Fund projects</li>
                    <li>• <strong>Creator:</strong> Launch projects</li>
                    <li>• <strong>NGO:</strong> Create NGO campaigns</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;