import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Calculator,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  TrendingUp,
  GitCompareArrows
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' },
  { icon: GraduationCap, label: 'Universities', page: 'universities' },
  { icon: Briefcase, label: 'Career Assessment', page: 'career' },
  { icon: TrendingUp, label: 'Degree & Career Scope', page: 'degree-scope' },
  { icon: GitCompareArrows, label: 'Compare', page: 'compare' },
  { icon: Calculator, label: 'Merit Calculator', page: 'merit' },
  { icon: BookOpen, label: 'Mock Test', page: 'mocktest' },
  { icon: Users, label: 'Community', page: 'community' },
  { icon: User, label: 'Profile', page: 'profile' },
];

export function Sidebar({ isOpen, onToggle, currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0f1f3a] text-white flex flex-col relative shadow-2xl"
    >
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 pt-4">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onPageChange(item.page)}
            title={!isOpen ? item.label : ''}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === item.page ||
              (item.page === 'universities' && currentPage === 'university-detail')
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'text-blue-200 hover:bg-[#1a2d4a] hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <motion.span
              animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {item.label}
            </motion.span>
          </motion.button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[#1a2d4a]">
        <button 
          onClick={onLogout}
          title={!isOpen ? 'Logout' : ''}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-blue-200 hover:bg-[#1a2d4a] hover:text-white transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            Logout
          </motion.span>
        </button>
      </div>
    </motion.div>
  );
}