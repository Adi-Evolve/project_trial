import { ipfsService } from '../services/ipfsService.js';

// Test function to upload and fetch an image from Pinata IPFS
async function testPinataImageUpload() {
  console.log('🧪 Testing Pinata IPFS Image Upload & Fetch...\n');

  try {
    // Step 1: Test authentication
    console.log('1. Testing Pinata authentication...');
    const isAuthenticated = await ipfsService.testAuthentication();
    console.log(`   Authentication: ${isAuthenticated ? '✅ SUCCESS' : '❌ FAILED'}`);

    if (!isAuthenticated) {
      console.log('   ⚠️  Pinata credentials not configured. Using mock mode.');
    }

    // Step 2: Create a test image (small PNG)
    console.log('\n2. Creating test image...');
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');

    // Create a simple gradient background
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#4ecdc4');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);

    // Add some text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Test Image', 50, 50);
    ctx.fillText('Pinata IPFS', 50, 70);

    // Convert canvas to blob
    const testImageBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!testImageBlob) {
      throw new Error('Failed to create test image blob');
    }

    // Create File object
    const testImageFile = new File([testImageBlob], 'test-image.png', { type: 'image/png' });
    console.log(`   Test image created: ${testImageFile.name} (${(testImageFile.size / 1024).toFixed(2)} KB)`);

    // Step 3: Upload image to Pinata
    console.log('\n3. Uploading image to Pinata IPFS...');
    const uploadResult = await ipfsService.uploadFile(testImageFile, {
      name: 'test-image.png',
      type: 'test_image',
      uploadedBy: 'test-user',
      description: 'Test image for Pinata IPFS functionality'
    });

    if (!uploadResult.success) {
      throw new Error(`Upload failed: ${uploadResult.error}`);
    }

    console.log(`   ✅ Upload successful!`);
    console.log(`   📋 IPFS Hash: ${uploadResult.ipfsHash}`);
    console.log(`   🔗 IPFS URL: ${ipfsService.getFileUrl(uploadResult.ipfsHash)}`);

    // Step 4: Fetch the image back
    console.log('\n4. Fetching image back from IPFS...');
    const imageUrl = ipfsService.getFileUrl(uploadResult.ipfsHash);
    console.log(`   🌐 Fetching from: ${imageUrl}`);

    // Test if the URL is accessible
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    console.log(`   ✅ Fetch successful!`);
    console.log(`   📄 Content-Type: ${contentType}`);
    console.log(`   📏 Content-Length: ${contentLength} bytes`);

    // Step 5: Verify the image data
    console.log('\n5. Verifying image data...');
    const imageBlob = await response.blob();
    console.log(`   📷 Image blob size: ${(imageBlob.size / 1024).toFixed(2)} KB`);
    console.log(`   🖼️  Image type: ${imageBlob.type}`);

    // Create an image element to verify it's a valid image
    const img = new Image();
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error('Invalid image data'));
      img.src = URL.createObjectURL(imageBlob);
    });

    await imageLoadPromise;
    console.log(`   ✅ Image validation successful!`);
    console.log(`   📐 Image dimensions: ${img.naturalWidth}x${img.naturalHeight}`);

    // Clean up
    URL.revokeObjectURL(img.src);

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('\n📊 Summary:');
    console.log(`   - Authentication: ${isAuthenticated ? 'Working' : 'Mock mode'}`);
    console.log(`   - Upload: ✅ Success`);
    console.log(`   - IPFS Hash: ${uploadResult.ipfsHash}`);
    console.log(`   - Fetch: ✅ Success`);
    console.log(`   - Image validation: ✅ Success`);

    return {
      success: true,
      ipfsHash: uploadResult.ipfsHash,
      imageUrl: imageUrl,
      authenticated: isAuthenticated
    };

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('Error:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.log('   - Check your Pinata API credentials in .env file');
    console.log('   - Ensure REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY are set');
    console.log('   - Verify your Pinata account has sufficient credits');
    console.log('   - Check network connectivity');

    return {
      success: false,
      error: error.message
    };
  }
}

// Export for use in other files
export { testPinataImageUpload };

// Auto-run if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - run test when DOM is ready
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Starting Pinata IPFS Test...\n');
    const result = await testPinataImageUpload();

    // Display results in a simple UI
    const resultsDiv = document.createElement('div');
    resultsDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      font-size: 12px;
      max-width: 400px;
      z-index: 9999;
    `;

    if (result.success) {
      resultsDiv.innerHTML = `
        <h3 style="color: #4ecdc4; margin: 0 0 10px 0;">✅ Test Successful!</h3>
        <p style="margin: 5px 0;">IPFS Hash: ${result.ipfsHash}</p>
        <p style="margin: 5px 0;">Auth: ${result.authenticated ? 'Real' : 'Mock'}</p>
        <a href="${result.imageUrl}" target="_blank" style="color: #74b9ff;">View Image</a>
      `;
    } else {
      resultsDiv.innerHTML = `
        <h3 style="color: #ff6b6b; margin: 0 0 10px 0;">❌ Test Failed</h3>
        <p style="margin: 5px 0;">${result.error}</p>
      `;
    }

    document.body.appendChild(resultsDiv);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (resultsDiv.parentNode) {
        resultsDiv.parentNode.removeChild(resultsDiv);
      }
    }, 10000);
  });
}