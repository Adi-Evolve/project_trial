import React, { useState, useEffect } from 'react';
import { 
  userVerificationService, 
  UserProfile, 
  UserDocument,
  AdminVerificationAction 
} from '../../services/userVerification';
import DocumentViewer from '../ipfs/DocumentViewer';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { 
  Shield, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Building,
  User,
  CreditCard,
  FileText,
  Eye,
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  TrendingUp
} from 'lucide-react';

interface AdminVerificationDashboardProps {
  adminId: string;
  className?: string;
}

export const AdminVerificationDashboard: React.FC<AdminVerificationDashboardProps> = ({
  adminId,
  className
}) => {
  const [pendingVerifications, setPendingVerifications] = useState<UserProfile[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [verificationComments, setVerificationComments] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [verifications, stats] = await Promise.all([
        userVerificationService.getPendingVerifications(),
        userVerificationService.getVerificationStatistics()
      ]);
      
      setPendingVerifications(verifications);
      setStatistics(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserVerification = async (
    userId: string, 
    status: UserProfile['verificationStatus']
  ) => {
    try {
      setActionLoading(userId);
      setError('');
      setSuccess('');

      const result = await userVerificationService.updateUserVerificationStatus(
        userId,
        status,
        verificationComments,
        adminId
      );

      if (result.success) {
        setSuccess(result.message);
        setVerificationComments('');
        setSelectedUser(null);
        await loadData(); // Reload data
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update verification');
    } finally {
      setActionLoading('');
    }
  };

  const handleDocumentVerification = async (
    documentId: string,
    status: UserDocument['verificationStatus']
  ) => {
    try {
      setActionLoading(documentId);
      setError('');
      setSuccess('');

      const action: AdminVerificationAction = {
        documentId,
        status,
        comments: verificationComments,
        adminId
      };

      const result = await userVerificationService.verifyUserDocuments(action);

      if (result.success) {
        setSuccess(result.message);
        setVerificationComments('');
        await loadData(); // Reload data
      } else {
        throw new Error(result.message);
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify document');
    } finally {
      setActionLoading('');
    }
  };

  const getUserTypeIcon = (userType: UserProfile['userType']) => {
    const icons = {
      PROJECT_CREATOR: <User className="w-4 h-4" />,
      NGO_CREATOR: <Building className="w-4 h-4" />,
      BACKER: <CreditCard className="w-4 h-4" />
    };
    return icons[userType];
  };

  const getVerificationBadge = (status: UserProfile['verificationStatus']) => {
    const badges = {
      pending: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
      under_review: <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>,
      approved: <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>,
      rejected: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
    };
    return badges[status] || badges.pending;
  };

  const getDocumentVerificationBadge = (status: UserDocument['verificationStatus']) => {
    const badges = {
      pending: <Badge variant="secondary" size="sm"><Clock className="w-2 h-2 mr-1" />Pending</Badge>,
      under_review: <Badge variant="warning" size="sm"><AlertTriangle className="w-2 h-2 mr-1" />Review</Badge>,
      approved: <Badge variant="success" size="sm"><CheckCircle className="w-2 h-2 mr-1" />Approved</Badge>,
      rejected: <Badge variant="destructive" size="sm"><XCircle className="w-2 h-2 mr-1" />Rejected</Badge>
    };
    return badges[status] || badges.pending;
  };

  const filteredVerifications = pendingVerifications.filter(user => {
    const matchesStatus = filterStatus === 'all' || user.verificationStatus === filterStatus;
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading verification dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-xl font-bold">{statistics.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-bold">{statistics.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-xl font-bold">{statistics.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Under Review</p>
                  <p className="text-xl font-bold">{statistics.underReview}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              User Verifications ({filteredVerifications.length})
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or user type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Verification List */}
          <div className="space-y-4">
            {filteredVerifications.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No verification requests found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredVerifications.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getUserTypeIcon(user.userType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium">{user.name}</h3>
                          <Badge variant="outline">
                            {user.userType.replace('_', ' ')}
                          </Badge>
                          {getVerificationBadge(user.verificationStatus)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                          <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                          <span>Documents: {user.documents.length}</span>
                        </div>

                        {/* Documents Summary */}
                        <div className="flex flex-wrap gap-2">
                          {user.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center space-x-1">
                              <FileText className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-600">{doc.documentType}</span>
                              {getDocumentVerificationBadge(doc.verificationStatus)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        {selectedUser?.id === user.id ? 'Hide' : 'Review'}
                      </Button>

                      {user.verificationStatus === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserVerification(user.id, 'approved')}
                            disabled={actionLoading === user.id}
                            className="text-green-600 hover:text-green-700"
                          >
                            {actionLoading === user.id ? (
                              <div className="w-3 h-3 animate-spin rounded-full border border-gray-400 border-t-transparent" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUserVerification(user.id, 'rejected')}
                            disabled={actionLoading === user.id}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Review Section */}
                  {selectedUser?.id === user.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Comments Input */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          Verification Comments
                        </label>
                        <textarea
                          value={verificationComments}
                          onChange={(e) => setVerificationComments(e.target.value)}
                          placeholder="Add comments for the user..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      {/* Document Actions */}
                      <div>
                        <h4 className="font-medium mb-2">Document Actions</h4>
                        <div className="space-y-2">
                          {user.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{doc.documentName}</span>
                                {getDocumentVerificationBadge(doc.verificationStatus)}
                              </div>
                              
                              {doc.verificationStatus === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDocumentVerification(doc.id, 'approved')}
                                    disabled={actionLoading === doc.id}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDocumentVerification(doc.id, 'rejected')}
                                    disabled={actionLoading === doc.id}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Document Viewer */}
                      <DocumentViewer
                        userId={user.id}
                        showAdminActions={true}
                        onDocumentUpdate={() => loadData()}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVerificationDashboard;