import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Briefcase, 
  Calculator,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: GraduationCap, label: 'Universities', active: false },
  { icon: Briefcase, label: 'Career Assessment', active: false },
  { icon: Calculator, label: 'Merit Calculator', active: false },
  { icon: User, label: 'Profile', active: false },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 80 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col relative shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            {isOpen && <span className="text-xl">Manzil</span>}
          </motion.div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 ml-auto"
          >
            {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              item.active
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
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
      <div className="p-4 border-t border-slate-700/50">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all duration-200">
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
