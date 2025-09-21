import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DevicePhoneMobileIcon,
  CloudIcon,
  BellIcon,
  ArrowDownTrayIcon,
  WifiIcon,
  SignalIcon,
  BoltIcon,
  CameraIcon,
  MicrophoneIcon,
  MapPinIcon,
  SunIcon,
  MoonIcon,
  CogIcon,
  ShareIcon,
  HomeIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  FolderIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  NoSymbolIcon
} from '@heroicons/react/24/outline';
import {
  DevicePhoneMobileIcon as PhoneSolid,
  CloudIcon as CloudSolid,
  BellIcon as BellSolid,
  CheckCircleIcon as CheckSolid,
  WifiIcon as WifiSolid
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface PWACapabilities {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  hasLocationPermission: boolean;
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  hasOfflineStorage: boolean;
  supportsPushNotifications: boolean;
  supportsServiceWorker: boolean;
  supportsWebShare: boolean;
  supportsBackgroundSync: boolean;
}

interface OfflineData {
  projects: number;
  messages: number;
  files: number;
  lastSync: Date;
  totalSize: string;
  syncStatus: 'synced' | 'syncing' | 'pending' | 'error';
}

interface NotificationSettings {
  enabled: boolean;
  projectUpdates: boolean;
  messages: boolean;
  deadlines: boolean;
  mentions: boolean;
  achievements: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface MobileOptimization {
  viewportHeight: number;
  isLandscape: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  touchSupport: boolean;
  networkType: string;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

const MobilePWAFeatures: React.FC = () => {
  const [pwaCapabilities, setPWACapabilities] = useState<PWACapabilities>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    hasNotificationPermission: false,
    hasLocationPermission: false,
    hasCameraPermission: false,
    hasMicrophonePermission: false,
    hasOfflineStorage: false,
    supportsPushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
    supportsServiceWorker: 'serviceWorker' in navigator,
    supportsWebShare: 'share' in navigator,
    supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
  });

  const [offlineData, setOfflineData] = useState<OfflineData>({
    projects: 12,
    messages: 156,
    files: 34,
    lastSync: new Date(Date.now() - 5 * 60 * 1000),
    totalSize: '24.5 MB',
    syncStatus: 'synced'
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: false,
    projectUpdates: true,
    messages: true,
    deadlines: true,
    mentions: true,
    achievements: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const [mobileOptimization, setMobileOptimization] = useState<MobileOptimization>({
    viewportHeight: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight,
    deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
    touchSupport: 'ontouchstart' in window,
    networkType: 'unknown',
    connectionSpeed: 'medium'
  });

  const [activeTab, setActiveTab] = useState<'install' | 'offline' | 'notifications' | 'mobile' | 'features'>('install');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installationStatus, setInstallationStatus] = useState<'none' | 'installing' | 'installed' | 'error'>('none');

  // PWA Installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPWACapabilities(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setPWACapabilities(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setInstallationStatus('installed');
      toast.success('App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Online/Offline status
  useEffect(() => {
    const handleOnline = () => {
      setPWACapabilities(prev => ({ ...prev, isOnline: true }));
      toast.success('Back online! Syncing data...');
      syncOfflineData();
    };

    const handleOffline = () => {
      setPWACapabilities(prev => ({ ...prev, isOnline: false }));
      toast.error('You\'re offline. Changes will sync when you reconnect.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Responsive design updates
  useEffect(() => {
    const handleResize = () => {
      setMobileOptimization(prev => ({
        ...prev,
        viewportHeight: window.innerHeight,
        isLandscape: window.innerWidth > window.innerHeight,
        deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // Notification permission
      if ('Notification' in window) {
        const notificationPermission = await Notification.requestPermission();
        setPWACapabilities(prev => ({
          ...prev,
          hasNotificationPermission: notificationPermission === 'granted'
        }));
        setNotificationSettings(prev => ({
          ...prev,
          enabled: notificationPermission === 'granted'
        }));
      }

      // Location permission
      if ('geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then(result => {
          setPWACapabilities(prev => ({
            ...prev,
            hasLocationPermission: result.state === 'granted'
          }));
        });
      }

      // Camera permission
      if ('mediaDevices' in navigator) {
        navigator.permissions.query({ name: 'camera' as PermissionName }).then(result => {
          setPWACapabilities(prev => ({
            ...prev,
            hasCameraPermission: result.state === 'granted'
          }));
        });
      }

      // Check storage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          setPWACapabilities(prev => ({
            ...prev,
            hasOfflineStorage: true
          }));
        });
      }

      // Network information
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setMobileOptimization(prev => ({
          ...prev,
          networkType: connection.effectiveType || 'unknown',
          connectionSpeed: connection.downlink > 5 ? 'fast' : connection.downlink > 1 ? 'medium' : 'slow'
        }));
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const installPWA = async () => {
    if (!deferredPrompt) return;

    setInstallationStatus('installing');
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallationStatus('installed');
        toast.success('App installation started!');
      } else {
        setInstallationStatus('none');
        toast.error('Installation cancelled');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      setInstallationStatus('error');
      toast.error('Installation failed');
    }
  };

  const syncOfflineData = () => {
    setOfflineData(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    setTimeout(() => {
      setOfflineData(prev => ({
        ...prev,
        syncStatus: 'synced',
        lastSync: new Date()
      }));
      toast.success('Data synced successfully!');
    }, 2000);
  };

  const clearOfflineData = () => {
    setOfflineData({
      projects: 0,
      messages: 0,
      files: 0,
      lastSync: new Date(),
      totalSize: '0 MB',
      syncStatus: 'synced'
    });
    toast.success('Offline data cleared');
  };

  const testNotification = () => {
    if (pwaCapabilities.hasNotificationPermission) {
      new Notification('ProjectForge', {
        body: 'This is a test notification from your PWA!',
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    } else {
      toast.error('Notification permission not granted');
    }
  };

  const shareApp = async () => {
    if (pwaCapabilities.supportsWebShare) {
      try {
        await navigator.share({
          title: 'ProjectForge',
          text: 'Check out this amazing project management tool!',
          url: window.location.href
        });
      } catch (error) {
        toast.error('Sharing failed');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const requestPermission = async (type: 'camera' | 'microphone' | 'location') => {
    try {
      switch (type) {
        case 'camera':
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setPWACapabilities(prev => ({ ...prev, hasCameraPermission: true }));
          toast.success('Camera permission granted');
          break;
        case 'microphone':
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStream.getTracks().forEach(track => track.stop());
          setPWACapabilities(prev => ({ ...prev, hasMicrophonePermission: true }));
          toast.success('Microphone permission granted');
          break;
        case 'location':
          navigator.geolocation.getCurrentPosition(
            () => {
              setPWACapabilities(prev => ({ ...prev, hasLocationPermission: true }));
              toast.success('Location permission granted');
            },
            () => {
              toast.error('Location permission denied');
            }
          );
          break;
      }
    } catch (error) {
      toast.error(`${type} permission denied`);
    }
  };

  const getDeviceInfo = () => {
    const { deviceType, isLandscape, viewportHeight, touchSupport, networkType, connectionSpeed } = mobileOptimization;
    
    return {
      deviceType,
      orientation: isLandscape ? 'Landscape' : 'Portrait',
      viewportHeight: `${viewportHeight}px`,
      touchSupport: touchSupport ? 'Yes' : 'No',
      networkType: networkType.toUpperCase(),
      connectionSpeed: connectionSpeed.charAt(0).toUpperCase() + connectionSpeed.slice(1),
      userAgent: navigator.userAgent.split(' ').slice(-2).join(' ')
    };
  };

  const deviceInfo = getDeviceInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <PhoneSolid className="w-8 h-8 text-blue-400" />
            <span>Mobile & PWA Features</span>
          </h2>
          <p className="text-gray-400 mt-1">
            Progressive web app capabilities and mobile optimization
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            pwaCapabilities.isOnline 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {pwaCapabilities.isOnline ? (
              <WifiSolid className="w-4 h-4" />
            ) : (
              <NoSymbolIcon className="w-4 h-4" />
            )}
            <span>{pwaCapabilities.isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <button
            onClick={shareApp}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            <span>Share App</span>
          </button>
        </div>
      </div>

      {/* PWA Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-secondary-800/50 rounded-xl p-4 border border-secondary-700/50">
          <div className="flex items-center space-x-3">
            <ArrowDownTrayIcon className={`w-6 h-6 ${pwaCapabilities.isInstallable ? 'text-green-400' : 'text-gray-400'}`} />
            <div>
              <div className="font-medium text-white">Installation</div>
              <div className="text-sm text-gray-400">
                {pwaCapabilities.isInstalled ? 'Installed' : pwaCapabilities.isInstallable ? 'Available' : 'Not Available'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800/50 rounded-xl p-4 border border-secondary-700/50">
          <div className="flex items-center space-x-3">
            <CloudSolid className={`w-6 h-6 ${offlineData.syncStatus === 'synced' ? 'text-green-400' : 'text-yellow-400'}`} />
            <div>
              <div className="font-medium text-white">Offline Storage</div>
              <div className="text-sm text-gray-400">{offlineData.totalSize}</div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800/50 rounded-xl p-4 border border-secondary-700/50">
          <div className="flex items-center space-x-3">
            <BellSolid className={`w-6 h-6 ${pwaCapabilities.hasNotificationPermission ? 'text-green-400' : 'text-gray-400'}`} />
            <div>
              <div className="font-medium text-white">Notifications</div>
              <div className="text-sm text-gray-400">
                {pwaCapabilities.hasNotificationPermission ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-800/50 rounded-xl p-4 border border-secondary-700/50">
          <div className="flex items-center space-x-3">
            <DevicePhoneMobileIcon className={`w-6 h-6 ${deviceInfo.deviceType === 'mobile' ? 'text-blue-400' : 'text-gray-400'}`} />
            <div>
              <div className="font-medium text-white">Device</div>
              <div className="text-sm text-gray-400 capitalize">{deviceInfo.deviceType}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-secondary-800 rounded-lg p-1 overflow-x-auto">
        {[
          { key: 'install', label: 'Installation', icon: ArrowDownTrayIcon },
          { key: 'offline', label: 'Offline Mode', icon: CloudIcon },
          { key: 'notifications', label: 'Notifications', icon: BellIcon },
          { key: 'mobile', label: 'Mobile Optimization', icon: DevicePhoneMobileIcon },
          { key: 'features', label: 'PWA Features', icon: CogIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'install' && (
          <motion.div
            key="install"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Installation Status */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">App Installation</h3>
              
              {pwaCapabilities.isInstalled ? (
                <div className="text-center py-8">
                  <CheckSolid className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">App Already Installed</h4>
                  <p className="text-gray-400">
                    ProjectForge is installed and ready to use offline!
                  </p>
                </div>
              ) : pwaCapabilities.isInstallable ? (
                <div className="text-center py-8">
                  <ArrowDownTrayIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">Install ProjectForge</h4>
                  <p className="text-gray-400 mb-6">
                    Install our app for a native experience with offline capabilities
                  </p>
                  <button
                    onClick={installPWA}
                    disabled={installationStatus === 'installing'}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {installationStatus === 'installing' ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Installing...</span>
                      </div>
                    ) : (
                      'Install App'
                    )}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationTriangleIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">Installation Not Available</h4>
                  <p className="text-gray-400">
                    Your browser doesn't support PWA installation or the app is already installed
                  </p>
                </div>
              )}
            </div>

            {/* Installation Benefits */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Installation Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Works offline</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Fast loading times</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Native app experience</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Push notifications</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Home screen icon</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Background sync</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Secure HTTPS</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Auto updates</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'offline' && (
          <motion.div
            key="offline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Offline Status */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Offline Data Storage</h3>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  offlineData.syncStatus === 'synced' 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  <CloudIcon className="w-4 h-4" />
                  <span className="capitalize">{offlineData.syncStatus}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-secondary-700/50 rounded-lg">
                  <FolderIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{offlineData.projects}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
                <div className="text-center p-4 bg-secondary-700/50 rounded-lg">
                  <ChatBubbleLeftIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{offlineData.messages}</div>
                  <div className="text-sm text-gray-400">Messages</div>
                </div>
                <div className="text-center p-4 bg-secondary-700/50 rounded-lg">
                  <DocumentIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{offlineData.files}</div>
                  <div className="text-sm text-gray-400">Files</div>
                </div>
                <div className="text-center p-4 bg-secondary-700/50 rounded-lg">
                  <ClockIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">
                    {Math.floor((Date.now() - offlineData.lastSync.getTime()) / 60000)}m ago
                  </div>
                  <div className="text-sm text-gray-400">Last Sync</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Total Storage Used</div>
                  <div className="text-lg font-semibold text-white">{offlineData.totalSize}</div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={syncOfflineData}
                    disabled={offlineData.syncStatus === 'syncing'}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                  >
                    {offlineData.syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                  </button>
                  <button
                    onClick={clearOfflineData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Clear Data
                  </button>
                </div>
              </div>
            </div>

            {/* Offline Capabilities */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">What Works Offline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-400">Available Offline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">View cached projects</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Read offline messages</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Create new tasks</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Edit project details</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-400">Requires Connection</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">Real-time chat</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">File uploads</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">Video calls</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <XCircleIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">AI recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Notification Settings */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Notification Settings</h3>
                <button
                  onClick={testNotification}
                  disabled={!pwaCapabilities.hasNotificationPermission}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Test Notification
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BellIcon className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">Enable Notifications</div>
                      <div className="text-sm text-gray-400">Receive push notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.enabled}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                {/* Individual notification settings */}
                {[
                  { key: 'projectUpdates', label: 'Project Updates', description: 'Task completions, deadline changes' },
                  { key: 'messages', label: 'Messages', description: 'Direct messages and mentions' },
                  { key: 'deadlines', label: 'Deadlines', description: 'Upcoming due dates and milestones' },
                  { key: 'mentions', label: 'Mentions', description: 'When someone mentions you' },
                  { key: 'achievements', label: 'Achievements', description: 'New badges and accomplishments' }
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 bg-secondary-700/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{setting.label}</div>
                      <div className="text-sm text-gray-400">{setting.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          [setting.key]: e.target.checked
                        }))}
                        disabled={!notificationSettings.enabled}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
                    </label>
                  </div>
                ))}

                {/* Quiet Hours */}
                <div className="p-4 bg-secondary-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-medium text-white">Quiet Hours</div>
                      <div className="text-sm text-gray-400">Disable notifications during these hours</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.quietHours.enabled}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, enabled: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-secondary-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  {notificationSettings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={notificationSettings.quietHours.start}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">End Time</label>
                        <input
                          type="time"
                          value={notificationSettings.quietHours.end}
                          onChange={(e) => setNotificationSettings(prev => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value }
                          }))}
                          className="w-full px-3 py-2 bg-secondary-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mobile' && (
          <motion.div
            key="mobile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Device Information */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Device Type:</span>
                    <span className="text-white capitalize">{deviceInfo.deviceType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Orientation:</span>
                    <span className="text-white">{deviceInfo.orientation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Viewport Height:</span>
                    <span className="text-white">{deviceInfo.viewportHeight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Touch Support:</span>
                    <span className="text-white">{deviceInfo.touchSupport}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Network Type:</span>
                    <span className="text-white">{deviceInfo.networkType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Connection Speed:</span>
                    <span className={`${
                      deviceInfo.connectionSpeed === 'Fast' ? 'text-green-400' :
                      deviceInfo.connectionSpeed === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {deviceInfo.connectionSpeed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User Agent:</span>
                    <span className="text-white text-sm">{deviceInfo.userAgent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Optimizations */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Mobile Optimizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-green-400">Active Optimizations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Responsive design</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Touch-friendly interface</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Lazy loading images</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Optimized animations</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Reduced data usage</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-400">Performance Features</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Service Worker caching</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Compressed assets</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Critical CSS inlining</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Background sync</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BoltIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Offline fallbacks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Permission Management */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Device Permissions</h3>
              <div className="space-y-4">
                {[
                  {
                    key: 'camera',
                    icon: CameraIcon,
                    label: 'Camera Access',
                    description: 'Take photos and scan QR codes',
                    granted: pwaCapabilities.hasCameraPermission
                  },
                  {
                    key: 'microphone',
                    icon: MicrophoneIcon,
                    label: 'Microphone Access',
                    description: 'Voice notes and video calls',
                    granted: pwaCapabilities.hasMicrophonePermission
                  },
                  {
                    key: 'location',
                    icon: MapPinIcon,
                    label: 'Location Access',
                    description: 'Location-based features',
                    granted: pwaCapabilities.hasLocationPermission
                  }
                ].map((permission) => {
                  const Icon = permission.icon;
                  return (
                    <div key={permission.key} className="flex items-center justify-between p-4 bg-secondary-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${permission.granted ? 'text-green-400' : 'text-gray-400'}`} />
                        <div>
                          <div className="font-medium text-white">{permission.label}</div>
                          <div className="text-sm text-gray-400">{permission.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          permission.granted 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {permission.granted ? 'Granted' : 'Not Granted'}
                        </span>
                        {!permission.granted && (
                          <button
                            onClick={() => requestPermission(permission.key as any)}
                            className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded transition-colors"
                          >
                            Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PWA Capabilities */}
            <div className="bg-secondary-800/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">PWA Capabilities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: CloudIcon,
                    label: 'Service Worker',
                    supported: pwaCapabilities.supportsServiceWorker,
                    description: 'Background processing and caching'
                  },
                  {
                    icon: BellIcon,
                    label: 'Push Notifications',
                    supported: pwaCapabilities.supportsPushNotifications,
                    description: 'Real-time notifications'
                  },
                  {
                    icon: ShareIcon,
                    label: 'Web Share API',
                    supported: pwaCapabilities.supportsWebShare,
                    description: 'Native sharing capabilities'
                  },
                  {
                    icon: CloudIcon,
                    label: 'Background Sync',
                    supported: pwaCapabilities.supportsBackgroundSync,
                    description: 'Sync data when connection restored'
                  },
                  {
                    icon: DocumentIcon,
                    label: 'Offline Storage',
                    supported: pwaCapabilities.hasOfflineStorage,
                    description: 'Local data persistence'
                  },
                  {
                    icon: ShieldCheckIcon,
                    label: 'HTTPS Secure',
                    supported: location.protocol === 'https:',
                    description: 'Secure connection required'
                  }
                ].map((capability, index) => {
                  const Icon = capability.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${capability.supported ? 'text-green-400' : 'text-red-400'}`} />
                        <div>
                          <div className="font-medium text-white">{capability.label}</div>
                          <div className="text-sm text-gray-400">{capability.description}</div>
                        </div>
                      </div>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        capability.supported 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {capability.supported ? 'Supported' : 'Not Supported'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobilePWAFeatures;