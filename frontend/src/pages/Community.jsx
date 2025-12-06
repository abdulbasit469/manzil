import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { MessageSquare, Plus, Search, Filter, Eye, MessageCircle, Heart, Clock, Trash2 } from 'lucide-react'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import './Community.css'

const Community = () => {
  const navigate = useNavigate()
  const { showError, showSuccess } = useNotification()
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postIdToDelete, setPostIdToDelete] = useState(null)

  const categories = [
    { value: 'all', label: 'All Topics' },
    { value: 'admissions', label: 'Admissions' },
    { value: 'hostel', label: 'Hostel Facilities' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'test-prep', label: 'Test Preparation' },
    { value: 'general', label: 'General Discussion' }
  ]

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 10,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        sortBy,
        sortOrder: 'desc'
      }

      const res = await api.get('/api/community/posts', { params })
      if (res.data.success) {
        setPosts(res.data.posts)
        setTotalPages(res.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      showError('Failed to load posts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page, selectedCategory, sortBy])

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchPosts()
      } else {
        setPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getCategoryLabel = (category) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getCategoryColor = (category) => {
    const colors = {
      admissions: '#9333ea',
      hostel: '#3b82f6',
      accommodation: '#10b981',
      'test-prep': '#f59e0b',
      general: '#6b7280'
    }
    return colors[category] || '#6b7280'
  }

  const handleDeleteClick = (postId, e) => {
    e.stopPropagation() // Prevent navigation to post detail
    setPostIdToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postIdToDelete) return

    try {
      const res = await api.delete(`/api/community/posts/${postIdToDelete}`)
      if (res.data.success) {
        showSuccess('Post deleted successfully')
        // Refresh posts list
        fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      showError(error.response?.data?.message || 'Failed to delete post. Please try again.')
    } finally {
      setDeleteDialogOpen(false)
      setPostIdToDelete(null)
    }
  }

  const isPostAuthor = (post) => {
    return user && post.author && (post.author._id === user._id || post.author === user._id)
  }

  return (
    <div className="community-container">
      {/* Header */}
      <div className="community-header">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          </div>
          <p className="text-gray-600">
            Connect with fellow students, ask questions, and share experiences
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="createdAt">Newest First</option>
            <option value="views">Most Viewed</option>
            <option value="likes">Most Liked</option>
          </select>

          {/* Create Post Button */}
          <Button
            onClick={() => navigate('/community/create')}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => {
                setSelectedCategory(category.value)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.value
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Be the first to start a discussion!'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => navigate('/community/create')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                Create First Post
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/community/post/${post._id}`)}
                >
                  <div className="flex items-start gap-4">
                    {/* Category Badge and Delete Button */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: getCategoryColor(post.category) }}
                      >
                        {getCategoryLabel(post.category)}
                      </div>
                      {isPostAuthor(post) && (
                        <button
                          onClick={(e) => handleDeleteClick(post._id, e)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                        {post.isPinned && <span className="text-purple-600 mr-2">📌</span>}
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Media Preview - Large Display */}
                      {(post.images?.length > 0 || post.videos?.length > 0) && (
                        <div className="mb-4">
                          {post.images?.length > 0 && (
                            <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                              {post.images.slice(0, 3).map((image, idx) => {
                                // Handle both base64 data URLs and file paths
                                let imageUrl;
                                if (image.startsWith('data:')) {
                                  imageUrl = image;
                                } else if (image.startsWith('/uploads')) {
                                  imageUrl = `http://localhost:5000${image}`;
                                } else {
                                  imageUrl = `http://localhost:5000/uploads/images/${image}`;
                                }
                                return (
                                  <div key={idx} className="w-full overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                      src={imageUrl}
                                      alt={`Post image ${idx + 1}`}
                                      className="w-full h-auto min-h-[300px] max-h-[500px] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(imageUrl, '_blank');
                                      }}
                                      onError={(e) => {
                                        console.error('Image load error:', imageUrl);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                              {post.images.length > 3 && (
                                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                                  {(() => {
                                    let imageUrl;
                                    if (post.images[3].startsWith('data:')) {
                                      imageUrl = post.images[3];
                                    } else if (post.images[3].startsWith('/uploads')) {
                                      imageUrl = `http://localhost:5000${post.images[3]}`;
                                    } else {
                                      imageUrl = `http://localhost:5000/uploads/images/${post.images[3]}`;
                                    }
                                    return (
                                      <>
                                        <img
                                          src={imageUrl}
                                          alt="More images"
                                          className="w-full h-auto min-h-[300px] max-h-[500px] object-contain rounded-lg opacity-60"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/community/post/${post._id}`);
                                          }}
                                          onError={(e) => {
                                            console.error('Image load error:', imageUrl);
                                          }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/community/post/${post._id}`);
                                          }}
                                        >
                                          <span className="text-white font-bold text-lg">+{post.images.length - 3}</span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                          {post.videos?.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {post.videos.map((video, idx) => {
                                let videoUrl;
                                if (video.startsWith('data:')) {
                                  videoUrl = video;
                                } else if (video.startsWith('/uploads')) {
                                  videoUrl = `http://localhost:5000${video}`;
                                } else {
                                  videoUrl = `http://localhost:5000/uploads/videos/${video}`;
                                }
                                return (
                                  <div key={idx} className="w-full overflow-hidden rounded-lg bg-gray-100">
                                    <video
                                      src={videoUrl}
                                      className="w-full h-auto min-h-[300px] max-h-[500px] object-contain rounded-lg"
                                      controls
                                      onClick={(e) => e.stopPropagation()}
                                      onError={(e) => {
                                        console.error('Video load error:', videoUrl);
                                      }}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Post Meta */}
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            {post.author?.profilePicture ? (
                              <AvatarImage src={post.author.profilePicture} alt={post.author?.name || 'User'} />
                            ) : null}
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                              {post.author?.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-700">{post.author?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(post.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views || 0} views
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.commentCount || 0} comments
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likeCount || 0} likes
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setPostIdToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message="Are you sure you want to delete it?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default Community

