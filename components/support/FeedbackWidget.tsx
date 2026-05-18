// components/support/FeedbackWidget.tsx
import { FC, useState } from 'react';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

const FeedbackWidget: FC = () => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
  };

  const handleSubmit = async () => {
    if (!feedback) return;

    setIsSubmitting(true);
    
    // Simulate API call to submit feedback
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, you would send this to your backend
    console.log('Feedback submitted:', { 
      type: feedback, 
      comment, 
      url: window.location.pathname 
    });
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
        <p className="text-green-800 text-sm text-center">
          Thank you for your feedback! We appreciate your input.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
      <h3 className="text-center text-gray-700 font-medium mb-4">Was this article helpful?</h3>
      
      <div className="flex justify-center space-x-6 mb-4">
        <button 
          onClick={() => handleFeedback('positive')}
          className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
            feedback === 'positive' 
              ? 'bg-green-100 text-green-700' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          <span className="text-sm">Yes</span>
        </button>
        
        <button 
          onClick={() => handleFeedback('negative')}
          className={`flex flex-col items-center space-y-2 p-3 rounded-lg transition-colors ${
            feedback === 'negative' 
              ? 'bg-red-100 text-red-700' 
              : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <ThumbsDown className="h-5 w-5" />
          <span className="text-sm">No</span>
        </button>
      </div>
      
      {feedback && (
        <div className="mt-4 animate-fadeIn">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            rows={3}
            placeholder={feedback === 'positive' 
              ? "What did you find most helpful?" 
              : "How can we improve this article?"}
          ></textarea>
          
          <div className="flex justify-end mt-3">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  Submit feedback
                  <Send className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackWidget;