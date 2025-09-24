import { supabase } from './supabase';
import { contributionsService } from './contributionsService';
import { web3Service } from './web3';

class TransactionMonitorService {
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();
  
  /**
   * Start monitoring a transaction for confirmation
   */
  startMonitoring(txHash: string, maxAttempts: number = 60): void {
    console.log(`🔍 Starting transaction monitoring for: ${txHash}`);
    
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        // Check transaction status on blockchain
        const receipt = await web3Service.getTransactionReceipt(txHash);
        
        if (receipt) {
          console.log(`✅ Transaction confirmed: ${txHash}`);
          
          // Update contribution status in database
          await contributionsService.updateContributionStatus(
            txHash,
            receipt.status ? 'confirmed' : 'failed',
            receipt.blockNumber,
            receipt.gasUsed
          );
          
          // Stop monitoring
          this.stopMonitoring(txHash);
          
          // Update project totals
          const contribution = await contributionsService.getContributionByTxHash(txHash);
          if (contribution.success && contribution.contribution) {
            await contributionsService.updateProjectTotals(contribution.contribution.project_id);
          }
          
        } else if (attempts >= maxAttempts) {
          console.warn(`⚠️ Transaction monitoring timeout for: ${txHash}`);
          this.stopMonitoring(txHash);
        }
        
      } catch (error) {
        console.error(`❌ Error monitoring transaction ${txHash}:`, error);
        
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ Transaction monitoring failed for: ${txHash}`);
          this.stopMonitoring(txHash);
        }
      }
    }, 15000); // Check every 15 seconds
    
    this.monitoringIntervals.set(txHash, interval);
    
    // Auto-cleanup after max time
    setTimeout(() => {
      if (this.monitoringIntervals.has(txHash)) {
        console.warn(`⏰ Transaction monitoring auto-cleanup for: ${txHash}`);
        this.stopMonitoring(txHash);
      }
    }, maxAttempts * 15000);
  }
  
  /**
   * Stop monitoring a transaction
   */
  stopMonitoring(txHash: string): void {
    const interval = this.monitoringIntervals.get(txHash);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(txHash);
      console.log(`🛑 Stopped monitoring transaction: ${txHash}`);
    }
  }
  
  /**
   * Start monitoring all pending transactions from database
   */
  async startMonitoringPendingTransactions(): Promise<void> {
    try {
      console.log('🔍 Loading pending transactions to monitor...');
      
      const { data: pendingContributions, error } = await supabase
        .from('contributions')
        .select('blockchain_tx_hash')
        .eq('status', 'pending');
      
      if (error) {
        console.error('❌ Error loading pending transactions:', error);
        return;
      }
      
      if (pendingContributions && pendingContributions.length > 0) {
        console.log(`📊 Found ${pendingContributions.length} pending transactions to monitor`);
        
        pendingContributions.forEach(contrib => {
          this.startMonitoring(contrib.blockchain_tx_hash, 40); // 10 minutes max
        });
      } else {
        console.log('✅ No pending transactions to monitor');
      }
      
    } catch (error) {
      console.error('❌ Error starting pending transaction monitoring:', error);
    }
  }
  
  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    console.log('🛑 Stopping all transaction monitoring...');
    
    this.monitoringIntervals.forEach((interval, txHash) => {
      clearInterval(interval);
      console.log(`🛑 Stopped monitoring: ${txHash}`);
    });
    
    this.monitoringIntervals.clear();
  }
  
  /**
   * Get currently monitored transactions
   */
  getMonitoredTransactions(): string[] {
    return Array.from(this.monitoringIntervals.keys());
  }
}

export const transactionMonitorService = new TransactionMonitorService();

// Auto-start monitoring pending transactions when service loads
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    transactionMonitorService.startMonitoringPendingTransactions();
  }, 2000);
}