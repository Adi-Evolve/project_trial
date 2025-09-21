import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  LightBulbIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  BoltIcon,
  CpuChipIcon,
  BeakerIcon,
  RocketLaunchIcon,
  StarIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolidIcon,
  LightBulbIcon as LightBulbSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

export interface ProjectRecommendation {
  id: string;
  type: 'technology' | 'architecture' | 'workflow' | 'team' | 'optimization' | 'security';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timeToImplement: string;
  effort: 'low' | 'medium' | 'high';
  benefits: string[];
  risks: string[];
  tags: string[];
  relevantSkills: string[];
  suggestedBy: 'ai-analysis' | 'pattern-matching' | 'performance-monitoring' | 'community-trends';
  reasoning: string;
  actionable: boolean;
  implementationSteps?: string[];
  relatedProjects?: string[];
  aiMetrics: {
    dataPoints: number;
    analysisType: string;
    accuracy: number;
  };
  status: 'new' | 'reviewing' | 'accepted' | 'declined' | 'implemented';
  createdAt: Date;
  priority: number; // 1-10
}

interface AIRecommendationsProps {
  projectId?: string;
  projectType?: string;
  teamSize?: number;
  onRecommendationAction?: (recommendationId: string, action: 'accept' | 'decline' | 'implement') => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  projectId,
  projectType = 'web-development',
  teamSize = 5,
  onRecommendationAction
}) => {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'confidence' | 'impact' | 'created'>('priority');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showImplementationDetails, setShowImplementationDetails] = useState<string | null>(null);

  // Mock AI analysis and recommendation generation
  useEffect(() => {
    const generateRecommendations = async () => {
      setIsGenerating(true);
      
      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockRecommendations: ProjectRecommendation[] = [
        {
          id: 'rec-1',
          type: 'technology',
          title: 'Implement React Query for Data Management',
          description: 'Based on your API usage patterns, React Query could reduce loading times by 40% and improve user experience with better caching.',
          impact: 'high',
          confidence: 92,
          timeToImplement: '2-3 weeks',
          effort: 'medium',
          benefits: [
            'Automatic background updates',
            'Optimistic updates',
            'Reduced bundle size',
            'Better error handling',
            'Improved developer experience'
          ],
          risks: [
            'Learning curve for team',
            'Migration time from existing solution'
          ],
          tags: ['performance', 'caching', 'api'],
          relevantSkills: ['React', 'TypeScript', 'API Design'],
          suggestedBy: 'performance-monitoring',
          reasoning: 'Analysis of your current API calls shows 60% are redundant. React Query\'s intelligent caching would eliminate this overhead.',
          actionable: true,
          implementationSteps: [
            'Install React Query and DevTools',
            'Set up QueryClient with proper configuration',
            'Migrate existing API calls one component at a time',
            'Implement error boundaries for query errors',
            'Add loading states and optimistic updates'
          ],
          relatedProjects: ['react-app-optimization', 'api-performance-study'],
          aiMetrics: {
            dataPoints: 1247,
            analysisType: 'Performance Pattern Analysis',
            accuracy: 92
          },
          status: 'new',
          createdAt: new Date(),
          priority: 9
        },
        {
          id: 'rec-2',
          type: 'architecture',
          title: 'Adopt Micro-Frontend Architecture',
          description: 'For your growing team, micro-frontends would enable independent deployments and reduce conflicts between team members.',
          impact: 'critical',
          confidence: 85,
          timeToImplement: '6-8 weeks',
          effort: 'high',
          benefits: [
            'Independent team deployments',
            'Technology flexibility',
            'Reduced merge conflicts',
            'Scalable development',
            'Fault isolation'
          ],
          risks: [
            'Increased complexity',
            'Bundle size overhead',
            'Shared state management challenges'
          ],
          tags: ['architecture', 'scalability', 'team-productivity'],
          relevantSkills: ['System Design', 'DevOps', 'Module Federation'],
          suggestedBy: 'ai-analysis',
          reasoning: 'Team size analysis indicates you\'re approaching the threshold where monolithic frontend becomes a bottleneck. Similar teams saw 35% productivity improvement.',
          actionable: true,
          implementationSteps: [
            'Design micro-frontend boundaries',
            'Set up Module Federation or similar',
            'Create shared component library',
            'Implement routing strategy',
            'Establish deployment pipelines'
          ],
          aiMetrics: {
            dataPoints: 890,
            analysisType: 'Team Productivity Analysis',
            accuracy: 85
          },
          status: 'new',
          createdAt: new Date(),
          priority: 8
        },
        {
          id: 'rec-3',
          type: 'workflow',
          title: 'Implement Automated Code Review with AI',
          description: 'AI-powered code review could catch 78% more bugs before they reach production, based on similar project analysis.',
          impact: 'medium',
          confidence: 88,
          timeToImplement: '1-2 weeks',
          effort: 'low',
          benefits: [
            'Faster code review process',
            'Consistent code quality',
            'Early bug detection',
            'Reduced manual review time',
            'Learning opportunities for junior developers'
          ],
          risks: [
            'False positives in AI analysis',
            'Over-reliance on automated tools'
          ],
          tags: ['code-quality', 'automation', 'productivity'],
          relevantSkills: ['CI/CD', 'Code Review', 'Static Analysis'],
          suggestedBy: 'pattern-matching',
          reasoning: 'Your current code review process shows patterns typical of teams that benefit most from AI assistance. 67% reduction in review time expected.',
          actionable: true,
          implementationSteps: [
            'Research and select AI code review tool',
            'Integrate with existing CI/CD pipeline',
            'Configure rules and thresholds',
            'Train team on new workflow',
            'Monitor and adjust settings'
          ],
          aiMetrics: {
            dataPoints: 2156,
            analysisType: 'Code Quality Pattern Matching',
            accuracy: 88
          },
          status: 'new',
          createdAt: new Date(),
          priority: 7
        },
        {
          id: 'rec-4',
          type: 'optimization',
          title: 'Progressive Web App Conversion',
          description: 'Converting to PWA could increase user engagement by 45% and reduce bounce rate, especially on mobile devices.',
          impact: 'high',
          confidence: 91,
          timeToImplement: '3-4 weeks',
          effort: 'medium',
          benefits: [
            'Offline functionality',
            'Push notifications',
            'App-like experience',
            'Improved loading times',
            'Increased user retention'
          ],
          risks: [
            'Browser compatibility issues',
            'Additional complexity in deployment'
          ],
          tags: ['pwa', 'mobile', 'user-experience'],
          relevantSkills: ['Service Workers', 'Web APIs', 'Mobile Development'],
          suggestedBy: 'community-trends',
          reasoning: 'User analytics show 67% mobile traffic. PWA adoption in similar projects resulted in significant engagement improvements.',
          actionable: true,
          implementationSteps: [
            'Create web app manifest',
            'Implement service worker for caching',
            'Add offline functionality',
            'Set up push notifications',
            'Optimize for mobile experience'
          ],
          aiMetrics: {
            dataPoints: 3421,
            analysisType: 'User Behavior Analysis',
            accuracy: 91
          },
          status: 'new',
          createdAt: new Date(),
          priority: 8
        },
        {
          id: 'rec-5',
          type: 'security',
          title: 'Implement Zero-Trust Security Model',
          description: 'Based on your user data patterns, zero-trust architecture would significantly improve security posture.',
          impact: 'critical',
          confidence: 79,
          timeToImplement: '4-6 weeks',
          effort: 'high',
          benefits: [
            'Enhanced security posture',
            'Reduced attack surface',
            'Better compliance',
            'Granular access control',
            'Improved audit trails'
          ],
          risks: [
            'Implementation complexity',
            'Potential user experience friction',
            'Training requirements'
          ],
          tags: ['security', 'authentication', 'authorization'],
          relevantSkills: ['Security Architecture', 'Identity Management', 'Compliance'],
          suggestedBy: 'ai-analysis',
          reasoning: 'Security audit patterns indicate vulnerabilities typical in traditional perimeter-based security. Zero-trust addresses 89% of identified risks.',
          actionable: true,
          implementationSteps: [
            'Audit current security architecture',
            'Design zero-trust network segmentation',
            'Implement multi-factor authentication',
            'Set up identity and access management',
            'Deploy monitoring and analytics'
          ],
          aiMetrics: {
            dataPoints: 1834,
            analysisType: 'Security Risk Assessment',
            accuracy: 79
          },
          status: 'new',
          createdAt: new Date(),
          priority: 6
        }
      ];

      setRecommendations(mockRecommendations);
      setIsGenerating(false);
      toast.success('AI analysis complete! Found 5 new recommendations.');
    };

    generateRecommendations();
  }, [projectId, projectType, teamSize]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technology': return CpuChipIcon;
      case 'architecture': return BeakerIcon;
      case 'workflow': return BoltIcon;
      case 'team': return UserGroupIcon;
      case 'optimization': return RocketLaunchIcon;
      case 'security': return CheckCircleIcon;
      default: return LightBulbIcon;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technology': return 'text-blue-400 bg-blue-500/20';
      case 'architecture': return 'text-purple-400 bg-purple-500/20';
      case 'workflow': return 'text-yellow-400 bg-yellow-500/20';
      case 'team': return 'text-green-400 bg-green-500/20';
      case 'optimization': return 'text-orange-400 bg-orange-500/20';
      case 'security': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-400 bg-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations;
    
    if (selectedCategory !== 'all') {
      filtered = recommendations.filter(r => r.type === selectedCategory);
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return b.priority - a.priority;
        case 'confidence':
          return b.confidence - a.confidence;
        case 'impact':
          const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
  }, [recommendations, selectedCategory, sortBy]);

  const handleRecommendationAction = (recommendationId: string, action: 'accept' | 'decline' | 'implement') => {
    setRecommendations(prev => prev.map(r => 
      r.id === recommendationId 
        ? { ...r, status: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'implemented' }
        : r
    ));
    
    onRecommendationAction?.(recommendationId, action);
    
    const actionMessages = {
      accept: 'Recommendation accepted!',
      decline: 'Recommendation declined.',
      implement: 'Recommendation marked as implemented!'
    };
    
    toast.success(actionMessages[action]);
  };

  const generateNewRecommendations = async () => {
    setIsGenerating(true);
    toast.loading('Running AI analysis...', { duration: 2000 });
    
    // Simulate new analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGenerating(false);
    toast.success('Analysis complete! No new recommendations at this time.');
  };

  const categories = [
    { id: 'all', name: 'All Recommendations', count: recommendations.length },
    { id: 'technology', name: 'Technology', count: recommendations.filter(r => r.type === 'technology').length },
    { id: 'architecture', name: 'Architecture', count: recommendations.filter(r => r.type === 'architecture').length },
    { id: 'workflow', name: 'Workflow', count: recommendations.filter(r => r.type === 'workflow').length },
    { id: 'optimization', name: 'Optimization', count: recommendations.filter(r => r.type === 'optimization').length },
    { id: 'security', name: 'Security', count: recommendations.filter(r => r.type === 'security').length }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <SparklesSolidIcon className="w-8 h-8 text-primary-400" />
            <span>AI Project Recommendations</span>
          </h2>
          <p className="text-secondary-400">Machine learning-based suggestions for project improvement</p>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateNewRecommendations}
            disabled={isGenerating}
            className="btn-outline flex items-center space-x-2"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Customize AI</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-6 p-6 border-b border-secondary-700/50">
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Active Recommendations</p>
              <p className="text-2xl font-bold text-white">{recommendations.filter(r => r.status === 'new').length}</p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <LightBulbSolidIcon className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">High Impact</p>
              <p className="text-2xl font-bold text-orange-400">
                {recommendations.filter(r => r.impact === 'high' || r.impact === 'critical').length}
              </p>
            </div>
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <ArrowTrendingUpIcon className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold text-green-400">
                {recommendations.length > 0 
                  ? Math.round(recommendations.reduce((acc, r) => acc + r.confidence, 0) / recommendations.length)
                  : 0}%
              </p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <ChartBarIcon className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-secondary-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-400 text-sm">Implemented</p>
              <p className="text-2xl font-bold text-purple-400">
                {recommendations.filter(r => r.status === 'implemented').length}
              </p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-700/50">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-700 text-secondary-300 hover:bg-secondary-600'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        >
          <option value="priority">Sort by Priority</option>
          <option value="confidence">Sort by Confidence</option>
          <option value="impact">Sort by Impact</option>
          <option value="created">Sort by Created</option>
        </select>
      </div>

      {/* Recommendations List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isGenerating ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <SparklesSolidIcon className="w-16 h-16 text-primary-400" />
              </motion.div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Analysis in Progress</h3>
              <p className="text-secondary-400">Analyzing your project patterns and generating recommendations...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {filteredAndSortedRecommendations.map((recommendation) => {
                const TypeIcon = getTypeIcon(recommendation.type);
                
                return (
                  <motion.div
                    key={recommendation.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-secondary-800/50 backdrop-blur-xl rounded-xl border border-secondary-700/50 overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`p-3 rounded-lg ${getTypeColor(recommendation.type)}`}>
                            <TypeIcon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-white mb-2">{recommendation.title}</h3>
                            <p className="text-secondary-300 mb-3">{recommendation.description}</p>
                            
                            <div className="flex items-center space-x-4 mb-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(recommendation.impact)}`}>
                                {recommendation.impact} impact
                              </span>
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400">
                                {recommendation.confidence}% confidence
                              </span>
                              <span className="text-sm text-secondary-400">
                                {recommendation.timeToImplement}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowImplementationDetails(
                              showImplementationDetails === recommendation.id ? null : recommendation.id
                            )}
                            className="p-2 hover:bg-secondary-700/50 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-5 h-5 text-secondary-400" />
                          </button>
                        </div>
                      </div>

                      {/* AI Metrics */}
                      <div className="flex items-center space-x-6 mb-4 text-sm text-secondary-400">
                        <div className="flex items-center space-x-2">
                          <CpuChipIcon className="w-4 h-4" />
                          <span>{recommendation.aiMetrics.analysisType}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ChartBarIcon className="w-4 h-4" />
                          <span>{recommendation.aiMetrics.dataPoints} data points</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarSolidIcon className="w-4 h-4" />
                          <span>Priority: {recommendation.priority}/10</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {recommendation.status === 'new' && (
                        <div className="flex items-center space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRecommendationAction(recommendation.id, 'accept')}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Accept</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRecommendationAction(recommendation.id, 'implement')}
                            className="btn-outline flex items-center space-x-2"
                          >
                            <RocketLaunchIcon className="w-4 h-4" />
                            <span>Implement</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRecommendationAction(recommendation.id, 'decline')}
                            className="btn-secondary flex items-center space-x-2"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            <span>Not Now</span>
                          </motion.button>
                        </div>
                      )}
                    </div>

                    {/* Implementation Details */}
                    <AnimatePresence>
                      {showImplementationDetails === recommendation.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-secondary-700/50 bg-secondary-800/30"
                        >
                          <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Benefits & Risks */}
                              <div>
                                <h4 className="font-semibold text-white mb-3">Benefits</h4>
                                <ul className="space-y-2 mb-6">
                                  {recommendation.benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-sm text-green-400">
                                      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                <h4 className="font-semibold text-white mb-3">Risks</h4>
                                <ul className="space-y-2">
                                  {recommendation.risks.map((risk, index) => (
                                    <li key={index} className="flex items-center space-x-2 text-sm text-yellow-400">
                                      <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
                                      <span>{risk}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Implementation Steps */}
                              {recommendation.implementationSteps && (
                                <div>
                                  <h4 className="font-semibold text-white mb-3">Implementation Steps</h4>
                                  <ol className="space-y-2">
                                    {recommendation.implementationSteps.map((step, index) => (
                                      <li key={index} className="flex items-start space-x-3 text-sm text-secondary-300">
                                        <span className="bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                          {index + 1}
                                        </span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                            </div>

                            {/* AI Reasoning */}
                            <div className="mt-6 p-4 bg-secondary-700/30 rounded-lg">
                              <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                                <CpuChipIcon className="w-5 h-5" />
                                <span>AI Analysis Reasoning</span>
                              </h4>
                              <p className="text-sm text-secondary-300">{recommendation.reasoning}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRecommendations;