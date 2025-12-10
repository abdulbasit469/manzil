import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { toast } from 'sonner';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset link has been sent to your email. Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-[#0f1f3a] via-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="text-center mb-6">
            <img src={manzilLogo} alt="Manzil Logo" className="w-24 h-24 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Forgot Password</h2>
            <p className="text-slate-600 text-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full bg-black hover:bg-black/90 text-white py-3"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                Login here
              </button>
            </p>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              &larr; Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

