import React, { useState } from 'react';

const FeedbackPage: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFeedback('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">Feedback</h1>
        <p className="mb-6 text-gray-700 dark:text-gray-300">We value your feedback! Let us know how we can improve ProjectForge.</p>
        {submitted ? (
          <div className="text-green-600 dark:text-green-400 font-semibold">Thank you for your feedback!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={5}
              placeholder="Your feedback..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">Submit</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
