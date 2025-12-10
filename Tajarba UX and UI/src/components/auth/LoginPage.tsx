import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-gradient-to-br from-[#0f1f3a] via-[#1e3a5f] to-[#2d4a6f] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <img src={manzilLogo} alt="Manzil Logo" className="w-64 h-64 mx-auto mb-6" />
          <h1 className="text-6xl text-white mb-4"><span className="font-bold">MANZIL</span></h1>
          <p className="text-2xl text-blue-100 max-w-md mx-auto">
            Your journey to academic excellence starts here
          </p>
        </motion.div>

        {/* Right Side - Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address or phone number"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-black/90 text-white py-3 text-lg disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Forgotten password?
                </button>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white py-3"
                >
                  Create new account
                </Button>
              </div>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-slate-600 hover:text-slate-800"
              >
                &larr; Back to Home
              </button>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-white/80 hover:text-white text-sm"
            >
              <span className="underline">Login as Admin</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}