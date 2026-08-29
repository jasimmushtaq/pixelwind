import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen flex bg-[#060a14]">
      {/* Left side: Banner Image */}
      <div 
        className="hidden lg:flex flex-1 items-center justify-center bg-no-repeat bg-contain bg-center relative"
        style={{ backgroundImage: 'url("/login-bg.png")' }}
      >
        {/* Soft gradient to blend the right edge of the image into the login panel */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#060a14] to-transparent pointer-events-none"></div>
      </div>

      {/* Right side: Login Panel */}
      <div className="w-full lg:w-[480px] xl:w-[560px] flex items-center justify-center p-8 sm:p-12 relative z-10 bg-[#060a14] shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Admin Portal
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Welcome back! Sign in to manage your LMS.
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="admin@pixelwind.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-700/50 bg-gray-800/50 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all pr-12"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
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
            
            <div className="flex justify-center">
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setTurnstileToken(token)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060a14] focus:ring-blue-500 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
