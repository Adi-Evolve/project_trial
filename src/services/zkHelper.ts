import zkPrivacy, { zkPrivacyService } from './zkPrivacy';

// Lightweight wrapper that uses snarkjs if available, otherwise falls back to demo helper
let snarkjs: any = null;
try {
  // eslint-disable-next-line global-require
  snarkjs = require('snarkjs');
} catch (e) {
  snarkjs = null;
}

export async function generateProof(data: any): Promise<any> {
  if (snarkjs) {
    // A placeholder: real snarkjs usage requires circuits, witness, zkey files.
    // For now, attempt to create a simple proof using arbitrary input via snarkjs.groth16.fullProve if configured.
    try {
      if (snarkjs.groth16 && typeof snarkjs.groth16.fullProve === 'function') {
        // This will fail unless the project includes circuit files; so we catch and fall back
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(data, 'circuit.wasm', 'circuit_final.zkey');
        return { proof, publicSignals };
      }
    } catch (err) {
      const e: any = err;
      console.warn('snarkjs proof generation failed, falling back to demo:', e.message || e);
    }
  }

  // Fallback demo proof - use the zkPrivacyService API
  return zkPrivacyService.generateZKProof(data.amount || '0', data.secret || 'demo', data.campaignId || 0);
}

export async function verifyProof(proof: any, publicSignals?: any): Promise<boolean> {
  if (snarkjs) {
    try {
      if (snarkjs.groth16 && typeof snarkjs.groth16.verify === 'function' && publicSignals) {
        // This will require a verification key; attempt and fallback on error
        const vkey = {}; // placeholder; real use requires a JSON vkey
        const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
        return !!res;
      }
    } catch (err) {
      const e: any = err;
      console.warn('snarkjs verify failed, falling back to demo verify:', e.message || e);
    }
  }

  return zkPrivacyService.verifyZKProof(proof);
}

export default { generateProof, verifyProof };
