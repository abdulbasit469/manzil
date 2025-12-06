import { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, MessageSquare, Heart, Eye, Clock, Edit, Trash2, Send, Reply } from 'lucide-react'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { AuthContext } from '../context/AuthContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import './Community.css'

const PostDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { showSuccess, showError } = useNotification()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    fetchPost()
    fetchComments()
  }, [id])

  const fetchPost = async () => {
    try {
      const res = await api.get(`/api/community/posts/${id}`)
      if (res.data.success) {
        setPost(res.data.post)
        // Check if user has liked the post (likes array contains ObjectIds)
        const userLiked = res.data.post.likes?.some(likeId => 
          likeId.toString() === user?.id || likeId === user?.id
        ) || false
        setLiked(userLiked)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
      showError('Failed to load post')
      navigate('/community')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await api.get(`/api/community/posts/${id}/comments`)
      if (res.data.success) {
        setComments(res.data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async () => {
    try {
      const res = await api.post(`/api/community/posts/${id}/like`)
      if (res.data.success) {
        setLiked(res.data.isLiked)
        setPost(prev => ({ ...prev, likeCount: res.data.likeCount }))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentContent.trim()) {
      showError('Please enter a comment')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post(`/api/community/posts/${id}/comments`, {
        content: commentContent
      })
      
      if (res.data.success) {
        showSuccess('Comment added successfully!')
        setCommentContent('')
        fetchComments()
        fetchPost() // Update comment count
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      showError(error.response?.data?.message || 'Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentCommentId) => {
    if (!replyContent.trim()) {
      showError('Please enter a reply')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post(`/api/community/posts/${id}/comments`, {
        content: replyContent,
        parentCommentId
      })
      
      if (res.data.success) {
        showSuccess('Reply added successfully!')
        setReplyContent('')
        setReplyingTo(null)
        fetchComments()
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      showError(error.response?.data?.message || 'Failed to add reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const res = await api.delete(`/api/community/posts/${id}`)
      if (res.data.success) {
        showSuccess('Post deleted successfully')
        navigate('/community')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      showError(error.response?.data?.message || 'Failed to delete post')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

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
    const categories = {
      admissions: 'Admissions',
      hostel: 'Hostel Facilities',
      accommodation: 'Accommodation',
      'test-prep': 'Test Preparation',
      general: 'General Discussion'
    }
    return categories[category] || category
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

  if (loading) {
    return (
      <div className="community-container">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="community-container">
        <Card className="p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Post not found</h3>
          <Button onClick={() => navigate('/community')} className="mt-4">
            Back to Community
          </Button>
        </Card>
      </div>
    )
  }

  const isAuthor = post.author?._id?.toString() === user?.id || 
                   post.author?._id === user?.id || 
                   post.author?.toString() === user?.id ||
                   post.author === user?.id

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
            <button
              onClick={() => navigate('/community')}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Post Details</h1>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Post */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: getCategoryColor(post.category) }}
            >
              {getCategoryLabel(post.category)}
            </div>
            {isAuthor && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/community/post/${id}/edit`)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {post.isPinned && <span className="text-purple-600 mr-2">📌</span>}
            {post.title}
          </h2>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Media Display - Large Container */}
          {(post.images?.length > 0 || post.videos?.length > 0) && (
            <div className="mb-6">
              {/* Images */}
              {post.images?.length > 0 && (
                <div className={`grid gap-4 mb-4 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                  {post.images.map((image, idx) => {
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
                          className="w-full h-auto max-h-[70vh] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity mx-auto"
                          onClick={() => window.open(imageUrl, '_blank')}
                          onError={(e) => {
                            console.error('Image load error:', imageUrl);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Videos */}
              {post.videos?.length > 0 && (
                <div className="space-y-4">
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
                          className="w-full h-auto max-h-[70vh] rounded-lg mx-auto"
                          controls
                          preload="metadata"
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
          <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                {post.author?.profilePicture ? (
                  <AvatarImage src={post.author.profilePicture} alt={post.author?.name || 'User'} />
                ) : null}
                <AvatarFallback className="bg-purple-100 text-purple-600 text-sm">
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
              <MessageSquare className="w-4 h-4" />
              {post.commentCount || 0} comments
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {post.likeCount || 0} likes
            </button>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
            />
            <Button
              type="submit"
              disabled={submitting || !commentContent.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        {comment.author?.profilePicture ? (
                          <AvatarImage src={comment.author.profilePicture} alt={comment.author?.name || 'User'} />
                        ) : null}
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">{comment.author?.name || 'Anonymous'}</span>
                      <span className="text-sm text-gray-500 ml-2">{formatDate(comment.createdAt)}</span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400 ml-2">(edited)</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                      className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Reply className="w-4 h-4" />
                      Reply
                    </button>
                    <span className="text-gray-500">
                      {comment.likeCount || 0} likes
                    </span>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment._id && (
                    <div className="mt-3 ml-4">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSubmitReply(comment._id)}
                          disabled={submitting || !replyContent.trim()}
                          className="bg-purple-600 text-white text-sm"
                        >
                          Post Reply
                        </Button>
                        <Button
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                          className="bg-gray-200 text-gray-700 text-sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-4 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply._id} className="border-l-2 border-gray-100 pl-4">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                {reply.author?.profilePicture ? (
                                  <AvatarImage src={reply.author.profilePicture} alt={reply.author?.name || 'User'} />
                                ) : null}
                                <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                  {reply.author?.name ? reply.author.name.charAt(0).toUpperCase() : 'A'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900 text-sm">
                                {reply.author?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">{formatDate(reply.createdAt)}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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

export default PostDetail

