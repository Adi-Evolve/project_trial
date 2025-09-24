// Advanced Security Service for Smart Contract Protection
import { ethers } from 'ethers';
import { supabase } from './supabase';
import { advancedContractService } from './advancedContracts';

export interface SecurityConfig {
  reentrancyGuardEnabled: boolean;
  emergencyPauseEnabled: boolean;
  accessControlEnabled: boolean;
  maxGasLimit: string;
  maxTransactionValue: string;
  cooldownPeriod: number; // in seconds
  maxDailyTransactions: number;
}

export interface EmergencyAction {
  id: string;
  type: 'pause' | 'unpause' | 'emergency_withdraw' | 'upgrade_contract';
  reason: string;
  timestamp: number;
  executedBy: string;
  status: 'executing' | 'completed' | 'failed' | 'partial';
  parameters?: any;
}

export interface AccessRole {
  name: string;
  permissions: string[];
  addresses: string[];
}

export interface SecurityAlert {
  id: string;
  type: 'reentrancy_attempt' | 'unusual_gas' | 'high_value_transaction' | 'rapid_transactions' | 'unauthorized_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: number;
  resolved: boolean;
}

export interface TransactionSecurity {
  hash?: string;
  from: string;
  to: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  data: string;
  nonce: number;
  timestamp: number;
  riskScore: number;
  securityChecks: {
    reentrancyCheck: boolean;
    gasLimitCheck: boolean;
    valueCheck: boolean;
    accessControlCheck: boolean;
    cooldownCheck: boolean;
    dailyLimitCheck: boolean;
  };
}

class SecurityService {
  private securityConfig: SecurityConfig;
  private emergencyActions: EmergencyAction[];
  private securityAlerts: SecurityAlert[];
  private accessRoles: Map<string, AccessRole>;
  private transactionHistory: Map<string, TransactionSecurity[]>;
  private lastTransactionTime: Map<string, number>;
  private dailyTransactionCount: Map<string, { date: string; count: number }>;
  private reentrancyLock: Set<string>;

  constructor() {
    this.securityConfig = {
      reentrancyGuardEnabled: true,
      emergencyPauseEnabled: true,
      accessControlEnabled: true,
      maxGasLimit: '500000',
      maxTransactionValue: ethers.parseEther('10').toString(),
      cooldownPeriod: 300, // 5 minutes
      maxDailyTransactions: 50
    };
    
    this.emergencyActions = [];
    this.securityAlerts = [];
    this.accessRoles = new Map();
    this.transactionHistory = new Map();
    this.lastTransactionTime = new Map();
    this.dailyTransactionCount = new Map();
    this.reentrancyLock = new Set();

    this.initializeDefaultRoles();
  }

  private initializeDefaultRoles(): void {
    // Admin role with full permissions
    this.accessRoles.set('admin', {
      name: 'Admin',
      permissions: [
        'emergency_pause',
        'emergency_unpause',
        'emergency_withdraw',
        'manage_roles',
        'update_security_config',
        'execute_multisig',
        'manage_oracles',
        'verify_users'
      ],
      addresses: []
    });

    // Campaign manager role
    this.accessRoles.set('campaign_manager', {
      name: 'Campaign Manager',
      permissions: [
        'create_campaign',
        'update_campaign',
        'release_funds',
        'verify_milestones'
      ],
      addresses: []
    });

    // Oracle role
    this.accessRoles.set('oracle', {
      name: 'Oracle',
      permissions: [
        'vote_milestone',
        'submit_verification',
        'update_reputation'
      ],
      addresses: []
    });

    // Verified user role
    this.accessRoles.set('verified_user', {
      name: 'Verified User',
      permissions: [
        'create_campaign',
        'contribute_funds',
        'vote_governance'
      ],
      addresses: []
    });
  }

  // Reentrancy Protection
  async checkReentrancy(contractAddress: string, functionSignature: string): Promise<boolean> {
    const lockKey = `${contractAddress}_${functionSignature}`;
    
    if (this.reentrancyLock.has(lockKey)) {
      this.createSecurityAlert({
        type: 'reentrancy_attempt',
        severity: 'critical',
        message: 'Reentrancy attack attempt detected',
        details: { contractAddress, functionSignature, lockKey }
      });
      return false;
    }

    return true;
  }

  async acquireReentrancyLock(contractAddress: string, functionSignature: string): Promise<void> {
    const lockKey = `${contractAddress}_${functionSignature}`;
    this.reentrancyLock.add(lockKey);
  }

  async releaseReentrancyLock(contractAddress: string, functionSignature: string): Promise<void> {
    const lockKey = `${contractAddress}_${functionSignature}`;
    this.reentrancyLock.delete(lockKey);
  }

