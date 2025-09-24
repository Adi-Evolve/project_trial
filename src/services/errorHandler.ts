import { toast } from 'react-hot-toast';

// Error categories
export enum ErrorCategory {
  WALLET_CONNECTION = 'wallet_connection',
  NETWORK = 'network',
  BLOCKCHAIN = 'blockchain',
  DATABASE = 'database',
  VALIDATION = 'validation',
  PERMISSIONS = 'permissions',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorDetails {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  suggestedAction?: string;
  technicalDetails?: any;
  retryable: boolean;
}

export interface ErrorContext {
  operation: string;
  component: string;
  userId?: string;
  timestamp: string;
  additionalInfo?: any;
}

class ErrorHandlingService {
  private readonly errorPatterns: Map<string, ErrorDetails> = new Map();

  constructor() {
    this.initializeErrorPatterns();
  }

  private initializeErrorPatterns(): void {
    // MetaMask/Wallet errors
    this.errorPatterns.set('4001', {
      code: '4001',
      message: 'User rejected the request',
      category: ErrorCategory.WALLET_CONNECTION,
      severity: ErrorSeverity.LOW,
      userMessage: 'Transaction was cancelled. Please try again when you\'re ready.',
      suggestedAction: 'Click the transaction button again to retry',
      retryable: true
    });

    this.errorPatterns.set('4100', {
      code: '4100',
      message: 'The requested account and/or method has not been authorized',
      category: ErrorCategory.PERMISSIONS,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'MetaMask access not authorized. Please connect your wallet.',
      suggestedAction: 'Click "Connect Wallet" to authorize access',
      retryable: true
    });

    this.errorPatterns.set('4900', {
      code: '4900',
      message: 'The provider is disconnected from all chains',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      userMessage: 'MetaMask is disconnected. Please check your connection.',
      suggestedAction: 'Open MetaMask and ensure it\'s connected to the internet',
      retryable: true
    });

    this.errorPatterns.set('4901', {
      code: '4901',
      message: 'The provider is not connected to the requested chain',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Please switch to Sepolia Testnet in MetaMask.',
      suggestedAction: 'We\'ll help you switch networks automatically',
      retryable: true
    });

    // Gas and balance errors
    this.errorPatterns.set('insufficient_funds', {
      code: 'insufficient_funds',
      message: 'Insufficient funds for gas * price + value',
      category: ErrorCategory.BLOCKCHAIN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Insufficient ETH balance for this transaction.',
      suggestedAction: 'Add more Sepolia ETH to your wallet or reduce the amount',
      retryable: true
    });

    this.errorPatterns.set('gas_limit', {
      code: 'gas_limit',
      message: 'Gas limit exceeded',
      category: ErrorCategory.BLOCKCHAIN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Transaction requires too much gas.',
      suggestedAction: 'Try reducing the transaction amount or wait for lower network congestion',
      retryable: true
    });

    // Contract errors
    this.errorPatterns.set('contract_not_deployed', {
      code: 'contract_not_deployed',
      message: 'Contract not deployed',
      category: ErrorCategory.BLOCKCHAIN,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Smart contract is not available.',
      suggestedAction: 'Please try again later or contact support',
      retryable: false
    });

    this.errorPatterns.set('execution_reverted', {
      code: 'execution_reverted',
      message: 'Execution reverted',
      category: ErrorCategory.BLOCKCHAIN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Transaction failed due to smart contract rules.',
      suggestedAction: 'Check transaction details and try again',
      retryable: true
    });

    // Network errors
    this.errorPatterns.set('network_error', {
      code: 'network_error',
      message: 'Network request failed',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Network connection issue. Please check your internet.',
      suggestedAction: 'Check your internet connection and try again',
      retryable: true
    });

    this.errorPatterns.set('rpc_error', {
      code: 'rpc_error',
      message: 'RPC endpoint error',
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Blockchain network is temporarily unavailable.',
      suggestedAction: 'Please try again in a few moments',
      retryable: true
    });

    // Database errors
    this.errorPatterns.set('supabase_404', {
      code: 'supabase_404',
      message: 'Resource not found',
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Requested data not found.',
      suggestedAction: 'Please refresh the page and try again',
      retryable: true
    });

    this.errorPatterns.set('supabase_401', {
      code: 'supabase_401',
      message: 'Unauthorized',
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Authentication required. Please sign in again.',
      suggestedAction: 'Sign out and sign in again',
      retryable: false
    });

    // Validation errors
    this.errorPatterns.set('invalid_address', {
      code: 'invalid_address',
      message: 'Invalid Ethereum address',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      userMessage: 'Invalid wallet address format.',
      suggestedAction: 'Please enter a valid Ethereum address',
      retryable: true
    });

    this.errorPatterns.set('invalid_amount', {
      code: 'invalid_amount',
      message: 'Invalid amount',
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      userMessage: 'Please enter a valid amount greater than 0.',
      suggestedAction: 'Enter a positive number for the amount',
      retryable: true
    });
  }

  /**
   * Handle and classify an error
   */
  handleError(
    error: any,
    context: ErrorContext,
    showToast: boolean = true
  ): ErrorDetails {
    console.group(`🚨 Error in ${context.component}:${context.operation}`);
    console.error('Original error:', error);
    console.log('Context:', context);

    const errorDetails = this.classifyError(error);
    
    // Log structured error data
    this.logError(errorDetails, context);

    // Show user-friendly message
    if (showToast) {
      this.showErrorToast(errorDetails);
    }

    console.groupEnd();
    return errorDetails;
  }

