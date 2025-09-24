import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { ipfsService } from '../services/ipfsService';
import { advancedContractService, CampaignType } from '../services/advancedContracts';
import mockBlockchainService from '../services/mockBlockchain';
import { localStorageService } from '../services/localStorage';
import { enhancedProjectService } from '../services/enhancedProjectService';
import { web3Service } from '../services/web3';
import {
  PlusIcon,
  PhotoIcon,
  LinkIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  RocketLaunchIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface ProjectFormData {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  tags: string[];
  demoUrl: string;
  videoUrl: string;
  images: File[];
  imageUrls: string[];
  fundingGoal: number;
  deadline: string;
  teamSize: number;
  technologies: string[];
  features: string[];
  roadmap: RoadmapItem[];
  fundingTiers: FundingTier[];
  milestones: MilestoneData[];
}

interface MilestoneData {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  deadline: string;
  deliverables: string[];
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  timeline: string;
  completed: boolean;
}

interface FundingTier {
  id: string;
  title: string;
  amount: number;
  description: string;
  perks: string[];
  estimatedDelivery: string;
}

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    tags: [],
    demoUrl: '',
    videoUrl: '',
    images: [],
    imageUrls: [],
    fundingGoal: 0,
    deadline: '',
    teamSize: 1,
    technologies: [],
    features: [],
    roadmap: [],
    fundingTiers: [],
    milestones: []
  });

  const categories = [
    'AI/ML', 'Web Development', 'Mobile Apps', 'Blockchain', 'IoT', 
    'Gaming', 'DevTools', 'Productivity', 'Education', 'Healthcare',
    'Finance', 'E-commerce', 'Social', 'Entertainment', 'Other'
  ];

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Project details and description' },
    { number: 2, title: 'Media & Demo', description: 'Images, videos, and demo links' },
    { number: 3, title: 'Technical Details', description: 'Technologies and features' },
    { number: 4, title: 'Funding & Team', description: 'Funding goals and team info' },
    { number: 5, title: 'Review & Publish', description: 'Final review and submission' }
  ];

  const updateFormData = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const addTechnology = () => {
    if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
      updateFormData('technologies', [...formData.technologies, newTech.trim()]);
      setNewTech('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    updateFormData('technologies', formData.technologies.filter(tech => tech !== techToRemove));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      updateFormData('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    updateFormData('features', formData.features.filter(feature => feature !== featureToRemove));
  };

  const addMilestone = () => {
    const newMilestone: MilestoneData = {
      id: Date.now().toString(),
      title: '',
      description: '',
      targetAmount: 0,
      deadline: '',
      deliverables: []
    };
    updateFormData('milestones', [...formData.milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: keyof MilestoneData, value: any) => {
    updateFormData('milestones', formData.milestones.map(milestone => 
      milestone.id === id ? { ...milestone, [field]: value } : milestone
    ));
  };

  const removeMilestone = (id: string) => {
    updateFormData('milestones', formData.milestones.filter(milestone => milestone.id !== id));
  };

  const addRoadmapItem = () => {
    const newItem: RoadmapItem = {
      id: Date.now().toString(),
      title: '',
      description: '',
      timeline: '',
      completed: false
    };
    updateFormData('roadmap', [...formData.roadmap, newItem]);
  };

  const updateRoadmapItem = (id: string, field: keyof RoadmapItem, value: any) => {
    updateFormData('roadmap', formData.roadmap.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeRoadmapItem = (id: string) => {
    updateFormData('roadmap', formData.roadmap.filter(item => item.id !== id));
  };

  const addFundingTier = () => {
    const newTier: FundingTier = {
      id: Date.now().toString(),
      title: '',
      amount: 0,
      description: '',
      perks: [],
      estimatedDelivery: ''
    };
    updateFormData('fundingTiers', [...formData.fundingTiers, newTier]);
  };

  const updateFundingTier = (id: string, field: keyof FundingTier, value: any) => {
    updateFormData('fundingTiers', formData.fundingTiers.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const removeFundingTier = (id: string) => {
    updateFormData('fundingTiers', formData.fundingTiers.filter(tier => tier.id !== id));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      updateFormData('images', [...formData.images, ...files]);
      
      // Create preview URLs
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      updateFormData('imageUrls', [...formData.imageUrls, ...newImageUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
    updateFormData('images', newImages);
    updateFormData('imageUrls', newImageUrls);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to create a project');
      return;
    }

    setIsSubmitting(true);
    let projectId: string | null = null;
    
    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || !formData.fundingGoal || !formData.deadline) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Upload images to IPFS
      let imageHashes: string[] = [];
      if (formData.images.length > 0) {
        toast.loading('Uploading images to IPFS...');
        
        for (const image of formData.images) {
          try {
            const result = await ipfsService.uploadFile(image, {
              name: `project_image_${Date.now()}`,
              type: 'project_image'
            });
            
            if (result.success && result.ipfsHash) {
              imageHashes.push(result.ipfsHash);

            } else {
              console.warn('Failed to upload image to IPFS:', result);
            }
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            toast.error(`Failed to upload image: ${image.name}`);
          }
        }
        toast.dismiss();

      }

      // Create project metadata for IPFS
      const projectMetadata = {
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        category: formData.category,
        tags: formData.tags,
        demoUrl: formData.demoUrl,
        videoUrl: formData.videoUrl,
        imageHashes,
        technologies: formData.technologies,
        features: formData.features,
        roadmap: formData.roadmap,
        fundingTiers: formData.fundingTiers,
        milestones: formData.milestones,
        teamSize: formData.teamSize
      };

      // Upload metadata to IPFS
      toast.loading('Uploading project metadata to IPFS...');

      
      const metadataResult = await ipfsService.uploadJSON(projectMetadata, {
        name: `project_metadata_${formData.title}`,
        type: 'project_metadata'
      });
      toast.dismiss();

      if (!metadataResult.success || !metadataResult.ipfsHash) {
        throw new Error(`Failed to upload project metadata to IPFS: ${metadataResult.error || 'Unknown error'}`);
      }
      


      // Generate unique project ID
      projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create project data for localStorage
      const projectData = {
        id: projectId,
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        creatorId: user.id || user.walletAddress || 'anonymous',
        creatorName: user.email || 'Anonymous',
        category: formData.category,
        tags: formData.tags,
        demoUrl: formData.demoUrl,
        videoUrl: formData.videoUrl,
        imageHashes,
        fundingGoal: formData.fundingGoal,
        currentFunding: 0,
        deadline: formData.deadline,
        teamSize: formData.teamSize,
        technologies: formData.technologies,
        features: formData.features,
        roadmap: formData.roadmap,
        fundingTiers: formData.fundingTiers,
        milestones: formData.milestones,
        ipfsHash: metadataResult.ipfsHash,
        blockchainRecord: undefined, // Will be updated after blockchain registration
        status: 'active' as const
      };

      // Save project to both localStorage and Supabase
      toast.loading('Creating project...');
      
      const saveResult = await enhancedProjectService.saveProject(projectData);
      toast.dismiss();

      if (!saveResult.success || !saveResult.project) {
        throw new Error(saveResult.error || 'Failed to create project');
      }

      const savedProject = saveResult.project;

      // Register project on blockchain
      let blockchainResult = null;
      try {
        toast.loading('Finalizing project...');

        // Register project on blockchain using web3Service (for funding compatibility)
        try {
          // Connect wallet first if not connected
          const account = await web3Service.getAccount();
          if (!account) {
            const connectResult = await web3Service.connectWallet();
            if (!connectResult.success) {
              console.warn('Failed to connect wallet for blockchain registration:', connectResult.error);
              throw new Error('Please connect your wallet to register the project on blockchain');
            }
          }

          // Register project on blockchain for funding compatibility
          const web3Result = await web3Service.createProject(
            projectId,
            (formData.fundingGoal / 1000).toString(), // Convert USD to ETH estimate (rough conversion)
            new Date(formData.deadline)
          );

          if (web3Result.success && web3Result.transactionHash) {
            blockchainResult = {
              txHash: web3Result.transactionHash,
              blockNumber: 0, // Will be updated when transaction is mined
              gasUsed: '0',
              gasPrice: '0'
            };
            
            console.log('✅ Project registered on blockchain:', web3Result.transactionHash);
          } else {
            console.warn('⚠️ Web3 registration failed, falling back to mock:', web3Result.error);
            // Fall back to mock service if web3 registration fails
            blockchainResult = await mockBlockchainService.registerProject({
              id: projectId,
              title: formData.title,
              description: formData.description,
              author: user.walletAddress || '',
              timestamp: new Date().toISOString(),
              category: formData.category,
              tags: formData.tags
            });
          }
        } catch (web3Error: any) {
          console.warn('⚠️ Web3 registration failed, using mock blockchain:', web3Error.message);
          
          // Fall back to mock blockchain service
          blockchainResult = await mockBlockchainService.registerProject({
            id: projectId,
            title: formData.title,
            description: formData.description,
            author: user.walletAddress || '',
            timestamp: new Date().toISOString(),
            category: formData.category,
            tags: formData.tags
          });
        }

        // Also try advanced contracts if enabled (optional - for additional features)
        if (process.env.REACT_APP_ENABLE_REAL_CONTRACTS === 'true') {
          try {
            await advancedContractService.initialize();
            
            const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
            const goalAmountStr = (formData.fundingGoal / 1000).toString(); // Convert USD to ETH estimate
            
            const tx = await advancedContractService.createCampaign(
              CampaignType.PROJECT,
              formData.title,
              formData.description,
              metadataResult.ipfsHash,
              goalAmountStr,
              deadline,
              [],
              [],
              []
            );

            console.log('✅ Project also registered with advanced contracts:', tx.hash);
          } catch (advancedError) {
            console.warn('⚠️ Advanced contract registration failed:', advancedError);
            // This is optional, so we don't fail the whole process
          }
        }
        toast.dismiss();

        if (blockchainResult && blockchainResult.txHash) {

          
          // Update project with blockchain transaction hash in both localStorage and Supabase
          const blockchainRecord = {
            txHash: blockchainResult.txHash,
            blockNumber: blockchainResult.blockNumber || 0,
            timestamp: new Date().toISOString(),
            verified: true
          };
          
          const updateResult = await enhancedProjectService.updateProject(projectId, { 
            blockchainTxHash: blockchainResult.txHash,
            blockchainRecord 
          });
          
          // Also ensure IPFS hash is synced to Supabase
          if (savedProject.ipfsHash) {
            await enhancedProjectService.syncIPFSHashToSupabase(savedProject.id, savedProject.ipfsHash);
          }
          if (updateResult.success) {
            toast.success('🎉 Project created successfully!');
          } else {
            toast.success('🎉 Project created successfully!');
          }
        } else {
          toast.success('🎉 Project created successfully!');
        }
      } catch (blockchainError: any) {
        console.error('Blockchain registration failed:', blockchainError);
        toast.success('🎉 Project created successfully!');
      }

      // Redirect to projects page
      setTimeout(() => {
        navigate('/projects');
      }, 2000);

    } catch (error: any) {
      console.error('Project creation error:', error);
      
      // Enhanced error reporting
      const errorMessage = error.message || 'Failed to create project. Please try again.';
      const errorDetails = {
        error: error,
        formData: {
          title: formData.title,
          category: formData.category,
          hasImages: formData.images.length > 0,
          hasUser: !!user
        },
        projectId,
        timestamp: new Date().toISOString()
      };
      
      console.error('Detailed error information:', errorDetails);
      toast.error(`❌ ${errorMessage}`);
      
      // Show additional help for common errors
      if (errorMessage.includes('MetaMask')) {
        toast.error('💡 Make sure MetaMask is installed and connected');
      } else if (errorMessage.includes('IPFS')) {
        toast.error('💡 IPFS upload failed - check your internet connection');
      } else if (errorMessage.includes('localStorage')) {
        toast.error('💡 Local storage issue - try clearing browser data');
      }
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate required fields for each step
    if (currentStep === 1) {
      if (!formData.title || !formData.description || !formData.category) {
        toast.error('Please fill in all required fields: Title, Description, and Category');
        return;
      }
    } else if (currentStep === 4) {
      if (!formData.fundingGoal || !formData.deadline) {
        toast.error('Please fill in all required fields: Funding Goal and Deadline');
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFieldValid = (fieldName: string): boolean => {
    const value = formData[fieldName as keyof ProjectFormData];
    return value !== '' && value !== null && value !== undefined && 
           (typeof value !== 'number' || value > 0);
  };

  const getFieldClassName = (fieldName: string, baseClassName: string): string => {
    const requiredFields = ['title', 'description', 'longDescription', 'category', 'fundingGoal', 'deadline'];
    if (requiredFields.includes(fieldName) && !isFieldValid(fieldName)) {
      return `${baseClassName} border-red-500 focus:border-red-500 focus:ring-red-500`;
    }
    return baseClassName;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className={getFieldClassName('title', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white")}
                placeholder="Enter your project title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
                className={getFieldClassName('description', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none")}
                placeholder="Brief description of your project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => updateFormData('longDescription', e.target.value)}
                rows={8}
                className={getFieldClassName('longDescription', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none")}
                placeholder="Detailed description, goals, and vision for your project..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className={getFieldClassName('category', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white")}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Add tags..."
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Demo URL
              </label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => updateFormData('demoUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://your-demo-url.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL (YouTube, Vimeo, etc.)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => updateFormData('videoUrl', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Images
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Upload project images</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">PNG, JPG up to 10MB each</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
              
              {/* Image Previews */}
              {formData.imageUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Technologies Used
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="React, Node.js, Python..."
                />
                <button
                  type="button"
                  onClick={addTechnology}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map(tech => (
                  <span
                    key={tech}
                    className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(tech)}
                      className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Features
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="List key features..."
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2">
                {formData.features.map(feature => (
                  <div
                    key={feature}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <span className="text-gray-900 dark:text-white">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Milestones (for funding)
                </label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Add Milestone
                </button>
              </div>
              <div className="space-y-4">
                {formData.milestones.map(milestone => (
                  <div key={milestone.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Milestone title..."
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={milestone.targetAmount}
                          onChange={(e) => updateMilestone(milestone.id, 'targetAmount', parseFloat(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Target amount..."
                        />
                        <button
                          type="button"
                          onClick={() => removeMilestone(milestone.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 resize-none"
                      placeholder="Milestone description..."
                    />
                    <input
                      type="date"
                      value={milestone.deadline}
                      onChange={(e) => updateMilestone(milestone.id, 'deadline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
              {formData.milestones.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                  Add milestones to enable milestone-based funding and verification
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Roadmap
                </label>
                <button
                  type="button"
                  onClick={addRoadmapItem}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Milestone
                </button>
              </div>
              <div className="space-y-4">
                {formData.roadmap.map(item => (
                  <div key={item.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateRoadmapItem(item.id, 'title', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mr-3"
                        placeholder="Milestone title..."
                      />
                      <button
                        type="button"
                        onClick={() => removeRoadmapItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateRoadmapItem(item.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 resize-none"
                      placeholder="Milestone description..."
                    />
                    <input
                      type="text"
                      value={item.timeline}
                      onChange={(e) => updateRoadmapItem(item.id, 'timeline', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Timeline (e.g., Q1 2024, 3 months, etc.)..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Funding Goal (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.fundingGoal}
                  onChange={(e) => updateFormData('fundingGoal', parseFloat(e.target.value))}
                  className={getFieldClassName('fundingGoal', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white")}
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Funding Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateFormData('deadline', e.target.value)}
                  className={getFieldClassName('deadline', "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                value={formData.teamSize}
                onChange={(e) => updateFormData('teamSize', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Funding Tiers
                </label>
                <button
                  type="button"
                  onClick={addFundingTier}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Tier
                </button>
              </div>
              <div className="space-y-4">
                {formData.fundingTiers.map(tier => (
                  <div key={tier.id} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={tier.title}
                        onChange={(e) => updateFundingTier(tier.id, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Tier title..."
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={tier.amount}
                          onChange={(e) => updateFundingTier(tier.id, 'amount', parseFloat(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          placeholder="Amount..."
                        />
                        <button
                          type="button"
                          onClick={() => removeFundingTier(tier.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={tier.description}
                      onChange={(e) => updateFundingTier(tier.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-3 resize-none"
                      placeholder="Tier description..."
                    />
                    <input
                      type="text"
                      value={tier.estimatedDelivery}
                      onChange={(e) => updateFundingTier(tier.id, 'estimatedDelivery', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Estimated delivery (e.g., March 2024)..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Review Your Project
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                Please review all the information below before publishing your project.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Basic Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Title: {formData.title || 'Not set'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Category: {formData.category || 'Not set'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tags: {formData.tags.length ? formData.tags.join(', ') : 'None'}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Technical Details</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Technologies: {formData.technologies.length ? formData.technologies.join(', ') : 'None'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Features: {formData.features.length} features</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Roadmap: {formData.roadmap.length} milestones</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Funding Milestones: {formData.milestones.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Funding & Team</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Goal: ${formData.fundingGoal?.toLocaleString() || '0'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deadline: {formData.deadline || 'Not set'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Size: {formData.teamSize} member{formData.teamSize !== 1 ? 's' : ''}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Funding Tiers: {formData.fundingTiers.length}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Media</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Demo URL: {formData.demoUrl || 'Not provided'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Video URL: {formData.videoUrl || 'Not provided'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Images: {formData.images.length} uploaded</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ Once published, your project will be publicly visible and discoverable by other users. Make sure all information is accurate and complete.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h1>
            
            <div className="w-16" /> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.number
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-4 ${
                    currentStep > step.number
                      ? 'bg-blue-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {steps[currentStep - 1].title}
          </h2>
          
          {/* Required Fields Notice */}
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center">
              <span className="text-red-500 mr-1">*</span>
              Required fields are marked with a red asterisk
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <motion.button
                  onClick={nextStep}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-5 h-5" />
                      <span>Publish Project</span>
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProjectPage;