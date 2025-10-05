import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { createNotification } from '../../services/integrations';
import toast from 'react-hot-toast';

type UserProfile = {
  id: string;
  full_name?: string;
  email?: string;
  wallet_address?: string;
};

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [following, setFollowing] = useState<boolean>(false);
  const [composeMessage, setComposeMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', user.id).single();
        if (error) throw error;
        setProfile(data || null);
        setName(data?.full_name || '');
        setEmail(data?.email || '');

        // check if the logged in user follows themselves (for demo) 
        const { data: followRes } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', user.id).limit(1);
        setFollowing(Array.isArray(followRes) && followRes.length > 0);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('users').update({ full_name: name, email }).eq('id', user.id);
      if (error) throw error;
      toast.success('Profile updated');
      setEditing(false);
      setProfile((p) => p ? { ...p, full_name: name, email } : p);
    } catch (err) {
      console.error('saveProfile error', err);
      toast.error('Failed to update profile');
    }
  };

  const toggleFollow = async () => {
    if (!user || !profile) return;
    try {
      if (following) {
        const { error } = await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id);
        if (error) throw error;
        setFollowing(false);
        toast.success('Unfollowed');
      } else {
        const { error } = await supabase.from('follows').insert([{ follower_id: user.id, following_id: profile.id, created_at: new Date().toISOString() }]);
        if (error) throw error;
        setFollowing(true);
        // create a notification for the followed user
        await createNotification(profile.id, 'New Follower', `${user.id} started following you`, { follower_id: user.id });
        toast.success('Followed');
      }
    } catch (err) {
      console.error('toggleFollow error', err);
      toast.error('Failed to update follow status');
    }
  };

  const sendMessage = async () => {
    if (!user || !profile) return;
    try {
      // For now, queue a notification representing a message
      await createNotification(profile.id, 'Message', composeMessage, { from: user.id });
      setComposeMessage('');
      toast.success('Message sent (queued)');
    } catch (err) {
      console.error('sendMessage error', err);
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>
      {!profile ? (
        <div className="p-4 border rounded bg-gray-50 text-gray-500">Loading profile...</div>
      ) : (
        <div className="p-4 border rounded bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{profile.full_name || 'Unnamed User'}</h3>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={toggleFollow} className={`px-4 py-2 rounded ${following ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                {following ? 'Unfollow' : 'Follow'}
              </button>
              <button onClick={() => setEditing((s) => !s)} className="px-4 py-2 border rounded">{editing ? 'Cancel' : 'Edit'}</button>
            </div>
          </div>

          {editing && (
            <div className="mt-4 space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded" />
              <div className="flex space-x-2">
                <button onClick={saveProfile} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <h4 className="font-medium mb-2">Send Message</h4>
            <textarea value={composeMessage} onChange={(e) => setComposeMessage(e.target.value)} className="w-full p-2 border rounded" placeholder="Write a message..." />
            <div className="flex justify-end mt-2">
              <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
