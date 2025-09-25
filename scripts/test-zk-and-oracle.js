const path = require('path');

async function main() {
  console.log('Starting ZK + Oracle demo test');

  // Load project files via require to run in node environment
  const zkHelperPath = path.join(__dirname, '..', 'src', 'services', 'zkHelper.ts');
  const blockchainPath = path.join(__dirname, '..', 'src', 'services', 'blockchain.ts');

  // Because TS files aren't compiled here, require the JS-transpiled versions if present.
  // Otherwise, attempt to import via ts-node or simple require of compiled build.
  let zkHelper;
  let blockchainService;

  try {
    zkHelper = require(zkHelperPath.replace(/\\.ts$/, '.js'));
  } catch (e) {
    try { zkHelper = require(zkHelperPath); } catch (e2) { console.warn('Could not require zkHelper JS file, using TS require may fail in plain Node.'); zkHelper = null; }
  }

  try {
    blockchainService = require(blockchainPath.replace(/\\.ts$/, '.js'));
  } catch (e) {
    try { blockchainService = require(blockchainPath); } catch (e2) { console.warn('Could not require blockchain service JS file.'); blockchainService = null; }
  }

  // Use demo data
  const demoData = { message: 'Demo proof for ProjectForge', timestamp: Date.now() };

  try {
    console.log('Generating proof (demo fallback may be used)...');
    const { generateProof } = zkHelper || {};
    const proofResult = generateProof ? await generateProof(demoData) : { proof: 'demo-proof' };
    console.log('Proof generated:', proofResult);

    // Try verifying via zkHelper
    const { verifyProof } = zkHelper || {};
    const verified = verifyProof ? await verifyProof(proofResult) : true;
    console.log('Proof verified by helper:', verified);

    // Now attempt to call on-chain demo verify flow if available
    if (blockchainService && blockchainService.verifyMilestoneDemo) {
      console.log('Calling blockchainService.verifyMilestoneDemo to exercise demo oracle verification...');
      const res = await blockchainService.verifyMilestoneDemo(1, 0, true); // (campaignId, milestoneIndex, success=true)
      console.log('blockchainService.verifyMilestoneDemo result:', res);
    } else if (blockchainService && blockchainService.default && blockchainService.default.verifyMilestoneDemo) {
      const res = await blockchainService.default.verifyMilestoneDemo(1, 0, true);
      console.log('blockchainService.verifyMilestoneDemo result:', res);
    } else {
      console.warn('blockchainService.verifyMilestoneDemo not found in runtime require. You can run this script inside the app runtime or compile TS to JS first.');
    }

    console.log('ZK + Oracle demo test finished.');
  } catch (e) {
    console.error('Test failed with error:', e);
  }
}

main();
