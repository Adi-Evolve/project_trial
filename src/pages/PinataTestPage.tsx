import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { testPinataImageUpload } from '../utils/testPinata';

const PinataTestPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const runTest = async () => {
    setIsRunning(true);
    setLogs([]);

    addLog('🚀 Starting Pinata IPFS Test...');

    try {
      await testPinataImageUpload();
      addLog('✅ Test completed successfully!');
    } catch (error) {
      addLog(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-900 to-secondary-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Pinata IPFS Test</h1>
          <p className="text-gray-400 text-lg">
            Test image upload to Pinata IPFS and retrieval
          </p>
        </div>

        <div className="bg-secondary-800/50 backdrop-blur-xl rounded-2xl border border-secondary-700/50 p-8">
          <div className="flex justify-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runTest}
              disabled={isRunning}
              className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 ${
                isRunning
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 shadow-lg shadow-purple-500/25'
              }`}
            >
              {isRunning ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Running Test...</span>
                </div>
              ) : (
                '🧪 Run Pinata Test'
              )}
            </motion.button>
          </div>

          <div className="bg-secondary-900/50 rounded-xl p-6 border border-secondary-700/30">
            <h3 className="text-lg font-semibold text-white mb-4">Test Logs</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 italic">Click "Run Pinata Test" to start testing...</p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono text-gray-300 bg-secondary-800/30 p-2 rounded border-l-2 border-primary-500/50"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-secondary-900/50 rounded-xl p-6 border border-secondary-700/30">
              <h4 className="text-lg font-semibold text-white mb-3">What this test does:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Creates a small test PNG image</li>
                <li>• Uploads it to Pinata IPFS</li>
                <li>• Retrieves the IPFS hash and URL</li>
                <li>• Tests fetching the image back</li>
                <li>• Verifies the image is accessible</li>
              </ul>
            </div>

            <div className="bg-secondary-900/50 rounded-xl p-6 border border-secondary-700/30">
              <h4 className="text-lg font-semibold text-white mb-3">Requirements:</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Pinata API credentials in .env</li>
                <li>• REACT_APP_PINATA_API_KEY</li>
                <li>• REACT_APP_PINATA_SECRET_KEY</li>
                <li>• REACT_APP_PINATA_JWT (optional)</li>
                <li>• Internet connection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinataTestPage;