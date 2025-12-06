import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Send, Image, Video, X } from 'lucide-react'
import api from '../services/api'
import { useNotification } from '../context/NotificationContext'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import './Community.css'

const CreatePost = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedVideos, setSelectedVideos] = useState([])

  const categories = [
    { value: 'admissions', label: 'Admissions' },
    { value: 'hostel', label: 'Hostel Facilities' },
    { value: 'accommodation', label: 'Accommodation' },
    { value: 'test-prep', label: 'Test Preparation' },
    { value: 'general', label: 'General Discussion' }
  ]

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (selectedImages.length + imageFiles.length > 10) {
      showError('Maximum 10 images allowed')
      return
    }

    // Create preview URLs
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImages(prev => [...prev, {
          file,
          preview: e.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files)
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    
    if (selectedVideos.length + videoFiles.length > 5) {
      showError('Maximum 5 videos allowed')
      return
    }

    // Create preview URLs
    videoFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedVideos(prev => [...prev, {
          file,
          preview: e.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeVideo = (index) => {
    setSelectedVideos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      showError('Please enter a title')
      return
    }

    if (!formData.content.trim() && selectedImages.length === 0 && selectedVideos.length === 0) {
      showError('Please enter post content or add media')
      return
    }

    if (formData.content.trim().length > 0 && formData.content.trim().length < 10) {
      showError('Post content must be at least 10 characters')
      return
    }

    try {
      setLoading(true)
      
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('content', formData.content)
      submitData.append('category', formData.category)

      // Append images
      selectedImages.forEach((item, index) => {
        submitData.append('images', item.file)
      })

      // Append videos
      selectedVideos.forEach((item, index) => {
        submitData.append('videos', item.file)
      })

      const res = await api.post('/api/community/posts', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (res.data.success) {
        showSuccess('Post created successfully!')
        navigate(`/community/post/${res.data.post._id}`)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      showError(error.response?.data?.message || 'Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
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
            <button
              onClick={() => navigate('/community')}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-white">Create New Post</h1>
          </div>
          <p className="text-white/90">
            Share your question or experience with the community
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear, descriptive title..."
                maxLength={200}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content {selectedImages.length === 0 && selectedVideos.length === 0 && '*'}
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your question, experience, or thoughts..."
                rows={12}
                maxLength={5000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.content.length}/5000 characters {selectedImages.length === 0 && selectedVideos.length === 0 && '(minimum 10)'}
              </p>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Max 10, 10MB each)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Image className="w-5 h-5 text-purple-600" />
                    <span>Add Images</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedImages.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedImages.length} image(s) selected
                    </span>
                  )}
                </div>
                {selectedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedImages.map((item, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={item.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Videos (Max 5, 100MB each)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Video className="w-5 h-5 text-purple-600" />
                    <span>Add Videos</span>
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedVideos.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedVideos.length} video(s) selected
                    </span>
                  )}
                </div>
                {selectedVideos.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedVideos.map((item, index) => (
                      <div key={index} className="relative group">
                        <video
                          src={item.preview}
                          className="w-full h-48 object-cover rounded-lg border border-gray-300"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeVideo(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate('/community')}
                className="flex-1 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default CreatePost

