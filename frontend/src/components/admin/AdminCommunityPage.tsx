import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, MessageSquare, ThumbsUp, Eye, Flag, Trash2, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    _id: string;
    name: string;
    email?: string;
    profilePicture?: string;
  };
  likeCount: number;
  commentCount: number;
  views: number;
  createdAt: string;
  status?: string;
}

export function AdminCommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalComments: 0,
    pending: 0,
    todayPosts: 0
  });
  const [showPendingPage, setShowPendingPage] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/community/posts', {
        params: {
          page,
          limit,
          search: searchQuery || undefined
        }
      });
      if (response.data.success) {
        setPosts(response.data.posts || []);
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get stats from admin stats endpoint
      const statsResponse = await api.get('/admin/stats');
      const categoryResponse = await api.get('/community/categories/stats');
      
      if (statsResponse.data.success) {
        const totalPosts = statsResponse.data.stats.posts || 0;
        const totalComments = statsResponse.data.stats.comments || 0;
        const todayPosts = statsResponse.data.stats.todayPosts || 0;
        const pendingPosts = statsResponse.data.stats.pendingPosts || 0;
        
        setStats(prev => ({
          ...prev,
          total: totalPosts,
          totalComments: totalComments,
          todayPosts: todayPosts,
          pending: pendingPosts
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Debounce search query - reset to page 1 when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    fetchPosts();
    fetchStats();
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Scroll to top when component mounts or pending page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [showPendingPage]);

  // Refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts();
      fetchStats();
    }, 30000);
    return () => clearInterval(interval);
  }, [page, searchQuery]);

  const fetchPendingPosts = async () => {
    try {
      setPendingLoading(true);
      const response = await api.get('/admin/pending-posts', {
        params: {
          page: pendingPage,
          limit: 10
        }
      });
      if (response.data.success) {
        setPendingPosts(response.data.posts || []);
        setPendingTotal(response.data.pagination?.total || 0);
        setPendingTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error: any) {
      console.error('Error fetching pending posts:', error);
      toast.error('Failed to load pending posts');
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    if (showPendingPage) {
      fetchPendingPosts();
      fetchStats();
    }
  }, [showPendingPage, pendingPage]);

  // Auto-refresh pending posts every 10 seconds when on pending page for real-time updates
  useEffect(() => {
    if (!showPendingPage) return;
    
    const interval = setInterval(() => {
      fetchPendingPosts();
      fetchStats();
    }, 10000); // Refresh every 10 seconds for real-time updates
    
    return () => clearInterval(interval);
  }, [showPendingPage, pendingPage]);

  const handleApprove = async (postId: string) => {
    try {
      const response = await api.put(`/admin/posts/${postId}/approve`);
      if (response.data.success) {
        toast.success('Post approved successfully! Student has been notified.');
        // Refresh pending posts and stats immediately
        await fetchPendingPosts();
        await fetchStats();
      }
    } catch (error: any) {
      console.error('Error approving post:', error);
      toast.error(error.response?.data?.message || 'Failed to approve post');
    }
  };

  const handleReject = async (postId: string) => {
    if (!window.confirm('Are you sure you want to reject this post? The student will be notified.')) {
      return;
    }
    try {
      await api.put(`/admin/posts/${postId}/reject`);
      toast.success('Post rejected and student notified');
      // Refresh pending posts and stats
      fetchPendingPosts();
      fetchStats();
    } catch (error: any) {
      console.error('Error rejecting post:', error);
      toast.error(error.response?.data?.message || 'Failed to reject post');
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    try {
      await api.delete(`/community/posts/${postId}`);
      toast.success('Post deleted successfully');
      fetchPosts();
      fetchStats();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };


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

  // If showing pending page, render that instead
  if (showPendingPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pending Posts</h1>
          <Button
            onClick={() => setShowPendingPage(false)}
            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Back to Community
          </Button>
        </div>

        {pendingLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <p className="text-slate-600">No pending posts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {post.author?.profilePicture ? (
                    <>
                      <img
                        src={post.author.profilePicture}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-green-200 flex-shrink-0"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 hidden">
                        {getInitials(post.author?.name || 'U')}
                      </div>
                    </>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                      {getInitials(post.author?.name || 'U')}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg mb-1">{post.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="font-medium">{post.author.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 mb-4">{post.content}</p>

                    <div className="flex items-center justify-between flex-wrap gap-4 mt-4">
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likeCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.commentCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleApprove(post._id)}
                          className="bg-white border border-green-500 text-green-600 hover:bg-green-50 text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleReject(post._id)}
                          className="bg-white border border-red-500 text-red-600 hover:bg-red-50 text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <X className="w-4 h-4 text-red-600" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination for pending posts */}
        {!pendingLoading && pendingPosts.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing <span className="font-medium">{(pendingPage - 1) * 10 + 1}-{Math.min(pendingPage * 10, pendingTotal)}</span> of <span className="font-medium">{pendingTotal.toLocaleString()}</span> pending posts
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                disabled={pendingPage === 1}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <Button 
                onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                disabled={pendingPage >= pendingTotalPages}
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

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
          <div className="text-3xl text-green-600 mb-2">{stats.total.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Total Posts</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-blue-600 mb-2">{stats.totalComments.toLocaleString()}</div>
          <div className="text-slate-600 text-sm">Total Comments</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setShowPendingPage(true)}
        >
          <div className="text-3xl text-amber-600 mb-2">{stats.pending}</div>
          <div className="text-slate-600 text-sm">Pending Review</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="text-3xl text-red-600 mb-2">{stats.todayPosts}</div>
          <div className="text-slate-600 text-sm">Today Posts</div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-slate-600">No posts found</p>
        </div>
      ) : (
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
              key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
                {post.author?.profilePicture ? (
                  <img
                    src={post.author.profilePicture}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-200 flex-shrink-0"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white flex-shrink-0 ${post.author?.profilePicture ? 'hidden' : ''}`}
                >
                  {getInitials(post.author.name)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg">{post.title}</h3>
                        {post.status && getStatusBadge(post.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="font-medium">{post.author.name}</span>
                      <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>
                  </div>
                </div>

                  <p className="text-slate-600 mb-4 line-clamp-2">{post.content}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4" />
                        <span>{post.likeCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                        <span>{post.views || 0}</span>
                      </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <Button 
                        onClick={() => handleDelete(post._id)}
                        className="bg-white border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2"
                      >
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
      )}

      {/* Pagination */}
      {!loading && posts.length > 0 && (
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
            Showing <span className="font-medium">{(page - 1) * limit + 1}-{Math.min(page * limit, total)}</span> of <span className="font-medium">{total.toLocaleString()}</span> posts
        </div>
        <div className="flex gap-2">
            <Button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Previous
          </Button>
            <Button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            Next
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
