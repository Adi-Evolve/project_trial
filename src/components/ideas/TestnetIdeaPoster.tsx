import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { advancedBlockchainService } from '../../services/advancedBlockchain';

// Feature-flag: REACT_APP_ENABLE_TESTNET_POSTS
const ENABLE_TESTNET = process.env.REACT_APP_ENABLE_TESTNET_POSTS === 'true';

const TestnetIdeaPoster: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post an idea');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please provide a title and description');
      return;
    }

    setSubmitting(true);

    // Prepare idea payload
    const ideaPayload = {
      title: title.trim(),
      description: description.trim(),
      category: 'Testnet',
      tags: [],
      price: null,
      currency: 'USD',
      type: 'collaboration',
      visibility: 'public',
      creator_id: user.id,
      status: 'published'
    } as any;

    try {
      if (ENABLE_TESTNET) {
        toast.loading('Posting idea to testnet...', { id: 'testnet-post' });
        const txResult = await advancedBlockchainService.registerIdea({
          id: '',
          title: ideaPayload.title,
          description: ideaPayload.description,
          author: user.id,
          timestamp: new Date().toISOString(),
          category: 'Testnet',
          tags: []
        } as any);

        if (txResult && txResult.txHash) {
          // Persist idea in Supabase with tx metadata (if table supports it)
          const insertPayload = { ...ideaPayload, tx_hash: txResult.txHash, tx_block: txResult.blockNumber };
          const { error: insertError } = await supabase.from('ideas').insert(insertPayload);
          if (insertError) {
            toast.error('Posted to testnet but failed to save idea locally');
            console.error('Supabase insert after testnet post failed:', insertError);
          } else {
            toast.success('Idea posted to testnet and saved locally');
          }
          resetForm();
        } else {
          toast.error('Failed to post idea to testnet');
        }
        toast.dismiss('testnet-post');
      } else {
        // Fallback: save idea to Supabase normally
        const { data: createdIdea, error: createError } = await supabase
          .from('ideas')
          .insert(ideaPayload)
          .select()
          .single();

        if (createError) throw createError;

        toast.success('Idea submitted (stored in Supabase)');
        resetForm();
      }
    } catch (err) {
      console.error('TestnetIdeaPoster error:', err);
      toast.error('Failed to post idea. See console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-8 p-4 bg-secondary-800/30 rounded-2xl border border-secondary-700/50">
      <h3 className="font-bold mb-2 text-white">Post Idea to Testnet</h3>
      <p className="text-gray-400 text-sm mb-4">
        {ENABLE_TESTNET
          ? 'This will attempt to register the idea on the configured testnet contract via your wallet.'
          : 'Testnet posting is disabled. Submitting will save the idea to Supabase instead.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Idea title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white"
          maxLength={120}
        />

        <textarea
          placeholder="Short description of the idea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-secondary-700 border border-secondary-600 rounded-lg text-white resize-none"
          rows={4}
          maxLength={800}
        />

        <div className="flex items-center space-x-3">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-md font-medium text-white ${submitting ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'bg-purple-600 hover:bg-purple-500'}`}
          >
            {submitting ? 'Posting...' : (ENABLE_TESTNET ? 'Post to Testnet' : 'Submit Idea')}
          </button>

          {ENABLE_TESTNET && (
            <button
              type="button"
              onClick={() => toast('Ensure your wallet is unlocked and connected before posting.')}
              className="px-3 py-2 rounded-md bg-secondary-700 text-gray-300"
            >
              Wallet Help
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TestnetIdeaPoster;
