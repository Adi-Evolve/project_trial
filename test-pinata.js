import { ipfsService } from './services/ipfsService';

// Simple test script to run Pinata IPFS upload test
async function runPinataTest() {
  console.log('🧪 Starting Pinata IPFS Test...');

  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBlob = new Blob([
      new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
        0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
      ])
    ], { type: 'image/png' });

    // Create a File object
    const testImageFile = new File([testImageBlob], 'test-image.png', { type: 'image/png' });

    console.log('📤 Uploading test image to Pinata IPFS...');

    // Upload the image to Pinata
    const uploadResult = await ipfsService.uploadFile(testImageFile, {
      name: 'test-image.png',
      type: 'test_image',
      uploadedBy: 'test-user',
      timestamp: new Date().toISOString()
    });

    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error);
      return false;
    }

    console.log('✅ Upload successful!');
    console.log('📋 IPFS Hash:', uploadResult.ipfsHash);
    console.log('🔗 IPFS URL:', ipfsService.getFileUrl(uploadResult.ipfsHash));

    // Wait a moment for Pinata to process
    console.log('⏳ Waiting for Pinata to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try to fetch the image back
    console.log('📥 Fetching image back from IPFS...');
    try {
      const imageUrl = ipfsService.getFileUrl(uploadResult.ipfsHash);
      console.log('🌐 Image URL:', imageUrl);

      // Test if the URL is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (response.ok) {
        console.log('✅ Image is accessible via IPFS URL');
        console.log('📊 Response status:', response.status);
        console.log('📊 Content-Type:', response.headers.get('content-type'));
        console.log('📊 Content-Length:', response.headers.get('content-length'));
      } else {
        console.warn('⚠️ Image URL returned status:', response.status);
      }

      // Try to get file data
      const fileData = await ipfsService.getFileData(uploadResult.ipfsHash);
      console.log('📄 Retrieved file data type:', typeof fileData);
      if (fileData) {
        console.log('📏 File data length:', fileData.length || 'N/A');
        console.log('📏 File data preview:', fileData.slice ? fileData.slice(0, 50) : 'Not sliceable');
      }

    } catch (fetchError) {
      console.error('❌ Failed to fetch image back:', fetchError);
      return false;
    }

    console.log('🎉 Pinata IPFS test completed successfully!');
    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error);
    return false;
  }
}

// Run the test
runPinataTest().then(success => {
  console.log('Test result:', success ? 'PASSED' : 'FAILED');
}).catch(error => {
  console.error('Test execution failed:', error);
});