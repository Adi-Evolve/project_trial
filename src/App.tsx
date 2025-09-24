import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import IdeasPage from './pages/IdeasPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';
import MyProjectsPage from './pages/MyProjectsPage';
import IdeaHubPage from './pages/IdeaHubPage';
import TrendingPage from './pages/TrendingPage';
import LeaderboardPage from './pages/LeaderboardPage';
import FindCollaboratorsPage from './pages/FindCollaboratorsPage';
import ProjectManagementPage from './pages/ProjectManagementPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProjectFundingPage from './pages/ProjectFundingPage';
import CreateProjectPage from './pages/CreateProjectPage';
import EditProjectPage from './pages/EditProjectPage';
import UserProfilePage from './pages/UserProfilePage';
import MessagesPage from './pages/MessagesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import HelpPage from './pages/HelpPage';
import SettingsPage from './pages/SettingsPage';
import BookmarksPage from './pages/BookmarksPage';
import NotificationsPage from './pages/NotificationsPage';
import FollowingPage from './pages/FollowingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import EmailServiceDemo from './components/testing/EmailServiceDemo';
import TestFundTransferPage from './pages/TestFundTransferPage';
import { TestEscrowPage } from './pages/TestEscrowPage';
import { AuthFlow } from './components/auth/AuthFlow';
import WelcomeBack from './components/auth/WelcomeBack';
import LandingPage from './components/landing/LandingPage';
import FloatingChatButton from './components/chat/FloatingChatButton';
import { useAuth } from './context/AuthContext';

// App content component that has access to auth context
const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Check if this is a returning user with an existing session
  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      const lastSessionTime = localStorage.getItem('auth_last_login');
      const isReturningUser = lastSessionTime && 
        Date.now() - parseInt(lastSessionTime) > 5 * 60 * 1000; // Show welcome back if last session was more than 5 minutes ago
      
      if (isReturningUser) {
        setShowWelcomeBack(true);
      }
    }
  }, [isAuthenticated, user, isLoading]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ProjectForge...</p>
        </div>
      </div>
    );
  }

  // Show authentication flow if user clicked sign in/login
  if (showAuthFlow && !isAuthenticated) {
    return (
      <AuthFlow 
        defaultMode={authMode}
        onBack={() => setShowAuthFlow(false)}
      />
    );
  }

  // Show welcome back screen for returning users
  if (showWelcomeBack && isAuthenticated) {
    return (
      <WelcomeBack 
        onContinue={() => {
          setShowWelcomeBack(false);
          // Update the last session time to current
          localStorage.setItem('auth_last_login', Date.now().toString());
        }} 
      />
    );
  }

  // Show landing page for new/unauthenticated users
  if (!isAuthenticated) {
    return (
      <LandingPage
        onLogin={() => {
          setAuthMode('login');
          setShowAuthFlow(true);
        }}
        onSignUp={() => {
          setAuthMode('signup');
          setShowAuthFlow(true);
        }}
      />
    );
  }

  // Show main app if authenticated
  return (
    <>
      <Routes>
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route path="/projects" element={
          <Layout>
            <ProjectsPage />
          </Layout>
        } />
        <Route path="/ideas" element={
          <Layout>
            <IdeasPage />
          </Layout>
        } />
        <Route path="/community" element={
          <Layout>
            <CommunityPage />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <ProfilePage />
          </Layout>
        } />
        <Route path="/my-projects" element={
          <Layout>
            <MyProjectsPage />
          </Layout>
        } />
        <Route path="/idea-hub" element={
          <Layout>
            <IdeaHubPage />
          </Layout>
        } />
        <Route path="/trending" element={
          <Layout>
            <TrendingPage />
          </Layout>
        } />
        <Route path="/leaderboard" element={
          <Layout>
            <LeaderboardPage />
          </Layout>
        } />
        <Route path="/find-collaborators" element={
          <Layout>
            <FindCollaboratorsPage />
          </Layout>
        } />
        <Route path="/project-management" element={
          <Layout>
            <ProjectManagementPage />
          </Layout>
        } />
        <Route path="/project/:id" element={
          <Layout>
            <ProjectDetailsPage />
          </Layout>
        } />
        <Route path="/projects/:id/fund" element={
          <Layout>
            <ProjectFundingPage />
          </Layout>
        } />
        <Route path="/create-project" element={
          <Layout>
            <CreateProjectPage />
          </Layout>
        } />
        <Route path="/edit-project/:id" element={
          <Layout>
            <EditProjectPage />
          </Layout>
        } />
        <Route path="/user/:userId" element={
          <Layout>
            <UserProfilePage />
          </Layout>
        } />
        <Route path="/messages" element={
          <Layout>
            <MessagesPage />
          </Layout>
        } />
        <Route path="/analytics" element={
          <Layout>
            <AnalyticsPage />
          </Layout>
        } />
        <Route path="/help" element={
          <Layout>
            <HelpPage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
        <Route path="/email-demo" element={
          <Layout>
            <EmailServiceDemo />
          </Layout>
        } />
        <Route path="/bookmarks" element={
          <Layout>
            <BookmarksPage />
          </Layout>
        } />
        <Route path="/notifications" element={
          <Layout>
            <NotificationsPage />
          </Layout>
        } />
        <Route path="/following" element={
          <Layout>
            <FollowingPage />
          </Layout>
        } />
        <Route path="/search" element={
          <Layout>
            <SearchResultsPage />
          </Layout>
        } />
        <Route path="/test-fund-transfer" element={
          <Layout>
            <TestFundTransferPage />
          </Layout>
        } />
        <Route path="/test-escrow" element={
          <Layout>
            <TestEscrowPage />
          </Layout>
        } />
        
        {/* Redirects */}
        <Route path="/discover" element={<Navigate to="/projects" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Floating Chat Button - only show when authenticated */}
      <FloatingChatButton />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <div className="App">
              <AppContent />
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                    border: '1px solid var(--toast-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: 'var(--toast-color)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: 'var(--toast-color)',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
