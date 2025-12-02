import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  User,
  Briefcase,
  GraduationCap,
  Calculator,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  FileText,
  Users,
  MessageCircle
} from 'lucide-react';

interface DashboardContentProps {
  sidebarOpen: boolean;
}

export function DashboardContent({ sidebarOpen }: DashboardContentProps) {
  const userName = "Taha Iqbal";
  
  const actionCards = [
    {
      icon: Briefcase,
      title: 'Career Assessment',
      description: 'Discover your ideal career path through our assessment',
      buttonText: 'Take Assessment',
      gradient: 'from-indigo-500 to-purple-600',
      accentColor: 'border-indigo-200 bg-indigo-50/50',
    },
    {
      icon: FileText,
      title: 'Mock Test',
      description: 'Practice with realistic tests to prepare for your exams',
      buttonText: 'Start Mock Test',
      gradient: 'from-purple-500 to-pink-600',
      accentColor: 'border-purple-200 bg-purple-50/50',
    },
    {
      icon: GraduationCap,
      title: 'Universities',
      description: 'Explore HEC-recognized universities and find the perfect match',
      buttonText: 'Browse Universities',
      gradient: 'from-blue-500 to-cyan-600',
      accentColor: 'border-blue-200 bg-blue-50/50',
    },
    {
      icon: Calculator,
      title: 'Merit Calculator',
      description: 'Calculate your admission merit percentage and check probabilities',
      buttonText: 'Calculate Merit',
      gradient: 'from-orange-500 to-red-600',
      accentColor: 'border-orange-200 bg-orange-50/50',
    },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <p className="text-indigo-100">Welcome back,</p>
            </div>
            <h1 className="text-4xl mb-2">{userName}!</h1>
            <p className="text-indigo-100">
              Your journey to success starts here. Let's make today count!
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8 bg-slate-50">
        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Your Dashboard
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className={`p-6 border-2 ${card.accentColor} hover:shadow-xl transition-all duration-300 group h-full flex flex-col`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <card.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2">{card.title}</h3>
                      <p className="text-sm text-slate-600">{card.description}</p>
                    </div>
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${card.gradient} text-white hover:shadow-lg transition-all duration-300 group-hover:translate-x-1 mt-auto`}
                  >
                    {card.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <h2 className="mb-6">Recent Activity</h2>
          <Card className="p-6">
            <div className="space-y-4">
              {[
                {
                  action: 'Saved university',
                  detail: 'NUST - National University of Sciences & Technology',
                  time: '2 hours ago',
                  icon: Bookmark,
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                },
                {
                  action: 'Completed career assessment',
                  detail: 'Engineering & Technology pathway',
                  time: '1 day ago',
                  icon: CheckCircle2,
                  color: 'text-green-600',
                  bgColor: 'bg-green-50',
                },
                {
                  action: 'Updated profile',
                  detail: 'Added academic achievements',
                  time: '3 days ago',
                  icon: User,
                  color: 'text-purple-600',
                  bgColor: 'bg-purple-50',
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">{activity.action}</p>
                    <p className="text-sm text-slate-600 truncate">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Community Forum */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <h2 className="mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Community Forum
          </h2>
          <Card className="p-6 border-2 border-green-200 bg-green-50/30">
            <div className="space-y-4">
              {[
                {
                  user: 'Ahmed Khan',
                  topic: 'Tips for NUST NET preparation',
                  replies: 24,
                  time: '1 hour ago',
                },
                {
                  user: 'Sara Ali',
                  topic: 'Best engineering universities in Lahore',
                  replies: 18,
                  time: '3 hours ago',
                },
                {
                  user: 'Hassan Raza',
                  topic: 'Scholarship opportunities for FSc students',
                  replies: 31,
                  time: '5 hours ago',
                },
              ].map((discussion, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white">
                    {discussion.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="mb-1">{discussion.topic}</p>
                    <p className="text-sm text-slate-600">
                      by {discussion.user} • {discussion.replies} replies
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{discussion.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg transition-all">
              View All Discussions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}