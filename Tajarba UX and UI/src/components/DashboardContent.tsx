import React from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  User,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  MessageCircle,
  TrendingUp,
  Target,
  Award,
  Clock,
  FileCheck,
  BookMarked,
  BarChart3,
  FileText,
  Bell,
  X
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useState } from 'react';

interface DashboardContentProps {
  sidebarOpen: boolean;
  onPageChange: (page: string) => void;
}

export function DashboardContent({ sidebarOpen, onPageChange }: DashboardContentProps) {
  const userName = "Taha Iqbal";
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'NUST Admission Deadline',
      message: 'Last date to apply: December 15, 2025',
      time: '2 days left',
      urgent: true,
    },
    {
      id: 2,
      title: 'LUMS Application Open',
      message: 'Applications now open for Spring 2026',
      time: '5 hours ago',
      urgent: false,
    },
    {
      id: 3,
      title: 'FAST Entry Test Date',
      message: 'Entry test scheduled for January 10, 2026',
      time: '1 day ago',
      urgent: true,
    },
    {
      id: 4,
      title: 'UET Merit List',
      message: 'First merit list will be announced on Dec 20',
      time: '2 days ago',
      urgent: false,
    },
  ]);

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const stats = [
    {
      icon: User,
      title: 'Profile Completion',
      value: '75%',
      percentage: 75,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      icon: BookMarked,
      title: 'Saved Universities',
      value: '12',
      percentage: 60,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
    },
    {
      icon: FileText,
      title: 'Applications',
      value: '5',
      percentage: 42,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
    },
  ];

  // Mock Test Scores Progression Data
  const applicationProgressData = [
    { week: 'Week 1', universities: 2 },
    { week: 'Week 2', universities: 5 },
    { week: 'Week 3', universities: 8 },
    { week: 'Week 4', universities: 10 },
    { week: 'Week 5', universities: 12 },
    { week: 'Week 6', universities: 15 },
    { week: 'Week 7', universities: 18 },
    { week: 'Week 8', universities: 20 },
  ];

  // Time Spent Per Subject Data
  const subjectTimeData = [
    { name: 'Community', hours: 45, color: '#1e3a5f' },
    { name: 'Merit Calculator', hours: 38, color: '#2563eb' },
    { name: 'University Explorer', hours: 52, color: '#3b82f6' },
    { name: 'Career Assessment', hours: 28, color: '#f59e0b' },
  ];

  // Weekly Activity Data
  const weeklyActivityData = [
    { day: 'Mon', assessments: 2, community: 1, hours: 5 },
    { day: 'Tue', assessments: 1, community: 2, hours: 6 },
    { day: 'Wed', assessments: 0, community: 1, hours: 4 },
    { day: 'Thu', assessments: 1, community: 0, hours: 3 },
    { day: 'Fri', assessments: 2, community: 2, hours: 7 },
    { day: 'Sat', assessments: 1, community: 1, hours: 5 },
    { day: 'Sun', assessments: 0, community: 1, hours: 4 },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl mb-2">{userName}!</h1>
                <p className="text-blue-100">
                  Your journey to success starts here. Let's make today count!
                </p>
              </div>
              
              {/* Notification Bell - Top Right Corner */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all"
                >
                  <Bell className="w-6 h-6 text-white" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                  >
                    {/* Header with Clear Button */}
                    <div className="bg-gradient-to-r from-[#1e3a5f] to-amber-500 p-4 flex items-center justify-between">
                      <h3 className="text-white flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notifications ({notifications.length})
                      </h3>
                      <button
                        onClick={clearAllNotifications}
                        className="text-white text-sm hover:text-amber-200 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                              notification.urgent ? 'bg-red-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-slate-800">{notification.title}</h4>
                                  {notification.urgent && (
                                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                                      Urgent
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-1">{notification.message}</p>
                                <span className="text-xs text-slate-500">{notification.time}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setNotifications(notifications.filter(n => n.id !== notification.id));
                                }}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                      <span className="text-3xl text-slate-800">{stat.value}</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.percentage}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                      className={`bg-gradient-to-r ${stat.gradient} h-2 rounded-full shadow-sm`}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Analytics Dashboard - Graphs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              Analytics Dashboard
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Last 8 weeks</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Mock Test Scores Progression - Line Chart */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-amber-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Universities Explored Progress
                </h3>
                <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">+18 this week</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 25]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="universities" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Universities"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Time Spent Per Subject - Pie Chart */}
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Time Spent on App
                </h3>
                <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">163 hrs total</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectTimeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="hours"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {subjectTimeData.map((subject, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="text-sm text-slate-600">{subject.name}: {subject.hours}h</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Weekly Activity Summary - Bar Chart */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Weekly Activity Summary
              </h3>
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">34 hrs this week</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="assessments" fill="#1e3a5f" name="Assessments" radius={[8, 8, 0, 0]} />
                <Bar dataKey="community" fill="#f59e0b" name="Community" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
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
                  color: 'text-blue-700',
                  bgColor: 'bg-blue-100',
                },
                {
                  action: 'Completed career assessment',
                  detail: 'Engineering & Technology pathway',
                  time: '1 day ago',
                  icon: CheckCircle2,
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                },
                {
                  action: 'Updated profile',
                  detail: 'Added academic achievements',
                  time: '3 days ago',
                  icon: User,
                  color: 'text-blue-700',
                  bgColor: 'bg-blue-100',
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
            <Users className="w-5 h-5 text-amber-600" />
            Community Forum
          </h2>
          <Card className="p-6 border-2 border-amber-200 bg-amber-50/30">
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center flex-shrink-0 text-white">
                    {discussion.user.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="mb-1">{discussion.topic}</p>
                    <p className="text-sm text-slate-600">
                      by {discussion.user} • {discussion.replies} replies
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <MessageCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-slate-500 whitespace-nowrap">{discussion.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => onPageChange('community')}
              className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
            >
              View All Discussions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}