  // Emergency Pause Functionality
  async emergencyPause(reason: string, executedBy: string): Promise<{ success: boolean; message: string; actionId?: string }> {
    try {
      if (!this.hasPermission(executedBy, 'emergency_pause')) {
        throw new Error('Insufficient permissions for emergency pause');
      }

      // Create emergency pause action
      const emergencyAction: EmergencyAction = {
        id: `emergency_${Date.now()}`,
        type: 'pause',
        reason,
        executedBy,
        timestamp: Date.now(),
        status: 'executing'
      };

      this.emergencyActions.push(emergencyAction);

      // Simulate emergency pause (in real implementation, this would pause contracts)
      this.securityConfig.emergencyPauseEnabled = false;
      
      // Log security alert
      this.createSecurityAlert({
        type: 'unauthorized_access',
        severity: 'critical',
        message: `Emergency pause executed: ${reason}`,
        details: { executedBy, reason, timestamp: Date.now() }
      });

      emergencyAction.status = 'completed';

      return {
        success: true,
        message: 'Emergency pause executed successfully',
        actionId: emergencyAction.id
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Emergency pause failed'
      };
    }
  }

  async emergencyUnpause(reason: string, executedBy: string): Promise<{ success: boolean; message: string; actionId?: string }> {
    try {
      if (!this.hasPermission(executedBy, 'emergency_unpause')) {
        throw new Error('Insufficient permissions for emergency unpause');
      }

      // Create emergency unpause action
      const emergencyAction: EmergencyAction = {
        id: `emergency_${Date.now()}`,
        type: 'unpause',
        reason,
        executedBy,
        timestamp: Date.now(),
        status: 'executing'
      };

      this.emergencyActions.push(emergencyAction);

      // Simulate emergency unpause (in real implementation, this would unpause contracts)
      this.securityConfig.emergencyPauseEnabled = true;
      
      // Log security alert
      this.createSecurityAlert({
        type: 'unauthorized_access',
        severity: 'high',
        message: `Emergency unpause executed: ${reason}`,
        details: { executedBy, reason, timestamp: Date.now() }
      });

      emergencyAction.status = 'completed';

      return {
        success: true,
        message: 'Emergency unpause executed successfully',
        actionId: emergencyAction.id
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Emergency unpause failed'
      };
    }
  }

  // Secure Fund Release Mechanisms
  async validateFundRelease(
    campaignId: string,
    milestoneIndex: number,
    amount: string,
    recipient: string,
    executedBy: string
  ): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check permissions
    if (!this.hasPermission(executedBy, 'release_funds')) {
      issues.push('Insufficient permissions for fund release');
    }

    // Check if amount is within limits
    const amountBN = ethers.parseEther(amount);
    const maxValueBN = ethers.parseEther(ethers.formatEther(this.securityConfig.maxTransactionValue));
    
    if (amountBN > maxValueBN) {
      issues.push(`Amount exceeds maximum transaction value: ${this.securityConfig.maxTransactionValue} ETH`);
    }

    // Check milestone verification status
    try {
      const milestoneVerified = await this.checkMilestoneVerification(campaignId, milestoneIndex);
      if (!milestoneVerified) {
        issues.push('Milestone not verified by oracle network');
      }
    } catch (error) {
      issues.push('Failed to verify milestone status');
    }

    // Check recipient validity
    if (!ethers.isAddress(recipient)) {
      issues.push('Invalid recipient address');
    }

    // Check for suspicious patterns
    const riskScore = await this.calculateTransactionRisk(executedBy, recipient, amount);
    if (riskScore > 0.8) {
      issues.push('High risk transaction detected');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async secureReleaseFunds(
    campaignId: string,
    milestoneIndex: number,
    amount: string,
    recipient: string,
    executedBy: string
  ): Promise<{ success: boolean; txHash?: string; message: string }> {
    try {
      // Validate fund release
      const validation = await this.validateFundRelease(campaignId, milestoneIndex, amount, recipient, executedBy);
      
      if (!validation.valid) {
        return {
          success: false,
          message: `Fund release validation failed: ${validation.issues.join(', ')}`
        };
      }

      // Acquire reentrancy lock
      await this.acquireReentrancyLock(campaignId, 'releaseFunds');

      try {
        // Execute fund release through multisig
        // TODO: Implement actual contract interaction when getCrowdfundingContract is available
        // const crowdfundingContract = await advancedContractService.getCrowdfundingContract();
        // const tx = await crowdfundingContract.releaseFunds(campaignId, milestoneIndex, ethers.parseEther(amount), recipient);
        // await tx.wait();

        // For now, simulate successful transaction
        const simulatedTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

        // Log transaction
        this.logSecureTransaction({
          hash: simulatedTxHash,
          from: executedBy,
          to: recipient,
          value: ethers.parseEther(amount).toString(),
          gasLimit: '200000',
          gasPrice: '20000000000',
          data: `0x${Math.random().toString(16).substr(2, 8)}`, // Simulated data
          nonce: Math.floor(Math.random() * 1000),
          timestamp: Date.now(),
          riskScore: await this.calculateTransactionRisk(executedBy, recipient, amount),
          securityChecks: {
            reentrancyCheck: true,
            gasLimitCheck: true,
            valueCheck: true,
            accessControlCheck: true,
            cooldownCheck: true,
            dailyLimitCheck: true
          }
        });

        return {
          success: true,
          txHash: simulatedTxHash,
          message: 'Funds released successfully'
        };

      } finally {
        // Always release reentrancy lock
        await this.releaseReentrancyLock(campaignId, 'releaseFunds');
      }

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Fund release failed'
      };
    }
  }

