import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      toast.success('Password reset OTP has been sent to your email. Please check your inbox.');
      
      // Store email in state for OTP verification page
      setTimeout(() => {
        navigate('/forgot-password-otp', { state: { email, otp: response.data?.otp, developmentMode: response.data?.developmentMode } });
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
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
            <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">M</span>
            </div>
            <h2 className="text-xl font-bold mb-1.5">Forgot Password</h2>
            <p className="text-slate-600 text-xs md:text-sm">
              Enter your email address and we'll send you an OTP to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/90 text-white py-2.5 text-sm"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>

          <div className="text-center mt-3">
            <p className="text-xs md:text-sm text-slate-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>

          <div className="text-center mt-3">
            <button
              onClick={() => navigate('/')}
              className="text-xs md:text-sm text-slate-600 hover:text-slate-800"
            >
              &larr; Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

