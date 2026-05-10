import { Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import logo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';
import { useState, useEffect } from 'react';
import api from '../services/api';

interface TopNavbarProps {
  onMenuClick: () => void;
  userName: string;
  onProfileClick?: () => void;
}

export function TopNavbar({ onMenuClick, userName, onProfileClick }: TopNavbarProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    fetchProfilePicture();
    
    // Listen for profile update events
    const handleProfileUpdate = () => {
      fetchProfilePicture();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const response = await api.get('/profile');
      if (response.data.profile?.profilePicture) {
        setProfilePicture(response.data.profile.profilePicture);
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
    }
  };

  // Get initials from name
  const initials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-[#0f1f3a] text-white h-14 flex items-center justify-between px-4 shadow-lg">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-[#1a2d4a]"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-1">
          <img src={logo} alt="Manzil Logo" className="w-14 h-14 rounded-full brightness-125" />
          <span className="text-xl"><strong>MANZIL</strong></span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-white">{userName}</span>
        <div 
          onClick={onProfileClick}
          className="cursor-pointer"
        >
          <Avatar className="w-8 h-8 hover:ring-2 hover:ring-amber-400 transition-all">
            {profilePicture && (
              <AvatarImage 
                src={profilePicture} 
                alt={userName}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-[#1e3a5f] to-amber-500 text-white text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}