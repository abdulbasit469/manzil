import { motion } from 'motion/react';
import { Search, Filter, MessageSquare, ThumbsUp, Eye, Flag, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

export function AdminCommunityPage() {
  const posts = [
    {
      id: 1,
      author: 'Ahmed Khan',
      avatar: 'AK',
      title: 'How to prepare for NUST NET?',
      content: 'I need advice on preparing for the NUST NET exam. What resources should I use?',
      category: 'Entrance Tests',
      likes: 24,
      comments: 12,
      views: 342,
      timestamp: '2 hours ago',
      status: 'approved',
    },
    {
      id: 2,
      author: 'Ayesha Ali',
      avatar: 'AA',
      title: 'LUMS vs NUST for Computer Science?',
      content: 'Need help deciding between LUMS and NUST for CS. What are the pros and cons?',
      category: 'University Comparison',
      likes: 45,
      comments: 28,
      views: 856,
      timestamp: '5 hours ago',
      status: 'approved',
    },
    {
      id: 3,
      author: 'Hassan Ahmed',
      avatar: 'HA',
      title: 'Scholarship opportunities for engineering students',
      content: 'Looking for information about scholarships available for engineering students in Pakistan...',
      category: 'Scholarships',
      likes: 67,
      comments: 34,
      views: 1245,
      timestamp: '1 day ago',
      status: 'approved',
    },
    {
      id: 4,
      author: 'Fatima Malik',
      avatar: 'FM',
      title: 'Best universities for MBA in Pakistan',
      content: 'Can someone recommend the best business schools in Pakistan for MBA?',
      category: 'Career Advice',
      likes: 32,
      comments: 18,
      views: 567,
      timestamp: '2 days ago',
      status: 'pending',
    },
    {
      id: 5,
      author: 'Ali Raza',
      avatar: 'AR',
      title: 'ECAT preparation tips and tricks',
      content: 'Sharing my experience and tips for ECAT preparation. Hope this helps!',
      category: 'Entrance Tests',
      likes: 89,
      comments: 45,
      views: 2134,
      timestamp: '3 days ago',
      status: 'flagged',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Entrance Tests': 'bg-blue-100 text-blue-700',
      'University Comparison': 'bg-purple-100 text-purple-700',
      'Scholarships': 'bg-green-100 text-green-700',
      'Career Advice': 'bg-amber-100 text-amber-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  const getStatusBadge = (status: string) => {
    if (status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-100 text-amber-700">
          Pending
        </span>
      );
    } else if (status === 'flagged') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-100 text-red-700">
          <Flag className="w-3 h-3" />
          Flagged
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">Community Management</h2>
          <p className="text-slate-600">Monitor and moderate community posts and discussions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-green-600 mb-2">3,842</div>
          <div className="text-slate-600 text-sm">Total Posts</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">12,453</div>
          <div className="text-slate-600 text-sm">Total Comments</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-amber-600 mb-2">23</div>
          <div className="text-slate-600 text-sm">Pending Review</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-red-600 mb-2">7</div>
          <div className="text-slate-600 text-sm">Flagged Posts</div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts by title, author, or category..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                {post.avatar}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg">{post.title}</h3>
                      {getStatusBadge(post.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="font-medium">{post.author}</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">{post.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status === 'pending' && (
                      <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg text-sm px-4 py-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    {post.status === 'flagged' && (
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg text-sm px-4 py-2">
                        Review
                      </Button>
                    )}
                    <Button className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing <span className="font-medium">1-5</span> of <span className="font-medium">3,842</span> posts
        </div>
        <div className="flex gap-2">
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            Previous
          </Button>
          <Button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
