import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Users, MessageCircle, ThumbsUp, Send, Search, TrendingUp, Clock } from 'lucide-react';

export function CommunityPage() {
  const discussions = [
    {
      id: 1,
      user: 'Ahmed Khan',
      avatar: 'AK',
      topic: 'Tips for NUST NET preparation - Complete Guide 2024',
      category: 'Test Preparation',
      preview: 'I recently scored 145 in NUST NET and wanted to share some strategies that really helped me...',
      replies: 24,
      likes: 45,
      time: '1 hour ago',
      trending: true,
    },
    {
      id: 2,
      user: 'Sara Ali',
      avatar: 'SA',
      topic: 'Best engineering universities in Lahore - Need recommendations',
      category: 'Universities',
      preview: 'I am looking for good engineering universities in Lahore. My aggregate is around 82%...',
      replies: 18,
      likes: 32,
      time: '3 hours ago',
      trending: false,
    },
    {
      id: 3,
      user: 'Hassan Raza',
      avatar: 'HR',
      topic: 'Scholarship opportunities for FSc students - Complete List',
      category: 'Scholarships',
      preview: 'Here is a comprehensive list of scholarships available for FSc students in Pakistan...',
      replies: 31,
      likes: 67,
      time: '5 hours ago',
      trending: true,
    },
    {
      id: 4,
      user: 'Fatima Malik',
      avatar: 'FM',
      topic: 'LUMS vs NUST - Which one should I choose for CS?',
      category: 'Universities',
      preview: 'I got admission in both LUMS and NUST for Computer Science. Can someone help me decide...',
      replies: 42,
      likes: 89,
      time: '8 hours ago',
      trending: true,
    },
    {
      id: 5,
      user: 'Ali Imran',
      avatar: 'AI',
      topic: 'How to prepare for ECAT in 3 months?',
      category: 'Test Preparation',
      preview: 'I have 3 months left for ECAT and need a solid study plan. Any suggestions?',
      replies: 15,
      likes: 28,
      time: '12 hours ago',
      trending: false,
    },
    {
      id: 6,
      user: 'Zainab Ahmed',
      avatar: 'ZA',
      topic: 'Study abroad opportunities after FSc',
      category: 'Study Abroad',
      preview: 'What are the best countries and universities for Pakistani students looking to study abroad?',
      replies: 27,
      likes: 54,
      time: '1 day ago',
      trending: false,
    },
  ];

  const categories = [
    { name: 'All Topics', count: 234, active: true },
    { name: 'Test Preparation', count: 89, active: false },
    { name: 'Universities', count: 67, active: false },
    { name: 'Scholarships', count: 45, active: false },
    { name: 'Study Abroad', count: 33, active: false },
  ];

  return (
    <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-8 shadow-lg">
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
              <h3 className="mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      category.active
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.active ? 'bg-white/20' : 'bg-slate-300'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5 mt-6 bg-amber-50 border-amber-200">
              <h3 className="mb-3">Start a Discussion</h3>
              <p className="text-sm text-slate-600 mb-4">
                Have a question or want to share something? Start a new topic!
              </p>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all">
                <Send className="w-4 h-4 mr-2" />
                New Topic
              </Button>
            </Card>
          </motion.div>

          {/* Main Content - Discussions */}
          <div className="lg:col-span-3">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <Card className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </Card>
            </motion.div>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 text-white">
                        {discussion.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="line-clamp-1">{discussion.topic}</h3>
                              {discussion.trending && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
                                  <TrendingUp className="w-3 h-3" />
                                  <span className="text-xs">Trending</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                              <span>by {discussion.user}</span>
                              <span>•</span>
                              <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                                {discussion.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {discussion.preview}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 text-amber-600" />
                            <span>{discussion.replies} replies</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4 text-amber-600" />
                            <span>{discussion.likes} likes</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto">
                            <Clock className="w-4 h-4" />
                            <span>{discussion.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-6 text-center">
              <Button className="bg-slate-200 text-slate-700 hover:bg-slate-300">
                Load More Discussions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
