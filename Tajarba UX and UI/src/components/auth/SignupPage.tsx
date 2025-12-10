import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import manzilLogo from 'figma:asset/fad22db213d7ab885e87f8e24176f8c866129bfa.png';

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const response = await register(fullName, email, password);
      toast.success('Account created! Please verify your email with the OTP sent to you.');
      // Navigate to OTP verification page
      navigate('/verify-otp', { state: { email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
            Join thousands of students on their journey to success
          </p>
        </motion.div>

        {/* Right Side - Signup Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
            <h2 className="text-2xl mb-1 text-center">Create Your Account</h2>
            <p className="text-slate-600 text-center mb-4 text-sm">
              It&rsquo;s quick and easy.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  required
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg text-white py-2.5 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="text-center text-xs text-slate-600 pt-2">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-amber-600 hover:text-amber-700"
                >
                  Log in
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-slate-600 hover:text-slate-800"
              >
                &larr; Back to Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}