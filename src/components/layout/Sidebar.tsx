import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  UserGroupIcon,
  BookmarkIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  UserIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeSolid,
  RocketLaunchIcon as RocketSolid,
  LightBulbIcon as LightBulbSolid,
  UserGroupIcon as UserGroupSolid,
  BookmarkIcon as BookmarkSolid,
  ChartBarIcon as ChartBarSolid,
  FireIcon as FireSolid,
  TrophyIcon as TrophySolid,
  HeartIcon as HeartSolid,
  UserIcon as UserSolid,
  Squares2X2Icon as Squares2X2Solid
} from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  iconSolid: React.ElementType;
  current: boolean;
  count?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigation: NavigationItem[] = [
    { 
      name: 'Home', 
      href: '/', 
      icon: HomeIcon, 
      iconSolid: HomeSolid, 
      current: currentPath === '/' 
    },
    { 
      name: 'Discover Projects', 
      href: '/projects', 
      icon: RocketLaunchIcon, 
      iconSolid: RocketSolid, 
      current: currentPath === '/projects' 
    },
    { 
      name: 'Ideas Hub', 
      href: '/idea-hub', 
      icon: LightBulbIcon, 
      iconSolid: LightBulbSolid, 
      current: currentPath === '/idea-hub' 
    },
    { 
      name: 'Find Collaborators', 
      href: '/find-collaborators', 
      icon: UserGroupIcon, 
      iconSolid: UserGroupSolid, 
      current: currentPath === '/find-collaborators' 
    },
    { 
      name: 'Trending', 
      href: '/trending', 
      icon: FireIcon, 
      iconSolid: FireSolid, 
      current: currentPath === '/trending',
      count: 12
    },
    { 
      name: 'Leaderboard', 
      href: '/leaderboard', 
      icon: TrophyIcon, 
      iconSolid: TrophySolid, 
      current: currentPath === '/leaderboard' 
    }
  ];

  const personalNavigation: NavigationItem[] = [
    { 
      name: 'My Profile', 
      href: '/profile', 
      icon: UserIcon, 
      iconSolid: UserSolid, 
      current: currentPath === '/profile'
    },
    { 
      name: 'My Projects', 
      href: '/my-projects', 
      icon: ChartBarIcon, 
      iconSolid: ChartBarSolid, 
      current: currentPath === '/my-projects',
      count: 3
    },
    { 
      name: 'Project Board', 
      href: '/project-management', 
      icon: Squares2X2Icon, 
      iconSolid: Squares2X2Solid, 
      current: currentPath === '/project-management'
    },
    { 
      name: 'Community', 
      href: '/community', 
      icon: UserGroupIcon, 
      iconSolid: UserGroupSolid, 
      current: currentPath === '/community'
    },
    { 
      name: 'Ideas', 
      href: '/ideas', 
      icon: LightBulbIcon, 
      iconSolid: LightBulbSolid, 
      current: currentPath === '/ideas'
    },
    { 
      name: 'Bookmarks', 
      href: '/bookmarks', 
      icon: BookmarkIcon, 
      iconSolid: BookmarkSolid, 
      current: currentPath === '/bookmarks',
      count: 8
    },
    { 
      name: 'Following', 
      href: '/following', 
      icon: HeartIcon, 
      iconSolid: HeartSolid, 
      current: currentPath === '/following',
      count: 24
    }
  ];

  const bottomNavigation: NavigationItem[] = [
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Cog6ToothIcon, 
      iconSolid: Cog6ToothIcon, 
      current: currentPath === '/settings' 
    }
  ];

  const handleNavClick = (href: string) => {
    navigate(href);
    // Only close sidebar on mobile (screens smaller than lg)
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : -320,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] w-80 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-gray-800 border-r border-gray-700`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-2 py-4">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.current ? item.iconSolid : item.icon;
                return (
                  <motion.button
                    key={item.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleNavClick(item.href)}
                    className={`group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-800 shadow-lg'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`h-5 w-5 transition-colors duration-200 ${
                          item.current ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.count && (
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.current
                          ? 'bg-blue-800 text-blue-300'
                          : 'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Personal Section */}
            <div className="pt-6">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Personal
              </h3>
              <div className="space-y-1">
                {personalNavigation.map((item) => {
                  const Icon = item.current ? item.iconSolid : item.icon;
                  return (
                    <motion.button
                      key={item.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavClick(item.href)}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        item.current
                          ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon
                          className={`h-5 w-5 transition-colors duration-200 ${
                            item.current ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.count && (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                          item.current
                            ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-500'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="pt-6">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Your Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Projects Created</span>
                    <span className="font-medium text-green-400">5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ideas Shared</span>
                    <span className="font-medium text-yellow-400">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Upvotes Received</span>
                    <span className="font-medium text-blue-400">247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Reputation</span>
                    <span className="font-medium text-purple-400">1,432</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Projects */}
            <div className="pt-6">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                🔥 Trending Now
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'AI Code Assistant', category: 'AI/ML', votes: 234 },
                  { name: 'DeFi Portfolio Tracker', category: 'Blockchain', votes: 189 },
                  { name: 'Climate Change App', category: 'Environment', votes: 156 }
                ].map((project, index) => (
                  <motion.div
                    key={project.name}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-3 cursor-pointer hover:border-blue-600 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-100">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.category}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-medium text-blue-400">{project.votes}</span>
                        <motion.div
                          whileTap={{ scale: 0.9 }}
                          className="text-blue-400 cursor-pointer"
                        >
                          ▲
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="pt-6">
              <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {[
                  { user: 'Sarah', action: 'liked your project', time: '2m' },
                  { user: 'Alex', action: 'commented on', time: '1h' },
                  { user: 'Mike', action: 'started following', time: '3h' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {activity.user[0]}
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-300">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </span>
                    </div>
                    <span className="text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-700 p-4">
            {bottomNavigation.map((item) => {
              const Icon = item.current ? item.iconSolid : item.icon;
              return (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.href)}
                  className={`group flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    item.current
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors duration-200 ${
                      item.current ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.name}</span>
                </motion.button>
              );
            })}

            {/* App Version */}
            <div className="mt-4 px-3">
              <p className="text-xs text-gray-400">
                ProjectForge v1.0.0
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;