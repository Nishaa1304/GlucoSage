import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from 'axios';

const Signup = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    language: 'en' as 'en' | 'hi',
    phoneNumber: '',
    userType: 'patient' as 'patient' | 'doctor',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    console.log('Signup form submitted');
    console.log('Form data:', formData);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.age || parseInt(formData.age) < 1 || parseInt(formData.age) > 150) {
      setError('Please enter a valid age');
      return;
    }

    // Clean phone number (remove spaces, +, hyphens)
    const cleanedPhone = formData.phoneNumber.replace(/[\s\-+]/g, '');
    
    // Validate phone number if provided
    if (cleanedPhone && !/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit Indian phone number starting with 6-9');
      return;
    }

    setIsLoading(true);
    console.log('Sending request to backend...');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: parseInt(formData.age),
        gender: formData.gender,
        userType: formData.userType,
        language: formData.language,
        phoneNumber: cleanedPhone || undefined,
      };
      
      console.log('Payload:', payload);

      const response = await axios.post('http://localhost:5000/api/auth/register', payload);

      console.log('Response:', response.data);

      if (response.data.success) {
        // Save token
        localStorage.setItem('glucosage_token', response.data.token);
        
        // Save user data
        const userData = response.data.data;
        setUser({
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          userType: userData.userType,
          language: userData.language,
        });

        // Save to localStorage
        localStorage.setItem('glucosage_user', JSON.stringify({
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          userType: userData.userType,
          language: userData.language,
        }));

        console.log('Registration successful, navigating to home...');
        navigate('/home');
      }
    } catch (err: any) {
      console.error('Signup error details:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join GlucoSage today</p>
        </div>

        {/* Signup Form */}
        <div className="glass-card-solid backdrop-blur-md rounded-2xl p-8 shadow-glow-lg border border-primary-200/30 animate-slideUp max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fadeIn">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input w-full"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input w-full"
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="input w-full"
                placeholder="9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">Enter 10-digit number starting with 6-9</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Language *</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                className="input w-full"
                required
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-6"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline"
              >
                Sign In
              </Link>
            </p>
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

export default Signup;
