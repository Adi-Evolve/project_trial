import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { logAction } from '../../services/auditLogs';
import { createNotification } from '../../services/integrations';

const FeedbackForm: React.FC<{ userId: string }> = ({ userId }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    if (userId) fetchRecent();
  }, [userId]);

  const fetchRecent = async () => {
    const { data } = await supabase.from('user_feedback').select('id,rating,comment,created_at,from_user:users(full_name)').eq('to_user_id', userId).order('created_at', { ascending: false }).limit(5);
    setRecent(data || []);
  };

  const submit = async () => {
    if (!user) return toast.error('Sign in to leave feedback');
    try {
      const { error } = await supabase.from('user_feedback').insert([{
        to_user_id: userId,
        from_user_id: user.id,
        rating,
        comment,
        created_at: new Date().toISOString()
      }]);
      if (error) throw error;
      toast.success('Feedback submitted');
      setComment('');
      setRating(5);
      try {
        await logAction('feedback_submitted', user?.id || null, { to: userId, rating });
        await createNotification(userId, 'New feedback received', `${user?.fullName || 'Someone'} left feedback (${rating} ⭐)`);
      } catch (e) {
        console.warn('feedback hooks failed', e);
      }
      fetchRecent();
    } catch (err) {
      console.error('Feedback submit', err);
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-sm">Rating:</label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))} className="input-primary w-24">
          {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
        </select>
      </div>
      <textarea value={comment} onChange={e => setComment(e.target.value)} className="input-primary w-full mb-2" rows={3} placeholder="Write feedback..." />
      <div className="flex justify-end">
        <button onClick={submit} className="btn-primary">Submit Feedback</button>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Recent Feedback</h4>
        {recent.length === 0 ? <div className="text-sm text-gray-500">No feedback yet.</div> : (
          <ul className="space-y-2">
            {recent.map(r => (
              <li key={r.id} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{r.from_user?.full_name || 'Anonymous'} <span className="text-sm text-gray-500">{r.rating} ⭐</span></div>
                <div className="text-sm text-gray-600">{r.comment}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FeedbackForm;
