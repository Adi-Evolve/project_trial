import React, { useEffect, useState, useRef } from 'react';
import { supabase, createRealtimeSubscription } from '../../services/supabase';

// Basic threaded comments implementation using Supabase
// - Fetches top-level comments for a project
// - Allows posting comments and replies
// - Subscribes to realtime changes (inserts)

type Comment = {
  id: string;
  project_id: string;
  parent_id: string | null;
  user_id: string | null;
  content: string;
  created_at: string;
};

const ProjectComments: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        if (!mounted.current) return;
        setComments(data || []);
      } catch (err) {
        console.error('fetchComments error', err);
      }
    };

    fetchComments();

    // subscribe to new comments for this project
    const sub = createRealtimeSubscription('comments', (payload: any) => {
      try {
        const newRecord = payload.new;
        if (!newRecord || newRecord.project_id !== projectId) return;
        setComments((prev) => [...prev, newRecord]);
      } catch (e) {
        // ignore
      }
    }, `project_id=eq.${projectId}`);

    return () => {
      mounted.current = false;
      try { sub?.unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, [projectId]);

  const postComment = async () => {
    if (!text.trim()) return;
    try {
      const payload = {
        project_id: projectId,
        parent_id: replyTo,
        content: text.trim(),
        created_at: new Date().toISOString()
      } as any;
      const { error } = await supabase.from('comments').insert([payload]);
      if (error) throw error;
      setText('');
      setReplyTo(null);
    } catch (err) {
      console.error('postComment error', err);
    }
  };

  const renderThread = (parentId: string | null, level = 0) => {
    return comments
      .filter((c) => c.parent_id === parentId)
      .map((c) => (
        <div key={c.id} className={`p-2 border-l ${level > 0 ? 'ml-4' : ''}`}>
          <div className="text-sm text-gray-700">{c.content}</div>
          <div className="text-xs text-gray-400">{new Date(c.created_at).toLocaleString()}</div>
          <div className="mt-1">
            <button className="text-xs text-blue-600" onClick={() => setReplyTo(c.id)}>Reply</button>
          </div>
          {renderThread(c.id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="mt-8">
      <h3 className="font-bold mb-2">Comments</h3>
      <div className="p-4 border rounded bg-white">
        <div className="mb-3">
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 border rounded" placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'} />
          <div className="flex items-center justify-between mt-2">
            <div className="text-xs text-gray-500">{replyTo ? 'Replying' : 'New comment'}</div>
            <div>
              {replyTo && <button className="mr-2 text-sm" onClick={() => setReplyTo(null)}>Cancel</button>}
              <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={postComment}>Post</button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-sm text-gray-500">No comments yet — be the first to comment.</div>
          ) : (
            renderThread(null)
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectComments;
