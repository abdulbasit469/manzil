import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  Calculator,
  User,
  LogOut,
  Users,
  BookOpen,
  TrendingUp,
  GitCompareArrows,
} from 'lucide-react';
import { cn } from './ui/utils';

interface SidebarProps {
  isOpen: boolean;
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

export function Sidebar({ isOpen, currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <aside
      className={cn(
        'bg-[#0f1f3a] text-white flex flex-col shadow-2xl shrink-0 z-30',
        // Mobile drawer (under 56px top bar)
        'fixed left-0 top-14 h-[calc(100dvh-3.5rem)] w-[min(280px,88vw)] max-w-[280px] transition-transform duration-300 ease-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: in document flow, width toggles
        'lg:relative lg:left-auto lg:top-auto lg:z-0 lg:h-auto lg:max-w-none lg:translate-x-0',
        'lg:transition-[width] lg:duration-300 lg:ease-out',
        isOpen ? 'lg:w-[280px]' : 'lg:w-20',
      )}
    >
      <nav className="flex-1 p-3 space-y-1 pt-4 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const active =
            currentPage === item.page ||
            (item.page === 'universities' && currentPage === 'university-detail');
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => onPageChange(item.page)}
              title={item.label}
              className={cn(
                'w-full flex items-center rounded-lg transition-all duration-200 gap-3',
                isOpen ? 'px-4 py-3 justify-start' : 'max-lg:px-4 max-lg:py-3 max-lg:justify-start lg:px-2 lg:py-3 lg:justify-center',
                active
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-blue-200 hover:bg-[#1a2d4a] hover:text-white',
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap transition-opacity duration-200',
                  isOpen ? 'opacity-100 max-w-[220px]' : 'max-lg:opacity-100 max-lg:max-w-[220px] lg:opacity-0 lg:max-w-0',
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#1a2d4a] shrink-0">
        <button
          type="button"
          onClick={onLogout}
          title="Logout"
          className={cn(
            'w-full flex items-center rounded-lg text-blue-200 hover:bg-[#1a2d4a] hover:text-white transition-all duration-200 gap-3',
            isOpen ? 'px-4 py-3 justify-start' : 'max-lg:px-4 max-lg:py-3 max-lg:justify-start lg:px-2 lg:py-3 lg:justify-center',
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span
            className={cn(
              'overflow-hidden whitespace-nowrap transition-opacity duration-200',
              isOpen ? 'opacity-100 max-w-[220px]' : 'max-lg:opacity-100 max-lg:max-w-[220px] lg:opacity-0 lg:max-w-0',
            )}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
