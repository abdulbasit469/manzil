import { useContext, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { AuthContext } from '../context/AuthContext'

export function TopNavbar({ onMenuClick, sidebarWidth = 80, isSidebarOpen = true }) {
  const { user } = useContext(AuthContext)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) return null

  // Get initials from name
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div 
      className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 md:px-6 shadow-lg fixed top-0 right-0 z-40 transition-all duration-300"
      style={{ left: isMobile ? '0' : `${sidebarWidth}px` }}
      id="top-navbar"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="text-white hover:bg-slate-800"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xs md:text-sm text-slate-300 truncate max-w-[120px] md:max-w-none">
          {user.name}
        </span>
        <Avatar className="w-7 h-7 md:w-8 md:h-8 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all flex-shrink-0">
          {user.profilePicture ? (
            <AvatarImage src={user.profilePicture} alt={user.name} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs md:text-sm">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
    </div>
  )
}