  /**
   * Classify error based on patterns
   */
  private classifyError(error: any): ErrorDetails {
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    // Try to match known error patterns
    if (errorCode && this.errorPatterns.has(errorCode)) {
      return { ...this.errorPatterns.get(errorCode)!, technicalDetails: error };
    }

    // Pattern matching for common error types
    if (errorMessage.includes('User denied') || errorMessage.includes('user rejected')) {
      return { ...this.errorPatterns.get('4001')!, technicalDetails: error };
    }

    if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
      return { ...this.errorPatterns.get('insufficient_funds')!, technicalDetails: error };
    }

    if (errorMessage.includes('gas limit') || errorMessage.includes('out of gas')) {
      return { ...this.errorPatterns.get('gas_limit')!, technicalDetails: error };
    }

    if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
      return { ...this.errorPatterns.get('execution_reverted')!, technicalDetails: error };
    }

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return { ...this.errorPatterns.get('network_error')!, technicalDetails: error };
    }

    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return { ...this.errorPatterns.get('supabase_401')!, technicalDetails: error };
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return { ...this.errorPatterns.get('supabase_404')!, technicalDetails: error };
    }

    // Default unknown error
    return {
      code: 'unknown',
      message: errorMessage || 'Unknown error occurred',
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'An unexpected error occurred. Please try again.',
      suggestedAction: 'If the problem persists, please contact support',
      technicalDetails: error,
      retryable: true
    };
  }

  /**
   * Extract error message from various error formats
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.data?.message) return error.data.message;
    if (error?.reason) return error.reason;
    if (error?.error?.message) return error.error.message;
    return JSON.stringify(error);
  }

  /**
   * Extract error code from various error formats
   */
  private extractErrorCode(error: any): string | null {
    if (error?.code) return error.code.toString();
    if (error?.error?.code) return error.error.code.toString();
    if (error?.data?.code) return error.data.code.toString();
    return null;
  }

  /**
   * Log error details for debugging and monitoring
   */
  private logError(errorDetails: ErrorDetails, context: ErrorContext): void {
    const logData = {
      timestamp: context.timestamp,
      operation: context.operation,
      component: context.component,
      userId: context.userId,
      errorCode: errorDetails.code,
      errorCategory: errorDetails.category,
      errorSeverity: errorDetails.severity,
      errorMessage: errorDetails.message,
      userMessage: errorDetails.userMessage,
      retryable: errorDetails.retryable,
      technicalDetails: errorDetails.technicalDetails,
      additionalInfo: context.additionalInfo
    };

    console.log('📊 Structured Error Log:', logData);

    // In production, you would send this to your error monitoring service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    // errorMonitoring.captureException(logData);
  }

  /**
   * Show appropriate toast message to user
   */
  private showErrorToast(errorDetails: ErrorDetails): void {
    const toastOptions = {
      duration: this.getToastDuration(errorDetails.severity),
      icon: this.getErrorIcon(errorDetails.severity),
    };

    let message = errorDetails.userMessage;
    if (errorDetails.suggestedAction) {
      message += ` ${errorDetails.suggestedAction}`;
    }

    switch (errorDetails.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(message, toastOptions);
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(message, toastOptions);
        break;
      case ErrorSeverity.LOW:
        toast(message, toastOptions);
        break;
      default:
        toast.error(message, toastOptions);
    }
  }

  /**
   * Get toast duration based on error severity
   */
  private getToastDuration(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return 10000; // 10 seconds
      case ErrorSeverity.HIGH: return 8000; // 8 seconds
      case ErrorSeverity.MEDIUM: return 6000; // 6 seconds
      case ErrorSeverity.LOW: return 4000; // 4 seconds
      default: return 5000;
    }
  }

  /**
   * Get appropriate icon for error severity
   */
  private getErrorIcon(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return '🚨';
      case ErrorSeverity.HIGH: return '❌';
      case ErrorSeverity.MEDIUM: return '⚠️';
      case ErrorSeverity.LOW: return '💡';
      default: return '❌';
    }
  }

  /**
   * Create error context
   */
  createContext(
    operation: string, 
    component: string, 
    userId?: string,
    additionalInfo?: any
  ): ErrorContext {
    return {
      operation,
      component,
      userId,
      timestamp: new Date().toISOString(),
      additionalInfo
    };
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ErrorDetails): boolean {
    return error.retryable;
  }

  /**
   * Get retry suggestion based on error
   */
  getRetrySuggestion(error: ErrorDetails): string {
    if (!error.retryable) {
      return 'This error cannot be automatically retried.';
    }

    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'Check your internet connection and try again in a few seconds.';
      case ErrorCategory.WALLET_CONNECTION:
        return 'Make sure MetaMask is unlocked and try connecting again.';
      case ErrorCategory.BLOCKCHAIN:
        return 'Wait a moment for network congestion to clear and retry.';
      case ErrorCategory.DATABASE:
        return 'Refresh the page and try again.';
      default:
        return 'Please try again in a few moments.';
    }
  }
}

export const errorHandler = new ErrorHandlingService();