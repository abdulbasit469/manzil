import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface CreatePostPageProps {
  onBack: () => void;
  onPostCreated: () => void;
}

export function CreatePostPage({ onBack, onPostCreated }: CreatePostPageProps) {
  const { isAuthenticated } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Test Preparation');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['Test Preparation', 'Universities', 'Scholarships', 'Admissions', 'General'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to create a post');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/community/posts', {
        title: title.trim(),
        content: content.trim(),
        category
      });

      if (response.data.success) {
        // Show different message based on status
        if (response.data.status === 'pending') {
          toast.success('Post created! It is now waiting for admin approval.');
        } else {
          toast.success('Post created and approved successfully!');
        }
        setTitle('');
        setContent('');
        setCategory('Test Preparation');
        onPostCreated();
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create post';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-3xl mx-auto p-8">
          <Card className="p-8 text-center">
            <p className="text-slate-600 mb-4">Please login to create a post</p>
            <Button onClick={onBack}>Back to Community</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-3xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
          <h1 className="text-3xl font-bold">Create New Discussion</h1>
          <p className="text-slate-600 mt-2">
            Share your thoughts, ask questions, or start a conversation
          </p>
        </div>

        {/* Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a clear and descriptive title..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={200}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Content <span className="text-red-600">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or provide information..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[300px]"
                maxLength={5000}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                {content.length}/5000 characters
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Create Discussion
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

