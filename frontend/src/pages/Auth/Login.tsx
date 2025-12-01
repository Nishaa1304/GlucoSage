import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Save token
        localStorage.setItem('glucosage_token', response.data.token);
        
        // Save user data
        const userData = response.data.data;
        setUser({
          name: userData.name,
          age: userData.age,
          gender: userData.gender || 'other',
          userType: userData.userType,
          language: userData.language || 'en',
          abhaNumber: userData.abhaNumber,
          abhaAddress: userData.abhaAddress,
        });

        // Save to localStorage for persistence
        localStorage.setItem('glucosage_user', JSON.stringify({
          name: userData.name,
          age: userData.age,
          gender: userData.gender || 'other',
          userType: userData.userType,
          language: userData.language || 'en',
          abhaNumber: userData.abhaNumber,
          abhaAddress: userData.abhaAddress,
        }));

        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeIn">
          <img 
            src="/glucosage_logo.png" 
            alt="GlucoSage" 
            className="w-32 h-32 mx-auto mb-4 object-contain drop-shadow-lg animate-float"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue to GlucoSage</p>
        </div>

        {/* Login Form */}
        <div className="glass-card-solid backdrop-blur-md rounded-2xl p-8 shadow-glow-lg border border-primary-200/30 animate-slideUp">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3 font-semibold">Demo Credentials:</p>
            <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
              <p className="font-mono text-gray-700">📧 patient@glucosage.com</p>
              <p className="font-mono text-gray-700">🔑 password123</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-gray-600 text-sm hover:text-gray-800 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
