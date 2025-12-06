import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, GraduationCap } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { AuthContext } from '../context/AuthContext'

export function TopNavbar({ onMenuClick }) {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()

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
      className="bg-slate-900 text-white h-14 flex items-center justify-between px-4 md:px-6 shadow-lg fixed top-0 left-0 right-0 z-40 transition-all duration-300"
      id="top-navbar"
    >
      {/* Left side: Hamburger menu + Manzil (always visible, fixed position) */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold">Manzil</span>
        </div>
      </div>
      
      {/* Right side: User name and avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xs md:text-sm text-slate-300 truncate max-w-[120px] md:max-w-none">
          {user.name}
        </span>
        <div 
          onClick={() => navigate('/profile')}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              navigate('/profile')
            }
          }}
        >
          <Avatar className="w-7 h-7 md:w-8 md:h-8 hover:ring-2 hover:ring-indigo-400 transition-all flex-shrink-0">
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
    </div>
  )
}
