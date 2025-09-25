const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Pinata configuration
const PINATA_API_KEY = 'ae0b8efd5e77686dd30a';
const PINATA_SECRET_KEY = '50ec53eef6e29c98e8bbd1dc7badd01ac746ad64929a35458f42f481c95837aa';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYTc4YzgwZC1lZTMyLTRjOGUtYjE4MC0wZTBhN2RhYzA4YjMiLCJlbWFpbCI6InphaW5hYnBpcmphZGUyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJiOGM2Yjc1NWY0NGE4YTRmYzkwYSIsInNjb3BlZEtleVNlY3JldCI6Ijc2ZDRjNjU0M2RkZDNiY2ZmMmNkN2VmZTlkMDBlZTNhOTY1NjBmYTAxYWRmODk4YzY2MWYxMjRmNmMzY2MxOTciLCJleHAiOjE3OTAyMzM1OTd9.xKrHii9uGi5uGVhz19CuoslF1XZWq0cRBeMOA4-s0Kw';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud';

async function testPinataUpload() {
  console.log('🧪 Testing Pinata IPFS Image Upload and Retrieval...');

  try {
    // Create a simple test image (1x1 pixel PNG as base64)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    // Convert base64 to buffer
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');

    console.log('📤 Uploading test image to Pinata IPFS...');

    // Create form data
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-image.png',
      contentType: 'image/png'
    });

    // Add metadata
    formData.append('pinataMetadata', JSON.stringify({
      name: 'test-image.png',
      keyvalues: {
        type: 'test_image',
        uploadedBy: 'test-user',
        timestamp: new Date().toISOString()
      }
    }));

    // Add options
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    }));

    // Upload to Pinata
    const uploadResponse = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    if (!uploadResponse.data.IpfsHash) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    const ipfsHash = uploadResponse.data.IpfsHash;
    console.log('✅ Upload successful!');
    console.log('📋 IPFS Hash:', ipfsHash);
    console.log('🔗 IPFS URL:', `${PINATA_GATEWAY}/ipfs/${ipfsHash}`);

    // Wait for Pinata to process
    console.log('⏳ Waiting for Pinata to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test fetching the image back
    console.log('📥 Fetching image back from IPFS...');
    const imageUrl = `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;

    try {
      const fetchResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 10000
      });

      if (fetchResponse.status === 200) {
        console.log('✅ Image is accessible via IPFS URL');
        console.log('📊 Response status:', fetchResponse.status);
        console.log('📊 Content-Type:', fetchResponse.headers['content-type']);
        console.log('📊 Content-Length:', fetchResponse.headers['content-length']);
        console.log('📏 File data length:', fetchResponse.data.length, 'bytes');

        // Verify it's actually a PNG
        const buffer = Buffer.from(fetchResponse.data);
        const isPNG = buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]));
        console.log('🖼️  Is valid PNG:', isPNG);

      } else {
        console.warn('⚠️ Image URL returned status:', fetchResponse.status);
      }

    } catch (fetchError) {
      console.error('❌ Failed to fetch image back:', fetchError.message);
      return false;
    }

    console.log('🎉 Pinata IPFS test completed successfully!');
    console.log('📋 Final IPFS Hash:', ipfsHash);
    console.log('🔗 Final IPFS URL:', `${PINATA_GATEWAY}/ipfs/${ipfsHash}`);

    return true;

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    if (error.response) {
      console.error('📊 Response status:', error.response.status);
      console.error('📊 Response data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testPinataUpload().then(success => {
  console.log('\n' + '='.repeat(50));
  console.log('Test result:', success ? 'PASSED ✅' : 'FAILED ❌');
  console.log('='.repeat(50));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});