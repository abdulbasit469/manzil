import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft, ThumbsUp, MessageCircle, Send, Clock, Loader2, Trash2 } from 'lucide-react';
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
  updatedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  likes: string[];
  likeCount: number;
  createdAt: string;
  isEdited: boolean;
  replies?: Comment[];
}

export function PostDetailPage({ postId, onBack }: { postId: string; onBack: () => void }) {
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const fetchPost = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const response = await api.get(`/community/posts/${postId}`);
      if (response.data.success) {
        const fetchedPost = response.data.post;
        setPost(fetchedPost);
        
        // Initialize liked state if user is authenticated
        if (isAuthenticated && user && fetchedPost.likes) {
          const isLiked = fetchedPost.likes.includes(user._id);
          const newLikedPosts = new Set(likedPosts);
          if (isLiked) {
            newLikedPosts.add(postId);
          } else {
            newLikedPosts.delete(postId);
          }
          setLikedPosts(newLikedPosts);
        }
      }
    } catch (error: any) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      return;
    }

    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      if (response.data.success) {
        const newLikedPosts = new Set(likedPosts);
        if (response.data.isLiked) {
          newLikedPosts.add(postId);
        } else {
          newLikedPosts.delete(postId);
        }
        setLikedPosts(newLikedPosts);

        if (post) {
          setPost({
            ...post,
            likeCount: response.data.likeCount
          });
        }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      const errorMessage = error.response?.data?.message || 'Failed to like post';
      toast.error(errorMessage);
    }
  };

  const handleDeletePost = async () => {
    if (!isAuthenticated || !post) {
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/community/posts/${postId}`);
      if (response.data.success) {
        toast.success('Post deleted successfully');
        // Redirect back to community page
        setTimeout(() => {
          onBack();
        }, 500);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete post';
      toast.error(errorMessage);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to like comments');
      return;
    }

    try {
      const response = await api.post(`/community/comments/${commentId}/like`);
      if (response.data.success) {
        const newLikedComments = new Set(likedComments);
        if (response.data.isLiked) {
          newLikedComments.add(commentId);
        } else {
          newLikedComments.delete(commentId);
        }
        setLikedComments(newLikedComments);

        setComments(prevComments =>
          updateCommentLikes(prevComments, commentId, response.data.likeCount)
        );
      }
    } catch (error: any) {
      console.error('Error toggling comment like:', error);
      toast.error('Failed to like comment');
    }
  };

  const updateCommentLikes = (comments: Comment[], commentId: string, likeCount: number): Comment[] => {
    return comments.map(comment => {
      if (comment._id === commentId) {
        return { ...comment, likeCount };
      }
      if (comment.replies) {
        return { ...comment, replies: updateCommentLikes(comment.replies, commentId, likeCount) };
      }
      return comment;
    });
  };

  const handleSubmitComment = async (e: React.FormEvent, parentCommentId?: string) => {
    e.preventDefault();
    if (!commentContent.trim() || !postId) return;

    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post(`/community/posts/${postId}/comments`, {
        content: commentContent,
        parentCommentId
      });

      if (response.data.success) {
        setCommentContent('');
        toast.success('Comment posted successfully');
        fetchComments();
        if (post) {
          setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
        }
        // Redirect to community page after a short delay
        setTimeout(() => {
          onBack();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (date: string): string => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost();
      fetchComments();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex-1 overflow-auto bg-slate-50">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="p-8 text-center">
            <p className="text-slate-600">Post not found</p>
            <Button onClick={onBack} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isAuthor = user?._id === post.author._id;

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Back Button */}
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Community
        </Button>

        {/* Post */}
        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {post.author?.profilePicture ? (
                <img
                  src={post.author.profilePicture}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
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
                className={`w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold ${post.author?.profilePicture ? 'hidden' : ''}`}
              >
                {getInitials(post.author?.name || 'U')}
              </div>
              <div>
                <p className="font-semibold">{post.author?.name || 'Anonymous'}</p>
                <p className="text-sm text-slate-500">
                  {formatTimeAgo(post.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                {post.category}
              </span>
              {isAuthor && (
                <button
                  onClick={handleDeletePost}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                  title="Delete post"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="prose max-w-none mb-6">
            <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          <div className="flex items-center gap-6 pt-4 border-t">
            <button
              onClick={() => handleLike(post._id)}
              className={`flex items-center gap-2 hover:text-amber-600 transition-colors ${
                likedPosts.has(post._id) ? 'text-amber-600' : 'text-slate-600'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${likedPosts.has(post._id) ? 'fill-current' : ''}`} />
              <span>{post.likeCount || 0}</span>
            </button>
            <div className="flex items-center gap-2 text-slate-600">
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentCount || 0} comments</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 ml-auto">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{post.views} views</span>
            </div>
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Comments ({post.commentCount || 0})</h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={(e) => handleSubmitComment(e)} className="mb-6">
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-3"
                rows={3}
              />
              <Button
                type="submit"
                disabled={!commentContent.trim() || submitting}
                className="bg-gradient-to-r from-amber-500 to-amber-600"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg text-center">
              <p className="text-slate-600 mb-2">Please login to comment</p>
              <Button onClick={onBack}>
                Back to Community
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onLike={handleCommentLike}
                  onSubmitReply={(e, content) => handleSubmitComment(e, comment._id)}
                  isLiked={likedComments.has(comment._id)}
                  getInitials={getInitials}
                  formatTimeAgo={formatTimeAgo}
                  isAuthenticated={isAuthenticated}
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  onLike,
  onSubmitReply,
  isLiked,
  getInitials,
  formatTimeAgo,
  isAuthenticated
}: {
  comment: Comment;
  onLike: (id: string) => void;
  onSubmitReply: (e: React.FormEvent, content: string) => void;
  isLiked: boolean;
  getInitials: (name: string) => string;
  formatTimeAgo: (date: string) => string;
  isAuthenticated: boolean;
}) {
  const [replyContent, setReplyContent] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <div className="border-l-2 border-slate-200 pl-4">
      <div className="flex items-start gap-3 mb-2">
        {comment.author?.profilePicture ? (
          <img
            src={comment.author.profilePicture}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full object-cover border-2 border-amber-200 flex-shrink-0"
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
          className={`w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${comment.author?.profilePicture ? 'hidden' : ''}`}
        >
          {getInitials(comment.author?.name || 'U')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">{comment.author?.name || 'Anonymous'}</span>
            <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
            {comment.isEdited && <span className="text-xs text-slate-400">(edited)</span>}
          </div>
          <p className="text-slate-700 mb-2">{comment.content}</p>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 hover:text-amber-600 transition-colors ${
                isLiked ? 'text-amber-600' : 'text-slate-600'
              }`}
              disabled={!isAuthenticated}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{comment.likeCount || 0}</span>
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-slate-600 hover:text-amber-600"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && (
        <form
          onSubmit={(e) => {
            onSubmitReply(e, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
          }}
          className="mt-2 mb-4"
        >
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
            rows={2}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!replyContent.trim()}
              className="bg-amber-600"
            >
              Reply
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowReplyForm(false);
                setReplyContent('');
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-6 mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onSubmitReply={onSubmitReply}
              isLiked={false}
              getInitials={getInitials}
              formatTimeAgo={formatTimeAgo}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

