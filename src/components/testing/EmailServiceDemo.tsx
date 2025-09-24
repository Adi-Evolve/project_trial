import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { emailService } from '../../services/emailService';
import type { ProjectEmailData, IdeaEmailData, VerificationEmailData } from '../../services/emailService';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

const EmailServiceDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testProjectSubmission = async () => {
    setLoading(true);
    try {
      const projectData: ProjectEmailData = {
        projectTitle: 'Revolutionary DeFi Platform',
        projectDescription: 'A cutting-edge decentralized finance platform with innovative yield farming',
        creatorName: 'John Developer',
        creatorEmail: 'john@example.com',
        adminEmail: 'admin@projectforge.com',
        projectUrl: 'https://projectforge.com/projects/123',
        submissionDate: new Date().toLocaleDateString(),
        category: 'DeFi',
        fundingGoal: '$50,000'
      };

      const result = await emailService.sendProjectSubmissionEmail(projectData);
      setResults(prev => [...prev, { type: 'Project Submission', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testIdeaSubmission = async () => {
    setLoading(true);
    try {
      const ideaData: IdeaEmailData = {
        ideaTitle: 'AI-Powered Smart Contracts',
        ideaDescription: 'Using machine learning to optimize smart contract execution',
        submitterName: 'Jane Innovator',
        submitterEmail: 'jane@example.com',
        adminEmail: 'admin@projectforge.com',
        submissionDate: new Date().toLocaleDateString(),
        category: 'AI/ML',
        estimatedBudget: '$25,000'
      };

      const result = await emailService.sendIdeaSubmissionEmail(ideaData);
      setResults(prev => [...prev, { type: 'Idea Submission', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testApprovalEmail = async () => {
    setLoading(true);
    try {
      const result = await emailService.sendApprovalEmail(
        'John Developer',
        'john@example.com',
        'Revolutionary DeFi Platform',
        'project',
        { nextSteps: 'Proceed with milestone planning' }
      );
      setResults(prev => [...prev, { type: 'Approval Email', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testVerificationEmail = async () => {
    setLoading(true);
    try {
      const verificationData: VerificationEmailData = {
        userName: 'New User',
        userEmail: 'newuser@example.com',
        verificationLink: 'https://projectforge.com/verify/abc123',
        verificationToken: 'abc123xyz789',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const result = await emailService.sendVerificationEmail(verificationData);
      setResults(prev => [...prev, { type: 'Verification Email', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testMilestoneUpdate = async () => {
    setLoading(true);
    try {
      const result = await emailService.sendMilestoneUpdateEmail(
        'Revolutionary DeFi Platform',
        'John Developer',
        'john@example.com',
        'MVP Development Complete',
        'Successfully completed the minimum viable product development phase',
        'https://projectforge.com/projects/123'
      );
      setResults(prev => [...prev, { type: 'Milestone Update', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      const result = await emailService.getEmailLogs(10, 0);
      setResults(prev => [...prev, { type: 'Email Logs', result }]);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Enhanced EmailJS Service Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Test the enhanced EmailJS integration with blockchain storage and Supabase logging
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Email Functions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              onClick={testProjectSubmission}
              disabled={loading}
              className="w-full"
            >
              Project Submission
            </Button>
            
            <Button
              onClick={testIdeaSubmission}
              disabled={loading}
              className="w-full"
            >
              Idea Submission
            </Button>
            
            <Button
              onClick={testApprovalEmail}
              disabled={loading}
              className="w-full"
            >
              Approval Email
            </Button>
            
            <Button
              onClick={testVerificationEmail}
              disabled={loading}
              className="w-full"
            >
              Verification Email
            </Button>
            
            <Button
              onClick={testMilestoneUpdate}
              disabled={loading}
              className="w-full"
            >
              Milestone Update
            </Button>
            
            <Button
              onClick={fetchEmailLogs}
              disabled={loading}
              className="w-full"
            >
              Fetch Email Logs
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={clearResults}
              variant="outline"
              className="w-full"
            >
              Clear Results
            </Button>
          </div>
        </Card>

        {results.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {results.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.type}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.result.success
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {item.result.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  <pre className="text-xs bg-white dark:bg-gray-900 p-2 rounded overflow-x-auto">
                    {JSON.stringify(item.result, null, 2)}
                  </pre>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Features Implemented</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-green-600 dark:text-green-400 mb-2">
                ✅ Enhanced Email Features
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Project submission notifications</li>
                <li>• Idea submission notifications</li>
                <li>• Approval/rejection emails</li>
                <li>• Email verification</li>
                <li>• Milestone update notifications</li>
                <li>• Retry mechanism with exponential backoff</li>
                <li>• Multiple email templates support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                ✅ Blockchain & Database Integration
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Email metadata stored on blockchain</li>
                <li>• Email logs in Supabase database</li>
                <li>• Hash generation for verification</li>
                <li>• Comprehensive error handling</li>
                <li>• Email status tracking</li>
                <li>• Audit trail functionality</li>
                <li>• Query and filter email logs</li>
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EmailServiceDemo;