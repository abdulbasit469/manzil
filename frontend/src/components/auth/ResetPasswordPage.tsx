import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { toast } from 'sonner';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';
import { Eye, EyeOff } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetToken = location.state?.resetToken;
  const email = location.state?.email;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  if (!resetToken) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/auth/reset-password/${resetToken}`, { password, confirmPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-[#0f1f3a] via-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-6">
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-2xl p-6"
        >
          <div className="text-center mb-5">
            <img src={manzilLogo} alt="Manzil Logo" className="w-20 h-20 mx-auto mb-3" />
            <h2 className="text-xl font-bold mb-1.5">Reset Password</h2>
            <p className="text-slate-600 text-xs md:text-sm">
              {email ? `Enter your new password for ${email}` : 'Enter your new password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New Password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/90 text-white py-2.5 text-sm"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="text-center mt-3">
            <button
              onClick={() => navigate('/login')}
              className="text-xs md:text-sm text-slate-600 hover:text-slate-800"
            >
              &larr; Back to Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

