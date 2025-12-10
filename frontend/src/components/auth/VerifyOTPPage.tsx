import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import api from '../../services/api';
import { toast } from 'sonner';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function VerifyOTPPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [devOTP, setDevOTP] = useState(location.state?.otp || '');

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  if (!email) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const res = await api.post('/auth/resend-otp', { email });
      
      if (res.data.developmentMode && res.data.otp) {
        setDevOTP(res.data.otp);
        toast.info('OTP resent! Check the displayed OTP (Development Mode)');
      } else {
        toast.success('OTP resent! Please check your email.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
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
            <h2 className="text-xl font-bold mb-1.5">Verify Your Email</h2>
            <p className="text-slate-600 text-xs md:text-sm">
              We've sent a 6-digit OTP to<br />
              <strong className="text-blue-600">{email}</strong>
            </p>
          </div>

          {devOTP && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-amber-800 font-bold mb-1.5 text-xs">
                ⚠️ Development Mode - Email service not configured
              </p>
              <p className="text-xl font-bold tracking-widest text-amber-900">
                {devOTP}
              </p>
              <p className="text-xs text-amber-700 mt-1.5">
                Check server console for more details
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="text-center text-xl md:text-2xl font-bold tracking-widest"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-black/90 text-white py-2.5 text-sm"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="text-center mt-3">
            <p className="text-xs md:text-sm text-slate-600">
              Didn't receive OTP?{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-amber-600 hover:text-amber-700 font-semibold"
              >
                {resending ? 'Sending...' : 'Resend'}
              </button>
            </p>
          </div>

          <div className="text-center mt-3">
            <button
              onClick={() => navigate('/signup')}
              className="text-xs md:text-sm text-slate-600 hover:text-slate-800"
            >
              &larr; Back to Signup
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

