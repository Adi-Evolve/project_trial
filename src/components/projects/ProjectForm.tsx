import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  XMarkIcon, 
  PhotoIcon, 
  VideoCameraIcon,
  DocumentIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { blockchainService } from '../../services/blockchain';
import { toast } from 'react-hot-toast';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  fundingGoal: number;
  deadline: string;
  teamSize: number;
  skillsNeeded: string[];
  images: File[];
  videos: File[];
  documents: File[];
}

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: (project: any) => void;
}

const PROJECT_CATEGORIES = [
  'Technology', 'Healthcare', 'Education', 'Environment', 'Gaming',
  'AI/ML', 'Blockchain', 'IoT', 'Mobile App', 'Web Development',
  'Hardware', 'Research', 'Social Impact', 'Entertainment', 'Other'
];

const SKILLS_OPTIONS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'Go', 'Rust',
  'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps',
  'Mobile Development', 'Game Development', 'Blockchain', 'IoT',
  'Cybersecurity', 'Cloud Computing', 'Project Management', 'Marketing'
];

const ProjectForm: React.FC<ProjectFormProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    fundingGoal: 0,
    deadline: '',
    teamSize: 1,
    skillsNeeded: [],
    images: [],
    videos: [],
    documents: []
  });

  const fileInputRefs = {
    images: useRef<HTMLInputElement>(null),
    videos: useRef<HTMLInputElement>(null),
    documents: useRef<HTMLInputElement>(null)
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      handleInputChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  const handleSkillToggle = (skill: string) => {
    if (formData.skillsNeeded.includes(skill)) {
      handleInputChange('skillsNeeded', formData.skillsNeeded.filter(s => s !== skill));
    } else {
      handleInputChange('skillsNeeded', [...formData.skillsNeeded, skill]);
    }
  };

  const handleFileChange = (type: 'images' | 'videos' | 'documents', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      handleInputChange(type, [...formData[type], ...fileArray]);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '' && formData.category !== '';
      case 2:
        return formData.tags.length > 0 && formData.skillsNeeded.length > 0;
      case 3:
        return formData.fundingGoal > 0 && formData.deadline !== '' && formData.teamSize > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return;
    }

    setLoading(true);
    try {
      // Create project metadata
      const projectData: any = {
        id: `project_${Date.now()}_${user.id}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        fundingGoal: formData.fundingGoal,
        deadline: formData.deadline,
        teamSize: formData.teamSize,
        skillsNeeded: formData.skillsNeeded,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        status: 'active',
        fundingRaised: 0,
        supporters: [],
        updates: []
      };

      // Register project on blockchain for ownership and authenticity
      const blockchainRecord = await blockchainService.registerProject({
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        author: user.walletAddress || user.id || '',
        timestamp: projectData.createdAt,
        category: projectData.category,
        tags: projectData.tags
      });

      if (blockchainRecord) {
        projectData.blockchainRecord = blockchainRecord;
        toast.success('Project created and registered on blockchain!');
        onSuccess(projectData);
        onClose();
      } else {
        // Still create project even if blockchain registration fails
        toast.success('Project created successfully!');
        onSuccess(projectData);
        onClose();
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
          placeholder="Enter your project title"
          maxLength={100}
        />
        <div className="text-xs text-gray-400 mt-1">
          {formData.title.length}/100 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={6}
          className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
          placeholder="Describe your project in detail..."
          maxLength={2000}
        />
        <div className="text-xs text-gray-400 mt-1">
          {formData.description.length}/2000 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
        >
          <option value="">Select a category</option>
          {PROJECT_CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tags *
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-500/20 text-primary-300 border border-primary-500/30"
            >
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
              <button
                onClick={() => handleTagRemove(tag)}
                className="ml-1 hover:text-red-400 transition-colors"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
        <input
          type="text"
          placeholder="Add tags (press Enter)"
          className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const target = e.target as HTMLInputElement;
              handleTagAdd(target.value);
              target.value = '';
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Skills Needed *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {SKILLS_OPTIONS.map(skill => (
            <motion.button
              key={skill}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSkillToggle(skill)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                formData.skillsNeeded.includes(skill)
                  ? 'bg-primary-500 text-white border border-primary-400'
                  : 'bg-secondary-700 text-gray-300 border border-secondary-600 hover:border-primary-500'
              }`}
            >
              {skill}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
            Funding Goal (USD) *
          </label>
          <input
            type="number"
            value={formData.fundingGoal}
            onChange={(e) => handleInputChange('fundingGoal', Number(e.target.value))}
            min={0}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Deadline *
          </label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <UserGroupIcon className="w-4 h-4 inline mr-1" />
            Team Size *
          </label>
          <input
            type="number"
            value={formData.teamSize}
            onChange={(e) => handleInputChange('teamSize', Number(e.target.value))}
            min={1}
            max={50}
            className="w-full px-4 py-3 bg-secondary-700 border border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Media & Documents</h3>
        <p className="text-gray-400">Upload images, videos, and documents to showcase your project</p>
      </div>

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <PhotoIcon className="w-4 h-4 inline mr-1" />
            Images
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRefs.images.current?.click()}
            className="w-full h-32 border-2 border-dashed border-secondary-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-all duration-200"
          >
            <PhotoIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Images</span>
          </motion.button>
          <input
            ref={fileInputRefs.images}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileChange('images', e.target.files)}
            className="hidden"
          />
          {formData.images.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              {formData.images.length} image(s) selected
            </div>
          )}
        </div>

        {/* Videos */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <VideoCameraIcon className="w-4 h-4 inline mr-1" />
            Videos
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRefs.videos.current?.click()}
            className="w-full h-32 border-2 border-dashed border-secondary-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-all duration-200"
          >
            <VideoCameraIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Videos</span>
          </motion.button>
          <input
            ref={fileInputRefs.videos}
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFileChange('videos', e.target.files)}
            className="hidden"
          />
          {formData.videos.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              {formData.videos.length} video(s) selected
            </div>
          )}
        </div>

        {/* Documents */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <DocumentIcon className="w-4 h-4 inline mr-1" />
            Documents
          </label>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fileInputRefs.documents.current?.click()}
            className="w-full h-32 border-2 border-dashed border-secondary-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-400 transition-all duration-200"
          >
            <DocumentIcon className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Documents</span>
          </motion.button>
          <input
            ref={fileInputRefs.documents}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => handleFileChange('documents', e.target.files)}
            className="hidden"
          />
          {formData.documents.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              {formData.documents.length} document(s) selected
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-secondary-800/95 backdrop-blur-xl border border-secondary-700/50"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <p className="text-gray-400 mt-1">Step {currentStep} of 4</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.3 }}
                className="h-2 bg-gradient-to-r from-primary-500 to-accent-pink rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-secondary-700/50 flex justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 rounded-lg border border-secondary-600 text-gray-300 hover:text-white hover:border-secondary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </motion.button>

          <div className="flex space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-secondary-600 text-gray-300 hover:text-white hover:border-secondary-500 transition-all duration-200"
            >
              Cancel
            </motion.button>

            {currentStep < 4 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-pink text-white hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-accent-pink text-white hover:from-primary-400 hover:to-accent-pink/80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4" />
                    <span>Create Project</span>
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProjectForm;