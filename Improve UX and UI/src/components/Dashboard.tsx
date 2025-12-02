import { useState } from 'react';
import { motion } from 'motion/react';
import { Sidebar } from './Sidebar';
import { DashboardContent } from './DashboardContent';
import { TopNavbar } from './TopNavbar';
import { Target, BookOpen, Users } from 'lucide-react';

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const actionCards = [
    {
      title: 'Career Assessment',
      description: 'Take a comprehensive assessment to discover your ideal career path',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Mock Test',
      description: 'Practice with realistic tests to prepare for your exams',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Community Forum',
      description: 'Connect with peers and mentors in our community',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <TopNavbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} userName="Taha Iqbal" />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <DashboardContent sidebarOpen={sidebarOpen} actionCards={actionCards} />
      </div>
    </div>
  );
}