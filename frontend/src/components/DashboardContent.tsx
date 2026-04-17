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
  Users,
  MessageCircle,
  TrendingUp,
  Award,
  Clock,
  BookMarked,
  BarChart3,
  FileText,
  Bell,
  X,
  Loader2
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
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';
import { universityNameLabel, stripUnknownUniversityText } from '../utils/universityDisplay';
import { MapPin, Building2 } from 'lucide-react';
import { TestCalendar2026 } from './dashboard/TestCalendar2026';

interface DashboardContentProps {
  sidebarOpen: boolean;
  onPageChange: (page: string, postId?: string) => void;
}

export function DashboardContent({ sidebarOpen, onPageChange }: DashboardContentProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  /** Full-page loader only on first load — never on 30s poll or refetch (avoids blink). */
  const dashboardInitialFetchDone = useRef(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSavedUniversitiesModal, setShowSavedUniversitiesModal] = useState(false);
  const [savedUniversitiesList, setSavedUniversitiesList] = useState<any[]>([]);
  const [loadingSavedUniversities, setLoadingSavedUniversities] = useState(false);
  
  const [notifications, setNotifications] = useState<any[]>([]);
  /** Bell badge: unread only (server sync via GET unreadCount). */
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const [notifPanelStyle, setNotifPanelStyle] = useState<{
    top: number;
    right: number;
    width: number;
    maxHeight: number;
  }>({ top: 0, right: 16, width: 720, maxHeight: 620 });

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<{
    profileCompletion: number;
    savedUniversities: number;
    applications: number;
    weeklyActivity: { day: string; assessments: number; community: number; hours: number }[];
    timeSpent: { name: string; hours: number; color: string }[];
    assessmentScores: { category: string; score: number }[];
    recentActivity: { type: string; action: string; detail: string; timestamp: string; icon: string }[];
    universitiesProgress: { week: string; universities: number }[];
    universitiesThisWeek?: number;
    timelines?: {
      disclaimer: string;
      admissionWindows: { id: string; title: string; typicalPeriod: string; detail: string }[];
      entryTests: { id: string; name: string; typicalPeriod: string; body: string; manzilTip: string }[];
      testCalendar2026?: Record<string, unknown>;
    };
    profileGaps?: { field: string; label: string }[];
  }>({
    profileCompletion: 0,
    savedUniversities: 0,
    applications: 0,
    weeklyActivity: [],
    timeSpent: [],
    assessmentScores: [],
    recentActivity: [],
    universitiesProgress: []
  });

  useEffect(() => {
    // Dashboard API syncs test-calendar → DB notifications; load dashboard first, then bell.
    (async () => {
      await fetchDashboardData();
      await fetchNotifications();
    })();

    const interval = setInterval(() => {
      fetchDashboardData().then(() => fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const updateNotificationPanelPosition = () => {
    const el = bellButtonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 12;
    const panelWidth = Math.min(720, Math.max(320, window.innerWidth - margin * 2));
    const idealMax = Math.min(window.innerHeight * 0.75, 620);
    const spaceBelow = window.innerHeight - r.bottom - margin;
    const maxHeight = Math.max(220, Math.min(idealMax, spaceBelow));
    setNotifPanelStyle({
      top: r.bottom + 8,
      right: Math.max(margin, window.innerWidth - r.right),
      width: panelWidth,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!showNotifications) return;
    updateNotificationPanelPosition();
    const onResize = () => updateNotificationPanelPosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/notifications');
      const fetchedNotifications = response.data.notifications || [];
      
      // Format notifications for display
      const formattedNotifications = fetchedNotifications.map((notif: any) => ({
        id: notif._id,
        title: notif.title,
        message: notif.message,
        time: formatTimeAgo(notif.createdAt),
        urgent: notif.urgent || false,
        read: notif.read || false,
        link: notif.link || null
      }));

      const unreadFromApi = response.data?.unreadCount;
      const unread =
        typeof unreadFromApi === 'number'
          ? unreadFromApi
          : formattedNotifications.filter((n: { read?: boolean }) => !n.read).length;

      setNotifications(formattedNotifications);
      setUnreadNotificationCount(unread);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Use empty array on error, don't show toast to avoid spam
      setNotifications([]);
      setUnreadNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  /** Opening the bell marks everything read in DB; list stays visible, badge clears. */
  const markAllNotificationsReadOnOpen = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error('Mark all notifications read:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === notificationId);
        const next = prev.filter((n) => n.id !== notificationId);
        if (removed && !removed.read) {
          setUnreadNotificationCount((c) => Math.max(0, c - 1));
        }
        return next;
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      setNotifications((prev) => {
        const removed = prev.find((n) => n.id === notificationId);
        const next = prev.filter((n) => n.id !== notificationId);
        if (removed && !removed.read) {
          setUnreadNotificationCount((c) => Math.max(0, c - 1));
        }
        return next;
      });
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadNotificationCount(0);
      toast.success('All notifications cleared');
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const fetchSavedUniversities = async () => {
    try {
      setLoadingSavedUniversities(true);
      const response = await api.get('/saved-universities');
      const universities = response.data?.savedUniversities || response.data?.universities || [];
      setSavedUniversitiesList(universities);
    } catch (error: any) {
      console.error('Error fetching saved universities:', error);
      console.error('Error response:', error.response);
      // If 204, treat as empty list (not an error)
      if (error.response?.status === 204) {
        setSavedUniversitiesList([]);
      } else {
        toast.error('Failed to load saved universities');
        setSavedUniversitiesList([]);
      }
    } finally {
      setLoadingSavedUniversities(false);
    }
  };

  const handleUnsaveUniversity = async (universityId: string) => {
    try {
      await api.delete(`/saved-universities/${universityId}`);
      setSavedUniversitiesList(prev => prev.filter(su => {
        const uni = su.university || su;
        return uni._id !== universityId;
      }));
      // Refresh dashboard data to update count
      fetchDashboardData();
      toast.success('University removed from saved list');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to unsave university');
    }
  };

  const fetchDashboardData = async () => {
    try {
      if (!dashboardInitialFetchDone.current) {
        setLoading(true);
      }
      const response = await api.get('/dashboard');
      const data = response.data.dashboard;

      // Transform backend data to match frontend format
      const weeklyActivity = data.graphs?.weeklyActivity || [];
      const assessmentScores = data.graphs?.assessmentScores || [];

      // Get time spent data from backend (real-time data)
      const timeSpentData = data.graphs?.timeSpent || [
        { name: 'Community', hours: 0, color: '#1e3a5f' },
        { name: 'University Explorer', hours: 0, color: '#2563eb' },
        { name: 'Merit Calculator', hours: 0, color: '#3b82f6' },
        { name: 'Career Assessment', hours: 0, color: '#f59e0b' },
      ];

      // Transform weekly activity to match chart format
      // Backend returns last 7 calendar days (oldest to newest)
      // Format: { day: 'Mon 15', assessments: 0, community: 0, hours: 0 }
      let transformedWeeklyActivity: { day: string; assessments: number; community: number; hours: number }[] = [];
      
      if (weeklyActivity.length > 0) {
        // Backend already sends last 7 days in chronological order (oldest to newest)
        transformedWeeklyActivity = weeklyActivity.map((day: any) => ({
          day: day.day || day.dayOfWeek || 'Mon',
          assessments: day.assessments !== undefined ? day.assessments : 0,
          community: day.community !== undefined ? day.community : 0,
          hours: day.hours !== undefined ? day.hours : 0
        }));
      } else {
        // Fallback: Generate last 7 days if no data
        const today = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dayName = dayNames[date.getDay()];
          const dayNumber = date.getDate();
          transformedWeeklyActivity.push({
            day: `${dayName} ${dayNumber}`,
            assessments: 0,
            community: 0,
            hours: 0
          });
        }
      }

      // Universities explored progress from backend (real-time data)
      const universitiesProgress = data.universitiesProgress || [];

      setDashboardData({
        profileCompletion: data.profileCompletion || 0,
        savedUniversities: data.stats?.savedUniversities || 0,
        applications: data.stats?.applicationsInProgress || 0,
        weeklyActivity: transformedWeeklyActivity,
        timeSpent: timeSpentData,
        assessmentScores: assessmentScores,
        universitiesProgress: universitiesProgress,
        universitiesThisWeek: data.stats?.universitiesThisWeek || 0,
        recentActivity: data.recentActivity || [],
        timelines: data.timelines,
        profileGaps: data.profileGaps,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      // Use default data on error - generate last 7 days
      const today = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const fallbackWeeklyActivity: { day: string; assessments: number; community: number; hours: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        fallbackWeeklyActivity.push({
          day: `${dayName} ${dayNumber}`,
          assessments: 0,
          community: 0,
          hours: 0
        });
      }
      
      setDashboardData({
        profileCompletion: 0,
        savedUniversities: 0,
        applications: 0,
        weeklyActivity: fallbackWeeklyActivity,
        timeSpent: [
          { name: 'Community', hours: 45, color: '#1e3a5f' },
          { name: 'University Explorer', hours: 52, color: '#2563eb' },
          { name: 'Merit Calculator', hours: 38, color: '#3b82f6' },
          { name: 'Career Assessment', hours: 28, color: '#f59e0b' },
        ],
        assessmentScores: [],
        recentActivity: [],
        universitiesProgress: Array.from({ length: 8 }, (_, i) => ({
          week: `Week ${i + 1}`,
          universities: Math.min(2 + (i * 2.5), 25)
        }))
      });
    } finally {
      setLoading(false);
      dashboardInitialFetchDone.current = true;
    }
  };


  const stats = [
    {
      icon: User,
      title: 'Profile Completion',
      value: `${dashboardData.profileCompletion}%`,
      percentage: dashboardData.profileCompletion,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
      onClick: () => {
        onPageChange('profile');
      },
    },
    {
      icon: BookMarked,
      title: 'Saved Universities',
      value: `${dashboardData.savedUniversities}`,
      percentage: Math.min((dashboardData.savedUniversities / 20) * 100, 100),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
      onClick: () => {
        setShowSavedUniversitiesModal(true);
        fetchSavedUniversities();
      },
    },
    {
      icon: FileText,
      title: 'Applications',
      value: `${dashboardData.applications}`,
      percentage: Math.min((dashboardData.applications / 10) * 100, 100),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      gradient: 'from-amber-500 to-amber-600',
    },
  ];

  // Convert hours to minutes for display
  const totalTimeSpentMinutes = dashboardData.timeSpent.reduce((sum, item) => sum + (item.hours * 60), 0);
  const totalWeeklyHours = dashboardData.weeklyActivity.reduce((sum, day) => sum + day.hours, 0);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const notificationPanel =
    showNotifications && typeof document !== 'undefined'
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[140] cursor-default bg-black/20"
              aria-label="Close notifications"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              className="fixed z-[150] flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              style={{
                top: notifPanelStyle.top,
                right: notifPanelStyle.right,
                width: notifPanelStyle.width,
                height: notifPanelStyle.maxHeight,
                maxHeight: notifPanelStyle.maxHeight,
              }}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Bell className="h-4 w-4 text-slate-700" />
                  Notifications ({notifications.length})
                </h3>
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>
              <div
                className="notification-panel-scroll w-full overscroll-contain"
                style={{
                  height: `calc(${notifPanelStyle.maxHeight}px - 64px)`,
                  maxHeight: `calc(${notifPanelStyle.maxHeight}px - 64px)`,
                }}
              >
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Bell className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                    <p className="text-sm text-slate-600">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border-b border-slate-100 p-4 transition-colors hover:bg-slate-50 ${
                        notification.link ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (notification.link) {
                          const postIdMatch = notification.link.match(/\/community\/posts\/(.+)/);
                          if (postIdMatch?.[1]) {
                            onPageChange('community-post-detail', postIdMatch[1]);
                            setShowNotifications(false);
                          }
                        }
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">{notification.title}</h4>
                            {notification.urgent && (
                              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed text-slate-700">{notification.message}</p>
                          <span className="mt-2 block text-xs text-slate-500">{notification.time}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {notificationPanel}
      <div className="flex-1 overflow-auto bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f1f3a] via-[#1e3a5f] to-amber-500 text-white p-4 md:p-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 w-full">
                <p className="text-base md:text-lg text-blue-200 mb-1">Welcome</p>
                <div className="flex items-center justify-between gap-4 w-full">
                  <h1 className="text-4xl md:text-6xl font-bold mb-0">{user?.name || 'User'}!</h1>
                  {/* Notification Bell — panel opens via portal (full width, not clipped) */}
                  <div className="flex flex-shrink-0 items-center">
                    <button
                      ref={bellButtonRef}
                      type="button"
                      onClick={() => {
                        setShowNotifications((open) => {
                          const opening = !open;
                          if (opening && bellButtonRef.current) {
                            const r = bellButtonRef.current.getBoundingClientRect();
                            const margin = 12;
                            const w = Math.min(720, Math.max(320, window.innerWidth - margin * 2));
                            const idealMax = Math.min(window.innerHeight * 0.75, 620);
                            const spaceBelow = window.innerHeight - r.bottom - margin;
                            const maxHeight = Math.max(220, Math.min(idealMax, spaceBelow));
                            setNotifPanelStyle({
                              top: r.bottom + 8,
                              right: Math.max(margin, window.innerWidth - r.right),
                              width: w,
                              maxHeight,
                            });
                            void markAllNotificationsReadOnOpen();
                          }
                          return !open;
                        });
                      }}
                      className="relative rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm transition-all hover:bg-white/20"
                    >
                      <Bell className="h-5 w-5 text-white md:h-6 md:w-6" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white">
                          {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm md:text-base text-blue-100 mt-0 mb-0">
                  Your journey to success starts here. Let's make today count!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Action Cards */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card 
                  className={`p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 bg-gradient-to-br from-white to-amber-50/30 ${stat.onClick ? 'cursor-pointer' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (stat.onClick) {
                      stat.onClick();
                    }
                  }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm text-slate-600 mb-1">{stat.title}</p>
                      <span className="text-2xl md:text-3xl text-slate-800 font-semibold">{stat.value}</span>
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

        {(dashboardData.timelines?.testCalendar2026 ||
          (dashboardData.profileGaps?.length ?? 0) > 0) && (
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6 md:mb-8"
          >
            {dashboardData.timelines?.testCalendar2026 && (
              <TestCalendar2026 calendar={dashboardData.timelines.testCalendar2026} />
            )}

            {(dashboardData.profileGaps?.length ?? 0) > 0 && (
              <Card
                className={`p-4 bg-blue-50/80 border border-blue-100 ${
                  dashboardData.timelines?.testCalendar2026 ? 'mt-4' : ''
                }`}
              >
                <p className="text-sm font-medium text-slate-800 mb-2">
                  Complete your profile for better recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.profileGaps!.slice(0, 6).map((g) => (
                    <span
                      key={g.field}
                      className="text-xs px-2 py-1 rounded-full bg-white border border-blue-200 text-slate-700"
                    >
                      {g.label}
                    </span>
                  ))}
                </div>
                <Button
                  size="sm"
                  className="mt-3 bg-[#1e3a5f] hover:bg-[#0f1f3a]"
                  onClick={() => onPageChange('profile')}
                >
                  Finish profile
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {/* Analytics Dashboard - Graphs Section */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 md:mt-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              Analytics Dashboard
            </h2>
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
              <Clock className="w-3 h-3 md:w-4 md:h-4" />
              <span>Last 8 weeks</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Universities Explored Progress - Line Chart */}
            <Card className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-amber-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-base md:text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />
                  Universities Explored Progress
                </h3>
                <span className="text-xs md:text-sm text-amber-600 bg-amber-50 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                  +{dashboardData.universitiesThisWeek || 0} this week
                </span>
              </div>
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.universitiesProgress || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="week" 
                      stroke="#64748b" 
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      domain={[0, 'dataMax']}
                      fontSize={12}
                      tick={{ fill: '#64748b' }}
                    />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="universities" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 4 }}
                      activeDot={{ r: 6 }}
                    name="Universities"
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
            </Card>

            {/* Time Spent Per Subject - Pie Chart */}
            <Card className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <h3 className="text-base md:text-lg text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                  Time Spent on App
                </h3>
                <span className="text-xs md:text-sm text-blue-600 bg-blue-50 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                  {totalTimeSpentMinutes} mins total
                </span>
              </div>
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                      data={dashboardData.timeSpent.map(item => ({ ...item, minutes: item.hours * 60 }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                      paddingAngle={0}
                      dataKey="minutes"
                      label={false}
                  >
                      {dashboardData.timeSpent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px'
                    }}
                      formatter={(value: number) => `${value} mins`}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
              <div className="mt-3 md:mt-4 grid grid-cols-2 gap-2 md:gap-3">
                {dashboardData.timeSpent.map((subject, index) => {
                  const minutes = subject.hours * 60;
                  const percent = totalTimeSpentMinutes > 0 ? ((minutes / totalTimeSpentMinutes) * 100).toFixed(0) : '0';
                  return (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: subject.color }}
                    />
                      <span className="text-xs md:text-sm text-slate-600">
                        <span className="font-medium">{subject.name}</span>: {minutes} mins ({percent}%)
                      </span>
                  </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Weekly Activity Summary and Recent Activity - Side by Side */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Weekly Activity Summary - 60% */}
            <div className="w-full md:w-[60%]">
              <Card className="p-4 md:p-6 hover:shadow-xl transition-all duration-300 border-t-4 border-green-500 h-full flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                  <h3 className="text-base md:text-lg text-slate-800 flex items-center gap-2">
                    <Award className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                Weekly Activity Summary
              </h3>
                  <span className="text-xs md:text-sm text-green-600 bg-green-50 px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
                    {totalWeeklyHours} hrs this week
                  </span>
            </div>
                <div className="w-full" style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.weeklyActivity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="day" 
                        stroke="#64748b"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={11}
                        tick={{ fill: '#64748b' }}
                      />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '11px'
                  }} 
                />
                      <Legend 
                        wrapperStyle={{ fontSize: '11px' }}
                        iconSize={10}
                      />
                <Bar dataKey="assessments" fill="#1e3a5f" name="Assessments" radius={[8, 8, 0, 0]} />
                <Bar dataKey="community" fill="#f59e0b" name="Community" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
                </div>
          </Card>
            </div>

            {/* Recent Activity - 40% */}
            <div className="w-full md:w-[40%]">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
                className="h-full flex flex-col"
        >
                <h2 className="text-lg md:text-xl mb-4">Recent Activity</h2>
                <Card className="p-4 md:p-6 flex-1 flex flex-col" style={{ minHeight: '280px' }}>
                  {dashboardData.recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 flex-1 flex items-center justify-center">
                      <p className="text-sm">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto">
                      {dashboardData.recentActivity.map((activity, index) => {
                        // Format timestamp to relative time
                        const formatTimeAgo = (timestamp: string) => {
                          const date = new Date(timestamp);
                          const now = new Date();
                          const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
                          
                          if (diffInSeconds < 60) return 'Just now';
                          if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
                          if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
                          if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
                          return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
                        };

                        // Get icon and colors based on activity type
                        const getActivityIcon = (iconType: string) => {
                          switch (iconType) {
                            case 'bookmark':
                              return { Icon: Bookmark, color: 'text-blue-700', bgColor: 'bg-blue-100' };
                            case 'check':
                              return { Icon: CheckCircle2, color: 'text-amber-600', bgColor: 'bg-amber-50' };
                            case 'user':
                              return { Icon: User, color: 'text-blue-700', bgColor: 'bg-blue-100' };
                            case 'file':
                              return { Icon: FileText, color: 'text-green-700', bgColor: 'bg-green-100' };
                            default:
                              return { Icon: Clock, color: 'text-slate-700', bgColor: 'bg-slate-100' };
                          }
                        };

                        const { Icon, color, bgColor } = getActivityIcon(activity.icon);

                        return (
                          <div key={index} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
                              <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm mb-1">{activity.action}</p>
                              <p className="text-xs text-slate-600 truncate">{activity.detail}</p>
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                  </div>
                        );
                      })}
                </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Saved Universities Modal */}
      {showSavedUniversitiesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white sticky top-0 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl mb-1">Saved Universities</h2>
                  <p className="text-white/90">Your bookmarked universities</p>
                </div>
                <button
                  onClick={() => setShowSavedUniversitiesModal(false)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingSavedUniversities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
              ) : (!savedUniversitiesList || savedUniversitiesList.length === 0) ? (
                <div className="text-center py-12">
                  <BookMarked className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-600 mb-4">No saved universities yet</p>
                  <Button
                    onClick={() => {
                      setShowSavedUniversitiesModal(false);
                      onPageChange('universities');
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
                  >
                    Explore Universities
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  </div>
              ) : (
                <>
                  {/* Saved Universities Section */}
                  <div className="mb-8">
                    <h3 className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-amber-600" />
                      Saved Universities ({savedUniversitiesList.length})
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="space-y-3">
                        {savedUniversitiesList.map((savedUni: any) => {
                          const university = savedUni.university || savedUni;
                          
                          return (
                            <div
                              key={savedUni._id}
                              className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-all"
                            >
                  <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold text-slate-800 mb-1">
                                  {universityNameLabel(university.name)}
                                </h4>
                                {stripUnknownUniversityText(university.city) && (
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="w-4 h-4 text-amber-600" />
                                    <span>{stripUnknownUniversityText(university.city)}</span>
                                  </div>
                                )}
                              </div>
                              <Button
                                onClick={() => {
                                  const id = university._id;
                                  if (id) {
                                    setShowSavedUniversitiesModal(false);
                                    onPageChange('university-detail', String(id));
                                  }
                                }}
                                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all ml-4 flex-shrink-0"
                                size="sm"
                              >
                                View details
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        setShowSavedUniversitiesModal(false);
                        onPageChange('universities');
                      }}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-lg transition-all"
                    >
                      Explore More Universities
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => setShowSavedUniversitiesModal(false)}
                      variant="outline"
                      className="border-slate-300"
                    >
                      Close
                    </Button>
                  </div>
                </>
              )}
            </div>
        </motion.div>
      </div>
      )}
    </div>
    </>
  );
}
