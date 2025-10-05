import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { logAction } from '../../services/auditLogs';
import { createNotification } from '../../services/integrations';

const SkillEndorsements: React.FC<{ userId: string }> = ({ userId }) => {
  const { user } = useAuth();
  const [endorsements, setEndorsements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) fetchEndorsements();
  }, [userId]);

  const fetchEndorsements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_endorsements')
        .select('id,endorser_id,skill,created_at,endorser:users(full_name,avatar_url)')
        .eq('target_user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setEndorsements(data || []);
    } catch (err) {
      console.error('Failed to load endorsements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndorse = async (skill: string) => {
    if (!user) {
      toast.error('Please sign in to endorse');
      return;
    }
    try {
      // Prevent double endorsement for same skill by same user
      const { data: existing } = await supabase
        .from('user_endorsements')
        .select('*')
        .eq('target_user_id', userId)
        .eq('endorser_id', user.id)
        .eq('skill', skill)
        .limit(1)
        .single();
      if (existing) {
        toast('You already endorsed this user for this skill');
        return;
      }

      const { error } = await supabase.from('user_endorsements').insert([{
        target_user_id: userId,
        endorser_id: user.id,
        skill,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast.success('Endorsed successfully');
      // audit + notify
      try {
  await logAction('user_endorsed', user?.id || null, { target: userId, skill });
  await createNotification(userId, 'New endorsement', `${user?.fullName || 'Someone'} endorsed you for ${skill}`);
      } catch (e) {
        console.warn('Endorse hooks failed', e);
      }
      fetchEndorsements();
    } catch (err) {
      console.error('Endorse failed', err);
      toast.error('Failed to endorse');
    }
  };

  return (
    <div className="my-4">
      <h3 className="font-semibold mb-2">Skill Endorsements</h3>
      {loading ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : (
        <div>
          {endorsements.length === 0 ? (
            <div className="text-gray-500 text-sm">No endorsements yet.</div>
          ) : (
            <ul className="space-y-2">
              {endorsements.map(e => (
                <li key={e.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    {e.endorser?.avatar_url ? <img src={e.endorser.avatar_url} alt="avatar" /> : null}
                  </div>
                  <div>
                    <div className="font-medium">{e.endorser?.full_name || 'Anonymous'}</div>
                    <div className="text-sm text-gray-500">{e.skill}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3">
            <div className="text-sm text-gray-600 mb-2">Quick endorse</div>
            <div className="flex gap-2">
              {['Communication','Frontend','Backend','Project Management'].map(skill => (
                <button key={skill} onClick={() => handleEndorse(skill)} className="px-3 py-1 bg-blue-50 rounded text-sm">{skill}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillEndorsements;
