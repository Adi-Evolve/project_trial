import React, { useState, useCallback } from 'react';
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
  DocumentUploadResult 
} from '../../services/ipfsStorage';
import { 
  Upload, 
  File, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Image,
  FileCheck,
  Shield
} from 'lucide-react';

interface DocumentUploadProps {
  userId: string;
  campaignId?: string;
  milestoneIndex?: number;
  allowedTypes?: DocumentMetadata['type'][];
  onUploadSuccess?: (result: DocumentUploadResult) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  userId,
  campaignId,
  milestoneIndex,
  allowedTypes = ['aadhar', 'pan', 'ngo_certificate', 'project_proposal', 'milestone_proof', 'other'],
  onUploadSuccess,
  onUploadError,
  className
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadResults, setUploadResults] = useState<DocumentUploadResult[]>([]);
  const [error, setError] = useState<string>('');

  // Document metadata for each file
  const [fileMetadata, setFileMetadata] = useState<Record<string, Partial<DocumentMetadata>>>({});

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      // Check file type
      const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      
      if (!allowedMimeTypes.includes(file.type)) {
        setError(`File ${file.name} has unsupported format.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setError('');
      
      // Initialize metadata for new files
      const newMetadata: Record<string, Partial<DocumentMetadata>> = {};
      validFiles.forEach(file => {
        newMetadata[file.name] = {
          name: file.name,
          type: 'other',
          description: '',
          userId,
          campaignId,
          milestoneIndex
        };
      });
      setFileMetadata(prev => ({ ...prev, ...newMetadata }));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const updateFileMetadata = (fileName: string, updates: Partial<DocumentMetadata>) => {
    setFileMetadata(prev => ({
      ...prev,
      [fileName]: { ...prev[fileName], ...updates }
    }));
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setFileMetadata(prev => {
      const newMetadata = { ...prev };
      delete newMetadata[fileName];
      return newMetadata;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    // Validate all files have required metadata
    const invalidFiles = selectedFiles.filter(file => {
      const metadata = fileMetadata[file.name];
      return !metadata?.type || !metadata?.name;
    });

    if (invalidFiles.length > 0) {
      setError('Please fill in all required metadata for all files');
      return;
    }

    try {
      setUploading(true);
      setError('');

      await ipfsStorageService.initialize();

      const uploadPromises = selectedFiles.map(async (file) => {
        const metadata = fileMetadata[file.name];
        
        setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));

        try {
          const result = await ipfsStorageService.uploadDocument(file, {
            name: metadata.name!,
            type: metadata.type!,
            description: metadata.description,
            userId,
            campaignId,
            milestoneIndex
          });

          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          
          if (onUploadSuccess) {
            onUploadSuccess(result);
          }

          return result;
        } catch (error) {
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
          throw error;
        }
      });

      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<DocumentUploadResult> => 
          result.status === 'fulfilled')
        .map(result => result.value);

      const failed = results
        .filter((result): result is PromiseRejectedResult => 
          result.status === 'rejected')
        .map(result => result.reason);

      setUploadResults(successful);

      if (failed.length > 0) {
        const errorMessage = failed.map(err => err.message || 'Unknown error').join(', ');
        setError(`Some uploads failed: ${errorMessage}`);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      }

      // Clear successful uploads
      if (successful.length > 0) {
        const successfulFileNames = successful.map(result => result.metadata.name);
        setSelectedFiles(prev => 
          prev.filter(file => !successfulFileNames.includes(file.name))
        );
        
        // Clear metadata for successful uploads
        setFileMetadata(prev => {
          const newMetadata = { ...prev };
          successfulFileNames.forEach(name => delete newMetadata[name]);
          return newMetadata;
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-4 h-4" />;
    } else {
      return <File className="w-4 h-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === -1) return 'bg-red-500';
    if (progress === 100) return 'bg-green-500';
    return 'bg-blue-500';
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

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-12 h-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600">
                  Supports PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB each)
                </p>
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Files
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedFiles.map((file, index) => {
                const metadata = fileMetadata[file.name] || {};
                const progress = uploadProgress[file.name] || 0;
                
                return (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {progress > 0 && (
                          <div className="flex items-center space-x-2">
                            {progress === 100 && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {progress === -1 && <XCircle className="w-4 h-4 text-red-600" />}
                            {progress > 0 && progress < 100 && <Clock className="w-4 h-4 text-blue-600" />}
                            <span className="text-sm">
                              {progress === -1 ? 'Failed' : progress === 100 ? 'Uploaded' : `${progress}%`}
                            </span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFile(file.name)}
                          disabled={uploading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Upload Progress Bar */}
                    {progress > 0 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Metadata Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Document Type *</label>
                        <select
                          value={metadata.type || ''}
                          onChange={(e) => updateFileMetadata(file.name, { 
                            type: e.target.value as DocumentMetadata['type'] 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={uploading}
                        >
                          <option value="">Select type...</option>
                          {allowedTypes.map(type => (
                            <option key={type} value={type}>
                              {getTypeDisplayName(type)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Display Name *</label>
                        <input
                          type="text"
                          value={metadata.name || file.name}
                          onChange={(e) => updateFileMetadata(file.name, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={metadata.description || ''}
                        onChange={(e) => updateFileMetadata(file.name, { description: e.target.value })}
                        placeholder="Optional description..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        disabled={uploading}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={uploadFiles}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s) to IPFS`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Successfully Uploaded ({uploadResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileCheck className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-medium">{result.metadata.name}</p>
                      <p className="text-sm text-gray-600">
                        {getTypeDisplayName(result.metadata.type)} • {(result.pinSize / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      <Shield className="w-3 h-3 mr-1" />
                      IPFS Stored
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const url = ipfsStorageService.getDocumentURL(result.ipfsHash);
                        window.open(url, '_blank');
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;