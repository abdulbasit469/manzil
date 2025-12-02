import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

interface TopNavbarProps {
  onMenuClick: () => void;
  userName: string;
}

export function TopNavbar({ onMenuClick, userName }: TopNavbarProps) {
  // Get initials from name
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-slate-900 text-white h-14 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <span className="text-xl">Manzil</span>
      </div>
      
      <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all">
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}