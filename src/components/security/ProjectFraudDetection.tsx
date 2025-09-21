import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldExclamationIcon,
  EyeIcon,
  CameraIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  LinkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { analyzeProjectSecurity } from '../../utils/security';

interface ProjectFraudDetectionProps {
  projectId: string;
  projectData: any;
  onFlagProject?: (reason: string) => void;
  className?: string;
}

interface FraudIndicator {
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number; // 0-100
  suggestion: string;
}

const ProjectFraudDetection: React.FC<ProjectFraudDetectionProps> = ({
  projectId,
  projectData,
  onFlagProject,
  className = ''
}) => {
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null);
  const [fraudIndicators, setFraudIndicators] = useState<FraudIndicator[]>([]);
  const [overallRiskScore, setOverallRiskScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [selectedIndicator, setSelectedIndicator] = useState<FraudIndicator | null>(null);

  useEffect(() => {
    analyzeProject();
  }, [projectId, projectData]);

  const analyzeProject = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const analysis = analyzeProjectSecurity(projectData);
      setFraudAnalysis(analysis);
      setOverallRiskScore(analysis.riskScore);

      // Generate fraud indicators based on analysis
      const indicators: FraudIndicator[] = [];

      // Check description quality
      if (!analysis.hasValidDescription) {
        indicators.push({
          type: 'warning',
          title: 'Poor Description Quality',
          description: 'Project description is too short or contains suspicious patterns',
          confidence: 75,
          suggestion: 'Encourage the creator to provide more detailed project information'
        });
      }

      // Check funding goal realism
      if (!analysis.budgetRealistic) {
        indicators.push({
          type: 'critical',
          title: 'Unrealistic Funding Goal',
          description: 'Funding goal is either too high or too low for the project scope',
          confidence: 90,
          suggestion: 'Review project scope and budget breakdown with creator'
        });
      }

      // Check timeline validity
      if (!analysis.hasValidTimeline) {
        indicators.push({
          type: 'warning',
          title: 'Invalid Timeline',
          description: 'Project timeline is missing or contains unrealistic milestones',
          confidence: 65,
          suggestion: 'Request detailed project timeline with achievable milestones'
        });
      }

      // Check external validation
      if (!analysis.hasExternalLinks) {
        indicators.push({
          type: 'info',
          title: 'No External Validation',
          description: 'Project lacks external links to verify creator credibility',
          confidence: 50,
          suggestion: 'Ask creator to provide website, social media, or portfolio links'
        });
      }

      // Check image authenticity
      if (!analysis.hasRealImages) {
        indicators.push({
          type: 'critical',
          title: 'Suspicious Images',
          description: 'Project images may be AI-generated or stock photos',
          confidence: 85,
          suggestion: 'Request original project photos or videos as proof of authenticity'
        });
      }

      // Check team verification
      if (!analysis.teamMembersVerified) {
        indicators.push({
          type: 'warning',
          title: 'Unverified Team Members',
          description: 'Team members lack verification or professional profiles',
          confidence: 70,
          suggestion: 'Encourage team members to complete profile verification'
        });
      }

      // Additional AI-based indicators
      if (projectData.title && containsSuspiciousKeywords(projectData.title)) {
        indicators.push({
          type: 'warning',
          title: 'Suspicious Keywords',
          description: 'Project title contains commonly used fraud keywords',
          confidence: 60,
          suggestion: 'Review project authenticity and creator background'
        });
      }

      if (projectData.createdAt && isRapidProjectCreation(projectData.createdAt, projectData.creatorId)) {
        indicators.push({
          type: 'critical',
          title: 'Rapid Project Creation',
          description: 'Creator has launched multiple projects in a short time period',
          confidence: 80,
          suggestion: 'Investigate creator\'s project history and success rate'
        });
      }

      setFraudIndicators(indicators);
      setIsAnalyzing(false);
    }, 2000);
  };

  const containsSuspiciousKeywords = (text: string): boolean => {
    const suspiciousWords = [
      'revolutionary', 'breakthrough', 'guaranteed', 'unique opportunity',
      'limited time', 'act now', 'exclusive', 'secret', 'miracle'
    ];
    return suspiciousWords.some(word => text.toLowerCase().includes(word.toLowerCase()));
  };

  const isRapidProjectCreation = (createdAt: string, creatorId: string): boolean => {
    // This would check against a database of creator's project history
    // For now, simulate the check
    return Math.random() > 0.7; // 30% chance of rapid creation
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (score >= 60) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-green-400 bg-green-400/10 border-green-400/20';
  };

  const getRiskLevelText = (score: number) => {
    if (score >= 80) return 'High Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'Low Risk';
    return 'Minimal Risk';
  };

  const getIndicatorColor = (type: FraudIndicator['type']) => {
    switch (type) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'warning': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'info': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getIndicatorIcon = (type: FraudIndicator['type']) => {
    switch (type) {
      case 'critical': return XCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'info': return EyeIcon;
      default: return CheckCircleIcon;
    }
  };

  const handleFlagProject = () => {
    const criticalIssues = fraudIndicators.filter(i => i.type === 'critical');
    const reason = criticalIssues.length > 0 
      ? `Critical fraud indicators detected: ${criticalIssues.map(i => i.title).join(', ')}`
      : `Project flagged for review due to ${fraudIndicators.length} security concerns`;
    
    onFlagProject?.(reason);
  };

  if (isAnalyzing) {
    return (
      <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          />
          <span className="text-white font-medium">Analyzing project for fraud indicators...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-secondary-800/50 backdrop-blur-sm rounded-xl border border-secondary-700/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-secondary-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldExclamationIcon className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Fraud Detection Analysis</h2>
              <p className="text-secondary-400">Automated security assessment for project integrity</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-4 py-2 rounded-lg border font-medium ${getRiskLevelColor(overallRiskScore)}`}>
              {getRiskLevelText(overallRiskScore)}
            </div>
            <div className="text-sm text-secondary-400 mt-1">Risk Score: {overallRiskScore}/100</div>
          </div>
        </div>
      </div>

      {/* Analysis Summary */}
      <div className="p-6 border-b border-secondary-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Analysis Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'Description Quality', 
              status: fraudAnalysis?.hasValidDescription, 
              icon: DocumentTextIcon 
            },
            { 
              label: 'Realistic Budget', 
              status: fraudAnalysis?.budgetRealistic, 
              icon: CurrencyDollarIcon 
            },
            { 
              label: 'Valid Timeline', 
              status: fraudAnalysis?.hasValidTimeline, 
              icon: ClockIcon 
            },
            { 
              label: 'External Links', 
              status: fraudAnalysis?.hasExternalLinks, 
              icon: LinkIcon 
            }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon className="w-5 h-5 text-secondary-400" />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.status ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${item.status ? 'text-green-400' : 'text-red-400'}`}>
                    {item.status ? 'Pass' : 'Fail'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fraud Indicators */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Fraud Indicators</h3>
          {fraudIndicators.some(i => i.type === 'critical') && (
            <button
              onClick={handleFlagProject}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <FlagIcon className="w-4 h-4" />
              <span>Flag Project</span>
            </button>
          )}
        </div>

        {fraudIndicators.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-white mb-2">No Fraud Indicators Detected</h4>
            <p className="text-secondary-400">This project appears to be legitimate based on our analysis.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fraudIndicators.map((indicator, index) => {
              const Icon = getIndicatorIcon(indicator.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-secondary-700/30 rounded-lg p-4 border border-secondary-600/50 hover:border-secondary-500/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedIndicator(indicator)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg border ${getIndicatorColor(indicator.type)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{indicator.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getIndicatorColor(indicator.type)}`}>
                            {indicator.type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-secondary-400 text-sm mb-2">{indicator.description}</p>
                        <p className="text-secondary-500 text-xs italic">{indicator.suggestion}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{indicator.confidence}%</div>
                      <div className="text-xs text-secondary-400">Confidence</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Risk Mitigation Recommendations */}
        {fraudIndicators.length > 0 && (
          <div className="mt-8 bg-blue-500/10 rounded-lg p-6 border border-blue-500/20">
            <h4 className="text-lg font-semibold text-blue-400 mb-4">Risk Mitigation Recommendations</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Immediate Action:</strong> Contact project creator for additional verification documents
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Enhanced Monitoring:</strong> Set up automated alerts for creator activity patterns
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <strong>Community Review:</strong> Enable community reporting and peer review mechanisms
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Indicator Modal */}
      {selectedIndicator && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-secondary-800 rounded-xl border border-secondary-700 max-w-lg w-full"
          >
            <div className="p-6 border-b border-secondary-700">
              <h3 className="text-xl font-bold text-white">{selectedIndicator.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-1">Description</div>
                <div className="text-secondary-300">{selectedIndicator.description}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-white mb-1">Confidence Level</div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-secondary-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedIndicator.confidence > 80 ? 'bg-red-400' :
                        selectedIndicator.confidence > 60 ? 'bg-orange-400' :
                        'bg-yellow-400'
                      }`}
                      style={{ width: `${selectedIndicator.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-white">{selectedIndicator.confidence}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-white mb-1">Recommended Action</div>
                <div className="text-secondary-300">{selectedIndicator.suggestion}</div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setSelectedIndicator(null)}
                  className="px-4 py-2 bg-secondary-600 hover:bg-secondary-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleFlagProject();
                    setSelectedIndicator(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Flag Project
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProjectFraudDetection;