import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  HomeIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

interface HeaderProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showSearch, setShowSearch] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navigationItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Projects', path: '/projects', icon: RocketLaunchIcon },
    { name: 'Ideas', path: '/ideas', icon: LightBulbIcon },
    { name: 'Community', path: '/community', icon: UsersIcon },
  ];

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center space-x-6">
              {/* Menu Button - Mobile Only */}
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors duration-200"
              >
                {isSidebarOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link to="/">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="font-display font-bold text-xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent hidden sm:block">
                    ProjectForge
                  </span>
                </motion.div>
              </Link>

              {/* Navigation Links - Desktop */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-current" />
                      <span className="text-current">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-4 hidden md:block">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects, ideas, people..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 placeholder-gray-500 text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-medium text-gray-500 bg-gray-700 rounded border border-gray-600">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-300" />
              </button>

              {isAuthenticated ? (
                <>
                  {/* Create Project Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/create-project')}
                    className="hidden sm:flex items-center space-x-2 btn-primary"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Create</span>
                  </motion.button>

                  {/* Mobile Create Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/create-project')}
                    className="sm:hidden p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5 text-white" />
                  </motion.button>

                  {/* Notifications */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 relative"
                    >
                      <BellIcon className="h-6 w-6 text-gray-300" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                        3
                      </span>
                    </motion.button>
                  </div>

                  {/* User Menu */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <UserCircleIcon className="h-8 w-8 text-gray-300" />
                      )}
                      <span className="hidden sm:block font-medium text-white">
                        {user?.name?.split(' ')[0] || user?.walletAddress?.slice(0, 6)}
                      </span>
                    </motion.button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg border border-gray-700 shadow-xl"
                      >
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-700">
                            <p className="font-medium text-white">{user?.name}</p>
                            <p className="text-sm text-gray-400">@{user?.walletAddress?.slice(0, 8)}...</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigate('/profile');
                              setShowUserMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-white"
                          >
                            Profile
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigate('/my-projects');
                              setShowUserMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-white"
                          >
                            My Projects
                          </button>
                          <button 
                            type="button" 
                            onClick={() => {
                              navigate('/profile?tab=settings');
                              setShowUserMenu(false);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-white"
                          >
                            Settings
                          </button>
                          <div className="border-t border-gray-700 mt-2">
                            <button
                              onClick={logout}
                              className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors duration-200 text-red-400"
                            >
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAuthClick('login')}
                    className="btn-secondary"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAuthClick('signup')}
                    className="btn-primary"
                  >
                    Sign Up
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 text-white placeholder-gray-500"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Header;