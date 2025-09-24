import React from 'react';
import { EscrowManagement } from '../components/escrow/EscrowManagement';
import { ShieldCheckIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';

export const TestEscrowPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheckIcon className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Escrow System Testing</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test the milestone-based escrow release mechanism for project funding protection
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <ClockIcon className="h-8 w-8 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Milestone-Based</h3>
            </div>
            <p className="text-gray-600">
              Funds are released incrementally as project milestones are completed and approved, ensuring accountability.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Secure Escrow</h3>
            </div>
            <p className="text-gray-600">
              Smart contract holds funds in escrow until milestones are verified, protecting both backers and creators.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 ml-3">Transparent Releases</h3>
            </div>
            <p className="text-gray-600">
              All fund releases are tracked on-chain with full transparency and immutable records.
            </p>
          </div>
        </div>

        {/* Test Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Test the Escrow System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Create Milestones</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Navigate to the "Create" tab below</li>
                <li>• Define project milestones with percentages</li>
                <li>• Ensure percentages total exactly 100%</li>
                <li>• Set realistic due dates for each milestone</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Milestone Workflow</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Submit completion evidence when ready</li>
                <li>• Milestone enters review status</li>
                <li>• Upon approval, request fund release</li>
                <li>• Funds are released via smart contract</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Escrow Management Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600 mr-3" />
            Live Escrow Management Demo
          </h2>
          
          <EscrowManagement 
            projectId="test-escrow-project-1"
            isOwner={true}
          />
        </div>

        {/* Features List */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escrow System Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Milestone Management</h3>
                <p className="text-sm text-gray-600">Create, track, and manage project milestones</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Evidence Submission</h3>
                <p className="text-sm text-gray-600">Submit proof of milestone completion</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Automated Releases</h3>
                <p className="text-sm text-gray-600">Smart contract handles fund distribution</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Progress Tracking</h3>
                <p className="text-sm text-gray-600">Real-time escrow status and fund tracking</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Emergency Release</h3>
                <p className="text-sm text-gray-600">Emergency fund release for critical situations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Blockchain Security</h3>
                <p className="text-sm text-gray-600">Immutable records and transparent transactions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};