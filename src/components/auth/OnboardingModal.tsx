import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SKILL_CATEGORIES, PROJECT_CATEGORIES } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, updateUser } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    fieldsOfInterest: [] as string[],
    skills: [] as string[],
    experienceLevel: 'intermediate' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    lookingFor: [] as string[],
    availability: 'part-time' as 'full-time' | 'part-time' | 'freelance' | 'hobby'
  });

  const totalSteps = 4;

  const lookingForOptions = [
    { value: 'cofounders', label: 'Co-founders', icon: '🤝' },
    { value: 'developers', label: 'Developers', icon: '💻' },
    { value: 'designers', label: 'Designers', icon: '🎨' },
    { value: 'marketers', label: 'Marketers', icon: '📢' },
    { value: 'funding', label: 'Funding', icon: '💰' },
    { value: 'mentorship', label: 'Mentorship', icon: '🎓' },
    { value: 'ideas', label: 'Project Ideas', icon: '💡' },
    { value: 'feedback', label: 'Feedback', icon: '💬' }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      updateUser({
        bio: formData.bio,
        interests: formData.fieldsOfInterest,
        skills: formData.skills
      });

      toast.success('Profile setup completed!');
      onComplete();
    } catch (error: any) {
      toast.error('Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-2xl glass rounded-2xl shadow-2xl border border-secondary-700/50 overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="p-6 border-b border-secondary-700/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold gradient-text">Complete Your Profile</h2>
              <span className="text-sm text-secondary-400">Step {step} of {totalSteps}</span>
            </div>
            <div className="w-full bg-secondary-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-2 rounded-full"
                initial={{ width: '25%' }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">Tell us about yourself</h3>
                    <p className="text-secondary-400">Help others understand who you are and what you're passionate about</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Bio (Optional)
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself, your interests, and what you're working on..."
                      className="input-field w-full h-32 resize-none"
                      maxLength={500}
                    />
                    <div className="text-right text-xs text-secondary-500 mt-1">
                      {formData.bio.length}/500
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Experience Level
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => (
                        <motion.button
                          key={level}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, experienceLevel: level }))}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.experienceLevel === level
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-secondary-600 hover:border-secondary-500'
                          }`}
                        >
                          <div className="font-medium capitalize">{level}</div>
                          <div className="text-xs text-secondary-400 mt-1">
                            {level === 'beginner' && 'Just starting out'}
                            {level === 'intermediate' && 'Some experience'}
                            {level === 'advanced' && 'Very experienced'}
                            {level === 'expert' && 'Industry expert'}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">What interests you?</h3>
                    <p className="text-secondary-400">Select the categories you're passionate about (choose at least 3)</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PROJECT_CATEGORIES.map((category) => (
                      <motion.button
                        key={category.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleArrayItem(
                          formData.fieldsOfInterest,
                          category.value,
                          (newInterests) => setFormData(prev => ({ ...prev, fieldsOfInterest: newInterests }))
                        )}
                        className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                          formData.fieldsOfInterest.includes(category.value)
                            ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                            : 'border-secondary-600 hover:border-secondary-500'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-medium text-sm">{category.label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <div className="text-center text-sm text-secondary-400">
                    Selected: {formData.fieldsOfInterest.length} categories
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">What are your skills?</h3>
                    <p className="text-secondary-400">Select your top skills to help others find you for collaboration</p>
                  </div>

                  <div className="space-y-6 max-h-80 overflow-y-auto">
                    {SKILL_CATEGORIES.map((category) => (
                      <div key={category.category} className="space-y-3">
                        <h4 className="font-medium text-primary-300 text-sm">{category.category}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {category.skills.map((skill) => (
                            <motion.button
                              key={skill}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleArrayItem(
                                formData.skills,
                                skill,
                                (newSkills) => setFormData(prev => ({ ...prev, skills: newSkills }))
                              )}
                              className={`p-2 rounded text-xs transition-all duration-200 ${
                                formData.skills.includes(skill)
                                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/50'
                                  : 'bg-secondary-700 hover:bg-secondary-600 border border-secondary-600'
                              }`}
                            >
                              {skill}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-sm text-secondary-400">
                    Selected: {formData.skills.length} skills
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-semibold mb-2">What are you looking for?</h3>
                    <p className="text-secondary-400">Help us recommend the right projects and connections</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-3">
                      I'm looking for...
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {lookingForOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleArrayItem(
                            formData.lookingFor,
                            option.value,
                            (newLookingFor) => setFormData(prev => ({ ...prev, lookingFor: newLookingFor }))
                          )}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.lookingFor.includes(option.value)
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-secondary-600 hover:border-secondary-500'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-medium text-sm">{option.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-3">
                      Availability
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['full-time', 'part-time', 'freelance', 'hobby'] as const).map((availability) => (
                        <motion.button
                          key={availability}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData(prev => ({ ...prev, availability }))}
                          className={`p-3 rounded-lg border transition-all duration-200 ${
                            formData.availability === availability
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-secondary-600 hover:border-secondary-500'
                          }`}
                        >
                          <div className="font-medium capitalize">{availability.replace('-', ' ')}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-secondary-700/50 rounded-lg p-4 mt-6">
                    <h4 className="font-medium mb-2 flex items-center">
                      <CheckIcon className="h-5 w-5 text-success-500 mr-2" />
                      You're all set!
                    </h4>
                    <p className="text-sm text-secondary-400">
                      Your profile is ready. You can always update these preferences later in your profile settings.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-secondary-700/50 flex justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrev}
              disabled={step === 1}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                step === 1
                  ? 'opacity-50 cursor-not-allowed text-secondary-500'
                  : 'btn-secondary'
              }`}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span>Previous</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={step === totalSteps ? handleComplete : handleNext}
              disabled={loading || (step === 2 && formData.fieldsOfInterest.length < 3)}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Completing...</span>
                </>
              ) : step === totalSteps ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Complete Setup</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OnboardingModal;