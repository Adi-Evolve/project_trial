import React, { useState } from 'react';
import { ipfsService } from '../../services/ipfsService';
// Deprecated: All IPFS/Pinata test logic removed. Use Google Drive or Supabase Storage only.
const TestPinataImageUpload: React.FC = () => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const runTest = async () => {
    setIsRunning(true);
    setTestResult(null);
    setUploadedImageUrl('');

    console.log('🧪 Starting Pinata IPFS Image Upload Test...\n');

    try {
      // Step 1: Test authentication
      console.log('1. Testing Pinata authentication...');
      const isAuthenticated = await ipfsService.testAuthentication();
      console.log(`   Authentication: ${isAuthenticated ? '✅ SUCCESS' : '❌ FAILED'}`);

      // Step 2: Create a test image
      console.log('\n2. Creating test image...');
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Create a colorful test pattern
      const gradient = ctx!.createLinearGradient(0, 0, 200, 200);
      gradient.addColorStop(0, '#ff6b6b');
      gradient.addColorStop(0.5, '#4ecdc4');
      gradient.addColorStop(1, '#45b7d1');
      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, 200, 200);

      // Add text
      ctx!.fillStyle = '#ffffff';
      ctx!.font = 'bold 20px Arial';
      ctx!.textAlign = 'center';
      ctx!.fillText('Pinata IPFS Test', 100, 90);
      ctx!.fillText('Image Upload', 100, 120);
      ctx!.font = '14px Arial';
      ctx!.fillText(new Date().toLocaleString(), 100, 150);

      // Convert to blob
      const imageBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.9);
      });

      if (!imageBlob) {
        throw new Error('Failed to create image blob');
      }

      const testImageFile = new File([imageBlob as Blob], `test-image-${Date.now()}.png`, { type: 'image/png' });
      console.log(`   Test image created: ${testImageFile.name} (${(testImageFile.size / 1024).toFixed(2)} KB)`);

      // Step 3: Upload to Pinata
      console.log('\n3. Uploading to Pinata IPFS...');
      const uploadResult = await ipfsService.uploadFile(testImageFile, {
        name: testImageFile.name,
        type: 'test_image',
        uploadedBy: 'test-user',
        description: 'Automated test image for Pinata IPFS functionality',
        timestamp: new Date().toISOString()
      });

      if (!uploadResult.success || !uploadResult.ipfsHash) {
        throw new Error(`Upload failed: ${uploadResult.error || 'No IPFS hash returned'}`);
      }

      console.log(`   ✅ Upload successful!`);
      console.log(`   📋 IPFS Hash: ${uploadResult.ipfsHash}`);

      const imageUrl = ipfsService.getFileUrl(uploadResult.ipfsHash);
      console.log(`   🔗 IPFS URL: ${imageUrl}`);

      // Step 4: Test fetching the image
      console.log('\n4. Testing image fetch...');
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const fetchedBlob = await response.blob();
      console.log(`   ✅ Fetch successful! (${(fetchedBlob.size / 1024).toFixed(2)} KB)`);

      // Create object URL for display
      const displayUrl = URL.createObjectURL(fetchedBlob);

      const result = {
        success: true,
        ipfsHash: uploadResult.ipfsHash,
        imageUrl: imageUrl,
        displayUrl: displayUrl,
        authenticated: isAuthenticated,
        originalSize: testImageFile.size,
        fetchedSize: fetchedBlob.size,
        timestamp: new Date().toISOString()
      };

      setTestResult(result);
      setUploadedImageUrl(displayUrl);

      console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
      console.log('Results:', result);

    } catch (error: any) {
      console.error('\n❌ TEST FAILED:', error);
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">🧪 Pinata IPFS Image Upload Test</h2>

        <div className="mb-6">
          <button
            onClick={runTest}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              isRunning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white'
            }`}
          >
            {isRunning ? '🔄 Running Test...' : '🚀 Run Pinata IPFS Test'}
          </button>
        </div>

        {testResult && (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
              <h3 className={`text-lg font-semibold mb-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                {testResult.success ? '✅ Test Successful!' : '❌ Test Failed'}
              </h3>

              {testResult.success ? (
                <div className="space-y-2 text-sm">
                  <p><strong>IPFS Hash:</strong> <code className="bg-black/30 px-2 py-1 rounded">{testResult.ipfsHash}</code></p>
                  <p><strong>IPFS URL:</strong> <a href={testResult.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">View on IPFS Gateway</a></p>
                  <p><strong>Authentication:</strong> {testResult.authenticated ? '✅ Real Pinata' : '⚠️ Mock Mode'}</p>
                  <p><strong>Original Size:</strong> {(testResult.originalSize / 1024).toFixed(2)} KB</p>
                  <p><strong>Fetched Size:</strong> {(testResult.fetchedSize / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div className="text-sm">
                  <p><strong>Error:</strong> {testResult.error}</p>
                </div>
              )}
            </div>

            {testResult.success && uploadedImageUrl && (
              <div className="bg-secondary-700/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">📷 Uploaded Image Preview:</h4>
                <div className="flex justify-center">
                  <img
                    src={uploadedImageUrl}
                    alt="Test upload result"
                    className="max-w-full h-auto rounded-lg border border-secondary-600"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
                <p className="text-center text-secondary-400 text-sm mt-2">
                  This image was uploaded to and fetched from Pinata IPFS
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-secondary-700/30 rounded-lg">
          <h4 className="text-white font-medium mb-2">📋 Test Details:</h4>
          <ul className="text-sm text-secondary-300 space-y-1">
            <li>• Creates a test image with canvas API</li>
            <li>• Uploads to Pinata IPFS (or uses mock mode if not configured)</li>
            <li>• Fetches the image back from IPFS gateway</li>
            <li>• Validates the image data and displays preview</li>
            <li>• Shows detailed results and troubleshooting info</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h4 className="text-blue-400 font-medium mb-2">🔧 Environment Check:</h4>
          <div className="text-sm text-secondary-300">
            <p><strong>Pinata API Key:</strong> {process.env.REACT_APP_PINATA_API_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Pinata Secret:</strong> {process.env.REACT_APP_PINATA_SECRET_KEY ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Pinata JWT:</strong> {process.env.REACT_APP_PINATA_JWT ? '✅ Set' : '❌ Not set'}</p>
            <p><strong>Gateway:</strong> {process.env.REACT_APP_PINATA_GATEWAY || 'https://gateway.pinata.cloud'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPinataImageUpload;