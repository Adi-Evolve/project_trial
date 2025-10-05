import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { contributionsService } from '../services/contributionsService';
import { useAuth } from '../context/AuthContext';
import { userRegistrationService } from '../services/userRegistration';
import { enhancedProjectService } from '../services/enhancedProjectService';

interface FundingTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  perks: string[];
  backers: number;
  estimatedDelivery?: Date;
  isPopular?: boolean;
}

interface ProjectInfo {
  id: string;
  title: string;
  description: string;
  owner: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  funding: {
    goal: string; // in USD
    raised: string; // in USD
    backers: number;
    deadline: Date;
  };
  banner: string;
  category?: string;
  status: 'active' | 'inactive' | 'completed' | 'cancelled';
}

const ProjectFundingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donations, setDonations] = useState<any[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Load project from enhanced service (tries localStorage then Supabase)
      const storedProject = await enhancedProjectService.getProjectById(id);

      // Load donations
      const contributionsResult = await contributionsService.getProjectContributions(id);
      if (contributionsResult.success) {
        setDonations(contributionsResult.contributions || []);
      }

      if (!storedProject) {
        setError('Project not found');
        setIsLoading(false);
        return;
      }

      // Get creator's details from registration service
      const creatorDetails = await userRegistrationService.getUserByWallet(storedProject.creatorAddress || storedProject.creatorId);

      const projectInfo: ProjectInfo = {
        id: storedProject.id,
        title: storedProject.title,
        description: storedProject.description,
        owner: {
          id: storedProject.creatorId,
          name: creatorDetails?.name || storedProject.creatorName || 'Project Creator',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
          email: creatorDetails?.email || 'creator@project.com'
        },
        funding: {
    goal: storedProject.fundingGoal.toString(),
    raised: storedProject.currentFunding.toString(),
          backers: donations.length,
          deadline: new Date(storedProject.deadline)
        },
        banner: (storedProject.imageUrls && storedProject.imageUrls.length > 0)
          ? storedProject.imageUrls[0]
          : 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop',
        category: storedProject.category || 'Technology',
        status: storedProject.status as 'active' | 'inactive' | 'completed' | 'cancelled'
      };

      setProject(projectInfo);
    } catch (error: any) {
      console.error('Failed to load project data:', error);
      setError('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonationSuccess = async (transactionHash: string, amount: string) => {
    try {
      // Refresh project data after successful donation
      await loadProjectData();
      
      console.log('Donation successful:', { transactionHash, amount });
      
      // Redirect to project details with success message
      setTimeout(() => {
        navigate(`/projects/${id}?funded=true&amount=${amount}&tx=${transactionHash}`, {
          replace: true
        });
      }, 2000); // Give time for the success animation to show
    } catch (error) {
      console.error('Error handling donation success:', error);
    }
  };

  const handleDonationError = (error: string) => {
    console.error('Donation error:', error);
    setError(error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The project you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Projects
          </button>
        </div>
      </div>
    );
  }

  const daysLeft = Math.ceil((project.funding.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const fundingProgress = parseFloat(project.funding.goal) > 0 
    ? (parseFloat(project.funding.raised) / parseFloat(project.funding.goal)) * 100 
    : 0;

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
              <span>Back to Project</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {/* Removed blockchain/network info */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200 mb-8"
        >
          <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600">
            <img
              src={project.banner}
              alt={project.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/70 to-purple-600/70" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
              <p className="text-lg opacity-90">{project.description}</p>
              <div className="flex items-center space-x-2 mt-4">
                <img
                  src={project.owner.avatar}
                  alt={project.owner.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="text-sm">by {project.owner.name}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Funding Progress and Recent Donations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding Progress</h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-bold text-gray-900">
                    {parseFloat(project.funding.raised).toFixed(4)} / {parseFloat(project.funding.goal).toFixed(1)} USD
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(fundingProgress, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>{Math.round(fundingProgress)}% funded</span>
                  <span>{project.funding.backers} backers</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">
                    {parseFloat(project.funding.raised).toFixed(4)} USD
                  </div>
                  <div className="text-gray-600">Raised</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <UserGroupIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{project.funding.backers}</div>
                  <div className="text-gray-600">Backers</div>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <ClockIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{daysLeft}</div>
                  <div className="text-gray-600">Days left</div>
                </div>
              </div>
            </motion.div>

            {/* Recent Donations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Donations</h2>
              
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.slice(0, 5).map((donation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {donation.donor_name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {parseFloat(donation.amount).toFixed(4)} USD
                        </div>
                        {donation.message && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            "{donation.message}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No donations yet. Be the first to support this project!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Donation Widget */}
          <div className="space-y-6">
            {/* Removed DonationWidget import and usage */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectFundingPage;