import React, { useState, useEffect } from 'react';
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
  ipfsStorageService, 
  DocumentMetadata, 
  DocumentSearchFilters,
  DocumentVerificationStatus 
} from '../../services/ipfsStorage';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Image, 
  File,
  Shield,
  AlertTriangle,
  Trash2,
  MoreVertical,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';

interface DocumentViewerProps {
  userId?: string;
  campaignId?: string;
  milestoneIndex?: number;
  allowedTypes?: DocumentMetadata['type'][];
  showAdminActions?: boolean;
  onDocumentUpdate?: (document: DocumentMetadata) => void;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  userId,
  campaignId,
  milestoneIndex,
  allowedTypes,
  showAdminActions = false,
  onDocumentUpdate,
  className
}) => {
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DocumentSearchFilters>({});
  const [selectedDocument, setSelectedDocument] = useState<DocumentMetadata | null>(null);
  const [actionLoading, setActionLoading] = useState<string>('');

  useEffect(() => {
    loadDocuments();
  }, [userId, campaignId, milestoneIndex, filters]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');

      await ipfsStorageService.initialize();

      const searchFilters: DocumentSearchFilters = {
        ...filters,
        ...(userId && { userId }),
        ...(campaignId && { campaignId }),
        ...(milestoneIndex !== undefined && { milestoneIndex }),
        ...(allowedTypes && { types: allowedTypes })
      };

      const results = await ipfsStorageService.searchDocuments(searchTerm, searchFilters);
      setDocuments(results.map(result => result.metadata));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadDocuments();
  };

  const handleFilterChange = (newFilters: Partial<DocumentSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleVerificationUpdate = async (
    documentId: string, 
    status: DocumentVerificationStatus, 
    comments?: string
  ) => {
    if (!showAdminActions) return;

    try {
      setActionLoading(documentId);
      
      await ipfsStorageService.updateVerificationStatus(documentId, status, comments);
      
      // Reload documents to get updated status
      await loadDocuments();
      
      if (onDocumentUpdate) {
        const updatedDoc = documents.find(doc => doc.id === documentId);
        if (updatedDoc) {
          onDocumentUpdate({ ...updatedDoc, verificationStatus: status });
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update verification status');
    } finally {
      setActionLoading('');
    }
  };

  const handleDownload = async (document: DocumentMetadata) => {
    try {
      setActionLoading(document.id!);
      
      const blob = await ipfsStorageService.downloadDocument(document.ipfsHash!);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = document.name;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download document');
    } finally {
      setActionLoading('');
    }
  };

  const handleView = (document: DocumentMetadata) => {
    if (document.ipfsHash) {
      const url = ipfsStorageService.getDocumentURL(document.ipfsHash);
      window.open(url, '_blank');
    }
  };

  const getFileIcon = (mimeType?: string) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (mimeType === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const getVerificationBadge = (status: DocumentVerificationStatus) => {
    const badges = {
      pending: <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
      approved: <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>,
      rejected: <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>,
      under_review: <Badge variant="warning"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>
    };
    return badges[status] || badges.pending;
  };

  const getTypeDisplayName = (type: DocumentMetadata['type']) => {
    const typeNames = {
      'aadhar': 'Aadhar Card',
      'pan': 'PAN Card',
      'ngo_certificate': 'NGO Certificate',
      'project_proposal': 'Project Proposal',
      'milestone_proof': 'Milestone Proof',
      'address_proof': 'Address Proof',
      'photo': 'Photo/Image',
      'other': 'Other Document'
    };
    return typeNames[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Document Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search documents by name, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Document Type</label>
                <select
                  value={filters.types?.[0] || ''}
                  onChange={(e) => handleFilterChange({ 
                    types: e.target.value ? [e.target.value as DocumentMetadata['type']] : undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All types</option>
                  <option value="aadhar">Aadhar Card</option>
                  <option value="pan">PAN Card</option>
                  <option value="ngo_certificate">NGO Certificate</option>
                  <option value="project_proposal">Project Proposal</option>
                  <option value="milestone_proof">Milestone Proof</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Verification Status</label>
                <select
                  value={filters.verificationStatus || ''}
                  onChange={(e) => handleFilterChange({ 
                    verificationStatus: e.target.value as DocumentVerificationStatus || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <select
                  value={filters.sortBy || 'uploadedAt'}
                  onChange={(e) => handleFilterChange({ 
                    sortBy: e.target.value as 'uploadedAt' | 'name' | 'type' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uploadedAt">Upload Date</option>
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Documents ({documents.length})
            {loading && <span className="ml-2 text-sm text-gray-500">Loading...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getFileIcon(document.mimeType)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium truncate">{document.name}</h3>
                          <Badge variant="outline">
                            <Tag className="w-3 h-3 mr-1" />
                            {getTypeDisplayName(document.type)}
                          </Badge>
                          {getVerificationBadge(document.verificationStatus || 'pending')}
                        </div>
                        
                        {document.description && (
                          <p className="text-sm text-gray-600 mb-2">{document.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {document.userId}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                          </span>
                          {document.size && (
                            <span className="flex items-center">
                              <FileText className="w-3 h-3 mr-1" />
                              {formatFileSize(document.size)}
                            </span>
                          )}
                          {document.ipfsHash && (
                            <span className="flex items-center">
                              <Shield className="w-3 h-3 mr-1" />
                              IPFS
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(document)}
                        disabled={!document.ipfsHash}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document)}
                        disabled={actionLoading === document.id || !document.ipfsHash}
                      >
                        {actionLoading === document.id ? (
                          <div className="w-3 h-3 animate-spin rounded-full border border-gray-400 border-t-transparent mr-1" />
                        ) : (
                          <Download className="w-3 h-3 mr-1" />
                        )}
                        Download
                      </Button>

                      {showAdminActions && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerificationUpdate(document.id!, 'approved')}
                            disabled={actionLoading === document.id || document.verificationStatus === 'approved'}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerificationUpdate(document.id!, 'rejected')}
                            disabled={actionLoading === document.id || document.verificationStatus === 'rejected'}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verification Comments */}
                  {document.verificationComments && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600">
                        <strong>Admin Comments:</strong> {document.verificationComments}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;