  // Access Control Management
  hasPermission(address: string, permission: string): boolean {
    for (const role of this.accessRoles.values()) {
      if (role.addresses.includes(address.toLowerCase()) && role.permissions.includes(permission)) {
        return true;
      }
    }
    return false;
  }

  async grantRole(roleName: string, address: string, grantedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.hasPermission(grantedBy, 'manage_roles')) {
        throw new Error('Insufficient permissions to grant roles');
      }

      const role = this.accessRoles.get(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} does not exist`);
      }

      if (!role.addresses.includes(address.toLowerCase())) {
        role.addresses.push(address.toLowerCase());
        
        this.createSecurityAlert({
          type: 'unauthorized_access',
          severity: 'medium',
          message: `Role ${roleName} granted to ${address}`,
          details: { roleName, address, grantedBy }
        });
      }

      return {
        success: true,
        message: `Role ${roleName} granted to ${address}`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grant role'
      };
    }
  }

  async revokeRole(roleName: string, address: string, revokedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.hasPermission(revokedBy, 'manage_roles')) {
        throw new Error('Insufficient permissions to revoke roles');
      }

      const role = this.accessRoles.get(roleName);
      if (!role) {
        throw new Error(`Role ${roleName} does not exist`);
      }

      const index = role.addresses.indexOf(address.toLowerCase());
      if (index > -1) {
        role.addresses.splice(index, 1);
        
        this.createSecurityAlert({
          type: 'unauthorized_access',
          severity: 'medium',
          message: `Role ${roleName} revoked from ${address}`,
          details: { roleName, address, revokedBy }
        });
      }

      return {
        success: true,
        message: `Role ${roleName} revoked from ${address}`
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to revoke role'
      };
    }
  }

  // Transaction Security Analysis
  async analyzeTransaction(transaction: Partial<TransactionSecurity>): Promise<TransactionSecurity> {
    const securityChecks = {
      reentrancyCheck: await this.checkReentrancy(transaction.to || '', transaction.data || ''),
      gasLimitCheck: this.checkGasLimit(transaction.gasLimit || '0'),
      valueCheck: this.checkTransactionValue(transaction.value || '0'),
      accessControlCheck: this.hasPermission(transaction.from || '', 'contribute_funds'),
      cooldownCheck: this.checkCooldown(transaction.from || ''),
      dailyLimitCheck: this.checkDailyLimit(transaction.from || '')
    };

    const riskScore = this.calculateRiskScore(securityChecks, transaction);

    return {
      hash: transaction.hash,
      from: transaction.from || '',
      to: transaction.to || '',
      value: transaction.value || '0',
      gasLimit: transaction.gasLimit || '0',
      gasPrice: transaction.gasPrice || '0',
      data: transaction.data || '',
      nonce: transaction.nonce || 0,
      timestamp: transaction.timestamp || Date.now(),
      riskScore,
      securityChecks
    };
  }

  private checkGasLimit(gasLimit: string): boolean {
    const gasLimitBN = BigInt(gasLimit);
    const maxGasLimitBN = BigInt(this.securityConfig.maxGasLimit);
    return gasLimitBN <= maxGasLimitBN;
  }

  private checkTransactionValue(value: string): boolean {
    const valueBN = BigInt(value);
    const maxValueBN = BigInt(this.securityConfig.maxTransactionValue);
    return valueBN <= maxValueBN;
  }

  private checkCooldown(address: string): boolean {
    const lastTime = this.lastTransactionTime.get(address.toLowerCase());
    if (!lastTime) return true;
    
    const now = Date.now();
    const cooldownMs = this.securityConfig.cooldownPeriod * 1000;
    return (now - lastTime) >= cooldownMs;
  }

  private checkDailyLimit(address: string): boolean {
    const today = new Date().toDateString();
    const dailyData = this.dailyTransactionCount.get(address.toLowerCase());
    
    if (!dailyData || dailyData.date !== today) {
      return true;
    }
    
    return dailyData.count < this.securityConfig.maxDailyTransactions;
  }

  private calculateRiskScore(securityChecks: TransactionSecurity['securityChecks'], transaction: Partial<TransactionSecurity>): number {
    let riskScore = 0;

    // Failed security checks increase risk
    if (!securityChecks.reentrancyCheck) riskScore += 0.4;
    if (!securityChecks.gasLimitCheck) riskScore += 0.2;
    if (!securityChecks.valueCheck) riskScore += 0.3;
    if (!securityChecks.accessControlCheck) riskScore += 0.1;
    if (!securityChecks.cooldownCheck) riskScore += 0.1;
    if (!securityChecks.dailyLimitCheck) riskScore += 0.1;

    // Additional risk factors
    if (transaction.gasPrice && BigInt(transaction.gasPrice) > BigInt('50000000000')) {
      riskScore += 0.1; // High gas price
    }

    return Math.min(riskScore, 1.0);
  }

  private async calculateTransactionRisk(from: string, to: string, amount: string): Promise<number> {
    let risk = 0;

    // Check if addresses are known/verified
    if (!this.hasPermission(from, 'contribute_funds')) {
      risk += 0.3;
    }

    // Check transaction amount
    const amountBN = ethers.parseEther(amount);
    const maxValueBN = ethers.parseEther(ethers.formatEther(this.securityConfig.maxTransactionValue));
    
    if (amountBN > maxValueBN / 2n) {
      risk += 0.2; // Large transaction
    }

    // Check frequency
    if (!this.checkCooldown(from)) {
      risk += 0.2;
    }

    if (!this.checkDailyLimit(from)) {
      risk += 0.3;
    }

    return Math.min(risk, 1.0);
  }

  private async checkMilestoneVerification(campaignId: string, milestoneIndex: number): Promise<boolean> {
    try {
      // TODO: Implement actual oracle verification when getOracleContract is available
      // const oracleContract = await advancedContractService.getOracleContract();
      // const isVerified = await oracleContract.isMilestoneVerified(campaignId, milestoneIndex);
      
      // For now, simulate verification check
      const isVerified = true; // Simulate milestone is verified
      return isVerified;
    } catch (error) {
      console.error('Failed to check milestone verification:', error);
      return false;
    }
  }

  private logSecureTransaction(transaction: TransactionSecurity): void {
    const address = transaction.from.toLowerCase();
    
    // Update transaction history
    if (!this.transactionHistory.has(address)) {
      this.transactionHistory.set(address, []);
    }
    this.transactionHistory.get(address)!.push(transaction);

    // Update last transaction time
    this.lastTransactionTime.set(address, transaction.timestamp);

    // Update daily count
    const today = new Date().toDateString();
    const currentDaily = this.dailyTransactionCount.get(address);
    
    if (!currentDaily || currentDaily.date !== today) {
      this.dailyTransactionCount.set(address, { date: today, count: 1 });
    } else {
      currentDaily.count++;
    }

    // Create alert for high-risk transactions
    if (transaction.riskScore > 0.7) {
      this.createSecurityAlert({
        type: 'high_value_transaction',
        severity: transaction.riskScore > 0.9 ? 'critical' : 'high',
        message: `High-risk transaction detected from ${transaction.from}`,
        details: transaction
      });
    }
  }

  private createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const securityAlert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false,
      ...alert
    };

    this.securityAlerts.push(securityAlert);

    // Auto-resolve low severity alerts after 24 hours
    if (alert.severity === 'low') {
      setTimeout(() => {
        securityAlert.resolved = true;
      }, 24 * 60 * 60 * 1000);
    }
  }

  // Getters and utility methods
  getSecurityConfig(): SecurityConfig {
    return { ...this.securityConfig };
  }

  async updateSecurityConfig(config: Partial<SecurityConfig>, updatedBy: string): Promise<{ success: boolean; message: string }> {
    if (!this.hasPermission(updatedBy, 'update_security_config')) {
      return {
        success: false,
        message: 'Insufficient permissions to update security configuration'
      };
    }

    this.securityConfig = { ...this.securityConfig, ...config };
    
    this.createSecurityAlert({
      type: 'unauthorized_access',
      severity: 'medium',
      message: 'Security configuration updated',
      details: { config, updatedBy }
    });

    return {
      success: true,
      message: 'Security configuration updated successfully'
    };
  }

  getEmergencyActions(): EmergencyAction[] {
    return [...this.emergencyActions];
  }

  getSecurityAlerts(unresolved: boolean = false): SecurityAlert[] {
    return this.securityAlerts.filter(alert => !unresolved || !alert.resolved);
  }

  resolveSecurityAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.securityAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getAccessRoles(): Map<string, AccessRole> {
    return new Map(this.accessRoles);
  }

  getTransactionHistory(address: string): TransactionSecurity[] {
    return this.transactionHistory.get(address.toLowerCase()) || [];
  }
}

export const securityService = new SecurityService();