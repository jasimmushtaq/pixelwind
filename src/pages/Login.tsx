import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Gauge, Users, Mail, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!turnstileToken) {
      setError('Please complete the security challenge.');
      setLoading(false);
      return;
    }

    const allowedUsers = [
      { email: 'varun.pw@pw.com', password: 'India_Pw@1' },
      { email: 'hr.pw@pw.com', password: 'India_Pw@1' }
    ];

    const isAllowed = allowedUsers.some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!isAllowed) {
      setError('Invalid login credentials or unauthorized user.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-[#060a14] bg-[radial-gradient(ellipse_at_left,_var(--tw-gradient-stops))] from-blue-900/20 via-[#060a14] to-[#060a14] px-6 py-12 overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24 relative z-10">
        
        {/* Left side: Branding & Features */}
        <div className="hidden lg:flex flex-col text-white w-full lg:w-1/2">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-28 h-28 bg-white rounded-[2rem] flex items-center justify-center p-3 shadow-2xl shrink-0">
              <img src="/pixelwind-logo.png" alt="Pixelwind Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-5xl font-bold tracking-tight mb-2">Pixelwind</h1>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Technologies</h1>
            </div>
          </div>
          <p className="text-gray-300 text-lg mb-12 ml-2">Empowering Innovation. Delivering Excellence.</p>
          
          <div className="flex gap-10 ml-2">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center max-w-[120px]">
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <ShieldCheck className="text-blue-500" size={28} />
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5 text-white">Secure</h3>
              <p className="text-[13px] text-gray-400 leading-snug">Enterprise grade<br/>security</p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center max-w-[120px]">
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <Gauge className="text-blue-500" size={28} />
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5 text-white">Fast</h3>
              <p className="text-[13px] text-gray-400 leading-snug">Optimized<br/>performance</p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center max-w-[120px]">
              <div className="w-16 h-16 rounded-[1.25rem] bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-lg shadow-blue-500/10">
                <Users className="text-blue-500" size={28} />
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5 text-white">Reliable</h3>
              <p className="text-[13px] text-gray-400 leading-snug">Trusted by<br/>professionals</p>
            </div>
          </div>
        </div>

        {/* Right side: Login Panel */}
        <div className="w-full max-w-md lg:max-w-[480px] shrink-0">
          <div className="bg-[#0b1021]/80 backdrop-blur-xl border border-gray-800/60 rounded-[32px] p-8 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
            
            <div className="w-14 h-14 rounded-2xl bg-[#1e3a8a]/40 flex items-center justify-center mb-8 border border-blue-500/20 shadow-inner">
              <ShieldCheck className="text-blue-500" size={26} />
            </div>

            <h2 className="text-[32px] font-bold text-white mb-2 tracking-tight">
              Admin <span className="text-blue-500">Portal</span>
            </h2>
            <p className="text-gray-400 text-[15px] mb-8">
              Welcome back! Sign in to manage your LMS.
            </p>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      required
                      className="appearance-none relative block w-full pl-11 pr-4 py-3.5 border border-gray-700/50 bg-[#111827]/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-inner"
                      placeholder="admin@pixelwind.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[13px] font-medium text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="appearance-none relative block w-full px-4 py-3.5 border border-gray-700/50 bg-[#111827]/50 text-white placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all pr-12 tracking-[0.2em] shadow-inner"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey="1x00000000000000000000AA"
                  options={{ theme: 'dark' }}
                  onSuccess={(token) => setTurnstileToken(token)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent text-[15px] font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-[#4f46e5] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1021] focus:ring-blue-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
                >
                  {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
