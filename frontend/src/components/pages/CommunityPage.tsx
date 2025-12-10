import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, ThumbsUp, Send, Search, TrendingUp, Clock, Loader2, Trash2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  views: number;
  likes: string[];
  commentCount: number;
  likeCount: number;
  createdAt: string;
  isPinned?: boolean;
}

interface Category {
  name: string;
  count: number;
}

interface CommunityPageProps {
  onNavigateToPost?: (postId: string) => void;
  onNavigateToNewPost?: () => void;
}

export function CommunityPage({ onNavigateToPost, onNavigateToNewPost }: CommunityPageProps = {}) {
  const { isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [approvedPostsToRemove, setApprovedPostsToRemove] = useState<Set<string>>(new Set());

  // Fetch category statistics
  const fetchCategories = async () => {
    try {
      const response = await api.get('/community/categories/stats');
      if (response.data.success) {
        const categoryList = [
          { name: 'All Topics', count: response.data.total },
          ...response.data.categories
        ];
        setCategories(categoryList);
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch posts
  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: pageNum,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (selectedCategory !== 'All Topics') {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await api.get('/community/posts', { params });

      if (response.data.success) {
        const newPosts = response.data.posts.map((post: any) => ({
          ...post,
          commentCount: post.commentCount || 0,
          likeCount: post.likeCount || (post.likes?.length || 0),
          isLiked: isAuthenticated && post.likes?.includes
        }));

        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }

        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);

        // Update liked posts set - check if current user liked each post
        if (isAuthenticated && user) {
          const liked = new Set<string>();
          newPosts.forEach((post: any) => {
            if (post.likes && Array.isArray(post.likes) && post.likes.includes(user._id)) {
              liked.add(post._id);
            }
          });
          if (append) {
            // Merge with existing liked posts
            setLikedPosts(prev => new Set([...prev, ...liked]));
          } else {
            setLikedPosts(liked);
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Handle like/unlike
  const handleLike = async (postId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking like button
    }

    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      if (response.data.success) {
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post._id === postId) {
              const newLikedPosts = new Set(likedPosts);
              if (response.data.isLiked) {
                newLikedPosts.add(postId);
              } else {
                newLikedPosts.delete(postId);
              }
              setLikedPosts(newLikedPosts);

              return {
                ...post,
                likeCount: response.data.likeCount
              };
            }
            return post;
          })
        );
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      const errorMessage = error.response?.data?.message || 'Failed to like post';
      toast.error(errorMessage);
    }
  };

  // Check if post is liked by current user
  const isPostLiked = (post: Post): boolean => {
    return likedPosts.has(post._id);
  };

  // Check if current user is the author of the post
  const isPostAuthor = (post: Post): boolean => {
    return isAuthenticated && user && post.author?._id === user._id;
  };

  // Handle delete post
  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click

    if (!isAuthenticated) {
      toast.error('Please login to delete posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/community/posts/${postId}`);
      if (response.data.success) {
        toast.success('Post deleted successfully');
        // Remove post from list
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        // Refresh categories to update counts
        fetchCategories();
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete post';
      toast.error(errorMessage);
    }
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format time ago
  const formatTimeAgo = (date: string): string => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Check if post is trending (has more than 20 likes or 15 comments)
  const isTrending = (post: Post): boolean => {
    return (post.likeCount || 0) > 20 || (post.commentCount || 0) > 15;
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPosts(1, false);
  };

  // Expose refresh function via useEffect dependency on search/category
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchPosts(1, false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
    fetchPosts(1, false);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1, true);
    }
  };

  // Fetch pending posts for current user
  const fetchPendingPosts = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingPending(true);
      const response = await api.get('/community/posts/pending/my-posts');
      if (response.data.success) {
        const postsWithCounts = response.data.posts.map((post: any) => ({
          ...post,
          commentCount: post.commentCount || 0,
          likeCount: post.likeCount || (post.likes?.length || 0)
        }));
        setPendingPosts(postsWithCounts);
      }
    } catch (error: any) {
      console.error('Error fetching pending posts:', error);
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch pending posts on mount and when refreshKey changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingPosts();
      
      // Poll for status updates every 5 seconds
      const interval = setInterval(() => {
        fetchPendingPosts();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, refreshKey]);

  // Remove approved posts from review section after 30 seconds
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    pendingPosts.forEach(post => {
      if (post.status === 'approved' && !approvedPostsToRemove.has(post._id)) {
        const timeout = setTimeout(() => {
          setPendingPosts(prev => prev.filter(p => p._id !== post._id));
          setApprovedPostsToRemove(prev => {
            const newSet = new Set(prev);
            newSet.delete(post._id);
            return newSet;
          });
        }, 30000); // 30 seconds
        
        timeouts.push(timeout);
        setApprovedPostsToRemove(prev => new Set(prev).add(post._id));
      }
    });
    
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [pendingPosts, approvedPostsToRemove]);

  // Initial load and refetch when refreshKey changes
  useEffect(() => {
    fetchCategories();
    fetchPosts(1, false);
  }, [refreshKey]);

  // Refetch when category or search changes
  useEffect(() => {
    if (page === 1) {
      fetchPosts(1, false);
    } else {
      setPage(1);
    }
  }, [selectedCategory]);

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl mb-2">Community Forum</h1>
            <p className="text-blue-100">
              Connect with peers, share experiences, and get help from the community
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5">
              <h3 className="mb-4 font-semibold">Categories</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      selectedCategory === category.name
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedCategory === category.name ? 'bg-white/20' : 'bg-slate-300'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Main Content - Discussions */}
          <div className="lg:col-span-3">
            {/* Search and New Post Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex gap-3 items-center">
                {/* Search Bar */}
                <div className="flex-1">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                      <input
                        type="text"
                        placeholder="Search discussions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </form>
                </div>
                {/* New Post Button */}
                <Button
                  onClick={() => {
                    if (onNavigateToNewPost) {
                      onNavigateToNewPost();
                    } else {
                      // If callback not provided, trigger refresh
                      setRefreshKey(prev => prev + 1);
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all whitespace-nowrap"
                >
                  <Send className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </div>
            </motion.div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            )}

            {/* Discussions List */}
            {!loading && (
            <div className="space-y-4">
                {posts.length === 0 ? (
                  <Card className="p-12 text-center">
                    <p className="text-slate-600">No discussions found. Be the first to start one!</p>
                    <Button
                      onClick={() => {
                        if (onNavigateToNewPost) {
                          onNavigateToNewPost();
                        }
                      }}
                      className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Create First Discussion
                    </Button>
                  </Card>
                ) : (
                  posts.map((post, index) => (
                <motion.div
                      key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                >
                      <Card
                        className="p-6 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => {
                          if (onNavigateToPost) {
                            onNavigateToPost(post._id);
                          }
                        }}
                      >
                    <div className="flex items-start gap-4">
                          {post.author?.profilePicture ? (
                            <img
                              src={post.author.profilePicture}
                              alt={post.author.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
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
                            className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 text-white font-semibold ${post.author?.profilePicture ? 'hidden' : ''}`}
                          >
                            {getInitials(post.author?.name || 'U')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-lg line-clamp-1">{post.title}</h3>
                                  {isTrending(post) && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
                                  <TrendingUp className="w-3 h-3" />
                                  <span className="text-xs">Trending</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                                  <span>by {post.author?.name || 'Anonymous'}</span>
                              <span>•</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                                    {post.category}
                              </span>
                            </div>
                          </div>
                          {isPostAuthor(post) && (
                            <button
                              onClick={(e) => handleDeletePost(post._id, e)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                              title="Delete post"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                              {post.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                              <button
                                onClick={(e) => handleLike(post._id, e)}
                                className={`flex items-center gap-1 hover:text-amber-600 transition-colors ${
                                  isPostLiked(post) ? 'text-amber-600' : ''
                                }`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${isPostLiked(post) ? 'fill-current' : ''}`} />
                                <span>{post.likeCount || 0}</span>
                              </button>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-amber-600" />
                                <span>{post.commentCount || 0} replies</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
                  ))
                )}
            </div>
            )}

            {/* Load More */}
            {!loading && posts.length > 0 && hasMore && (
            <div className="mt-6 text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Discussions'
                  )}
              </Button>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
