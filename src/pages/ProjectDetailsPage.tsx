import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { StoredProject, localStorageService } from '../services/localStorage';
import ContributionsDisplay from '../components/funding/ContributionsDisplay';
import { EscrowManagement } from '../components/escrow/EscrowManagement';
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  TagIcon,
  LinkIcon,
  PlayIcon,
  StarIcon,
  EyeIcon,
  HeartIcon,
  ShareIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const ProjectDetailsPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<StoredProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        navigate('/');
        return;
      }
      
      try {
        const data = await localStorageService.getProjectById(projectId);
        setProject(data);
      } catch (error) {
        console.error(error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadProject();
  }, [projectId, navigate]);

  // Handle funding success message
  useEffect(() => {
    const funded = searchParams.get('funded');
    const amount = searchParams.get('amount');
    const txHash = searchParams.get('tx');

    if (funded === 'true' && amount) {
      // Show success toast
      toast.success(
        <div className="flex flex-col">
          <div className="font-semibold">🎉 Funding Successful!</div>
          <div className="text-sm">You donated {amount} ETH to this project</div>
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs mt-1"
            >
              View transaction →
            </a>
          )}
        </div>,
        {
          duration: 6000,
          position: 'top-center',
          style: {
            background: '#10b981',
            color: 'white',
          },
        }
      );

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <RocketLaunchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  const fundingProgress = project.fundingGoal > 0 ? (project.currentFunding / project.fundingGoal) * 100 : 0;
  const daysLeft = Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const projectImage = project.imageHashes && project.imageHashes.length > 0 
    ? `https://gateway.pinata.cloud/ipfs/${project.imageHashes[0]}`
    : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LightBulbIcon },
    { id: 'details', label: 'Details', icon: CodeBracketIcon },
    { id: 'roadmap', label: 'Roadmap', icon: ChartBarIcon },
    { id: 'team', label: 'Team', icon: UserGroupIcon },
    { id: 'escrow', label: 'Escrow', icon: ShieldCheckIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Projects</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-red-300 transition-colors"
              >
                {isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm text-gray-600">{project.likes + (isLiked ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-yellow-300 transition-colors"
              >
                {isStarred ? (
                  <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                ) : (
                  <StarIcon className="w-5 h-5 text-gray-500" />
                )}
                <span className="text-sm text-gray-600">Star</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 hover:border-blue-300 transition-colors">
                <ShareIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8"
        >
          {/* Project Banner */}
          <div className="relative h-80 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={projectImage}
              alt={project.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-purple-600/70" />
            
            {/* Project Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={`https://ui-avatars.io/api/?name=${project.creatorName || 'Creator'}&background=ffffff&color=6366f1&size=48`}
                  alt={project.creatorName || 'Creator'}
                  className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                />
                <div>
                  <p className="font-semibold text-lg">{project.creatorName || 'Anonymous Creator'}</p>
                  <p className="text-white/80 text-sm">Project Creator</p>
                </div>
                <CheckBadgeIcon className="w-6 h-6 text-white" />
              </div>
              
              <h1 className="text-5xl font-bold mb-4 leading-tight">{project.title}</h1>
              <p className="text-xl opacity-90 max-w-3xl mb-6">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  {project.category}
                </span>
                <div className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4" />
                  <span className="text-sm">{project.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className="text-sm">Created {new Date(project.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-white shadow-sm text-blue-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Overview</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {project.longDescription || project.description}
                    </p>
                  </div>

                  {/* Demo and Video Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <GlobeAltIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Live Demo</h4>
                          <p className="text-sm text-gray-600">Try the project live</p>
                        </div>
                      </a>
                    )}
                    
                    {project.videoUrl && (
                      <a
                        href={project.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                      >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <PlayIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Video Demo</h4>
                          <p className="text-sm text-gray-600">Watch project demo</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Details</h2>
                  
                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {project.features && project.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                      <div className="space-y-3">
                        {project.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <CheckBadgeIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'roadmap' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Roadmap</h2>
                  
                  {project.roadmap && project.roadmap.length > 0 ? (
                    <div className="space-y-6">
                      {project.roadmap.map((item, index) => (
                        <div key={item.id || index} className="relative">
                          {index !== project.roadmap.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                          )}
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                              <CheckBadgeIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                <span className="text-sm text-gray-500">{item.timeline}</span>
                              </div>
                              <p className="text-gray-700">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No roadmap available for this project.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'team' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Project Team</h2>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.io/api/?name=${project.creatorName || 'Creator'}&background=6366f1&color=fff&size=80`}
                        alt={project.creatorName || 'Creator'}
                        className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{project.creatorName || 'Anonymous Creator'}</h3>
                        <p className="text-blue-600 font-medium">Project Lead & Founder</p>
                        <p className="text-gray-600 mt-1">Team size: {project.teamSize || 1} member{(project.teamSize || 1) !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'escrow' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Escrow Management</h2>
                  
                  <EscrowManagement 
                    projectId={project.id}
                    isOwner={true} // TODO: Check if current user is the project owner
                  />
                </div>
              )}
            </motion.div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <TagIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Funding Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Funding Progress</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">{Math.round(fundingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                    <span className="text-gray-600">Raised</span>
                  </div>
                  <span className="font-bold text-gray-900">${project.currentFunding.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ChartBarIcon className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Goal</span>
                  </div>
                  <span className="font-bold text-gray-900">${project.fundingGoal.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-600">Days left</span>
                  </div>
                  <span className="font-bold text-gray-900">{Math.max(0, daysLeft)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-5 h-5 text-orange-600" />
                    <span className="text-gray-600">Backers</span>
                  </div>
                  <span className="font-bold text-gray-900">{project.supporters?.length || 0}</span>
                </div>
              </div>

              {/* Fund Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/projects/${project.id}/fund`)}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-2">
                  <RocketLaunchIcon className="w-5 h-5" />
                  <span>Fund This Project</span>
                </div>
              </motion.button>
            </motion.div>

            {/* Project Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'active' && '🟢'}
                  {project.status === 'completed' && '✅'}
                  {project.status === 'cancelled' && '❌'}
                  {project.status === 'draft' && '📝'}
                  <span className="ml-2 capitalize">{project.status}</span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div>Created: {new Date(project.createdAt || Date.now()).toLocaleDateString()}</div>
                  <div>Updated: {new Date(project.updatedAt || Date.now()).toLocaleDateString()}</div>
                  {project.deadline && (
                    <div>Deadline: {new Date(project.deadline).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Contributors Display */}
            <ContributionsDisplay
              projectId={project.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
