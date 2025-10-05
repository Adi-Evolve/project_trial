import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const categories = [
  'AI/ML', 'Web Development', 'Mobile Apps', 'IoT', 'Gaming', 'DevTools', 
  'Productivity', 'Education', 'Healthcare', 'Finance', 'E-commerce', 
  'Social', 'Entertainment', 'Other'
];

const steps = [
  { number: 1, title: 'Basic Info' },
  { number: 2, title: 'Media & Demo' },
  { number: 3, title: 'Technical Details' },
  { number: 4, title: 'Funding & Team' },
  { number: 5, title: 'Review & Publish' }
];

interface FormData {
  title: string;
  description: string;
  category: string;
  tags: string[];
  demoUrl: string;
  videoUrl: string;
  images: File[];
  imageUrls: string[];
  fundingGoal: string;
  deadline: string;
  teamSize: number;
  technologies: string[];
  features: string[];
  roadmap: string[];
  fundingTiers: string[];
  milestones: string[];
  longDescription: string;
}

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    tags: [],
    demoUrl: '',
    videoUrl: '',
    images: [],
    imageUrls: [],
    fundingGoal: '',
    deadline: '',
    teamSize: 1,
    technologies: [],
    features: [],
    roadmap: [],
    fundingTiers: [],
    milestones: [],
    longDescription: ''
  });
  const [newTag, setNewTag] = useState('');
  const [disclosureChecked, setDisclosureChecked] = useState(false);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addToArray = (field: keyof FormData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeFromArray = (field: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitProject = async () => {
    if (!user) {
      toast.error('Please log in to create a project');
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        ...formData,
        creatorId: user.id || 'anonymous',
        creatorName: user.email || 'Anonymous',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('Project data:', projectData);

      // Simulate project creation
      toast.loading('Creating project...');
      setTimeout(() => {
        toast.dismiss();
        toast.success('🎉 Project created successfully!');
        navigate('/projects');
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Enter your project title"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                placeholder="Briefly describe your project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
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
                Video URL
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
                Detailed Description
              </label>
              <textarea
                value={formData.longDescription}
                onChange={(e) => updateFormData('longDescription', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                placeholder="Provide a detailed description of your project"
              />
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
              <TechnologiesInput
                technologies={formData.technologies}
                onAdd={(tech) => addToArray('technologies', tech)}
                onRemove={(index) => removeFromArray('technologies', index)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Features
              </label>
              <FeaturesInput
                features={formData.features}
                onAdd={(feature) => addToArray('features', feature)}
                onRemove={(index) => removeFromArray('features', index)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Size
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.teamSize}
                onChange={(e) => updateFormData('teamSize', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Centralized Platform Notice
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                This platform operates on a centralized model. Traditional funding and blockchain features have been removed for simplicity and compliance.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Timeline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => updateFormData('deadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Milestones
              </label>
              <MilestonesInput
                milestones={formData.milestones}
                onAdd={(milestone) => addToArray('milestones', milestone)}
                onRemove={(index) => removeFromArray('milestones', index)}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Review Your Project</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Title:</h4>
                  <p className="text-gray-900 dark:text-white">{formData.title || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Category:</h4>
                  <p className="text-gray-900 dark:text-white">{formData.category || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Description:</h4>
                  <p className="text-gray-900 dark:text-white">{formData.description || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Tags:</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={disclosureChecked}
                    onChange={(e) => setDisclosureChecked(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I confirm that this project information is accurate and I agree to the platform terms.
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Create New Project</h1>
            <p className="text-blue-100">Share your ideas and collaborate with the community</p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${currentStep >= step.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium
                      ${currentStep >= step.number
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4
                        ${currentStep > step.number
                          ? 'bg-blue-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  disabled={!formData.title || !formData.description || !formData.category}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={submitProject}
                  disabled={isSubmitting || !disclosureChecked}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper Components
const TechnologiesInput: React.FC<{
  technologies: string[];
  onAdd: (tech: string) => void;
  onRemove: (index: number) => void;
}> = ({ technologies, onAdd, onRemove }) => {
  const [newTech, setNewTech] = useState('');

  const handleAdd = () => {
    if (newTech.trim()) {
      onAdd(newTech);
      setNewTech('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {technologies.map((tech, index) => (
          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            {tech}
            <button onClick={() => onRemove(index)} className="ml-2">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newTech}
          onChange={(e) => setNewTech(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Add technology"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const FeaturesInput: React.FC<{
  features: string[];
  onAdd: (feature: string) => void;
  onRemove: (index: number) => void;
}> = ({ features, onAdd, onRemove }) => {
  const [newFeature, setNewFeature] = useState('');

  const handleAdd = () => {
    if (newFeature.trim()) {
      onAdd(newFeature);
      setNewFeature('');
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <span className="text-purple-800 dark:text-purple-200">{feature}</span>
            <button onClick={() => onRemove(index)} className="text-purple-600 hover:text-purple-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Add feature"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const MilestonesInput: React.FC<{
  milestones: string[];
  onAdd: (milestone: string) => void;
  onRemove: (index: number) => void;
}> = ({ milestones, onAdd, onRemove }) => {
  const [newMilestone, setNewMilestone] = useState('');

  const handleAdd = () => {
    if (newMilestone.trim()) {
      onAdd(newMilestone);
      setNewMilestone('');
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-3">
        {milestones.map((milestone, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <span className="text-yellow-800 dark:text-yellow-200">{milestone}</span>
            <button onClick={() => onRemove(index)} className="text-yellow-600 hover:text-yellow-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMilestone}
          onChange={(e) => setNewMilestone(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="Add milestone"
        />
        <button onClick={handleAdd} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CreateProjectPage;