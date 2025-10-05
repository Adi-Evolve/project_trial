import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import SkillEndorsements from '../components/community/SkillEndorsements';
import ReputationBadge from '../components/reputation/ReputationBadge';
import FeedbackForm from '../components/feedback/FeedbackForm';
import ProjectAnalytics from '../components/analytics/ProjectAnalytics';
import ExportDataButton from '../components/common/ExportDataButton';
import { toast } from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // fetch user profile to get reputation and other metadata
      const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', user?.id).single();
      if (!profileError) setProfileData(profile);

      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);

      // Pending reviews assigned to this user (if reviewer)
      const { data: pending, error: pendingError } = await supabase
        .from('milestone_verifications')
        .select('*')
        .eq('assigned_reviewer_id', user?.id)
        .eq('status', 'pending');

      if (!pendingError) setPendingReviews(pending || []);
    } catch (err: any) {
      console.error('Dashboard fetch error', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          <ExportDataButton data={{ projects }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="panel">
          <h3 className="font-semibold">My Projects</h3>
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-gray-500">You haven't created any projects yet.</div>
          ) : (
            <ul className="space-y-2 mt-2">
              {projects.map(p => (
                <li key={p.id} className="p-2 bg-white rounded shadow-sm flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">Created {new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-gray-600">{p.milestone_count || 0} milestones</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3 className="font-semibold">Pending Reviews</h3>
          {pendingReviews.length === 0 ? (
            <div className="text-sm text-gray-500">No pending reviews assigned to you.</div>
          ) : (
            <ul className="space-y-2 mt-2">
              {pendingReviews.map(r => (
                <li key={r.id} className="p-2 bg-white rounded shadow-sm flex justify-between items-center">
                  <div>
                    <div className="font-medium">{r.title || 'Milestone Review'}</div>
                    <div className="text-sm text-gray-500">Submitted {new Date(r.submitted_at).toLocaleString()}</div>
                  </div>
                  <div className="text-sm text-gray-600">{r.campaign_id}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h3 className="font-semibold">My Stats</h3>
          <div className="mt-2 text-sm text-gray-600">Projects: {projects.length}</div>
          <div className="mt-1 text-sm text-gray-600">Pending Reviews: {pendingReviews.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Endorsements & Reputation</h3>
          <SkillEndorsements userId={user?.id || ''} />
          <div className="mt-3">
            <ReputationBadge points={profileData?.reputation || 0} />
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Analytics</h3>
          <ProjectAnalytics userId={user?.id || ''} />
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Leave Feedback</h3>
        <FeedbackForm userId={user?.id || ''} />
      </div>
    </div>
  );
};

export default DashboardPage;
