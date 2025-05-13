import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';
import { FiUser, FiLock, FiSun, FiMoon } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, login, googleLogin, error } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  
  // Initialize Google API
  useEffect(() => {
    // Load Google API script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    };
    
    loadGoogleScript();
  }, []);
  
  // Handle Google Sign-in success
  const handleGoogleSuccess = (response) => {
    googleLogin(response)
      .then((success) => {
        if (success) {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
          toast.success('Google login successful');
        }
      })
      .catch((err) => {
        toast.error('Google login failed. Please try again.');
        console.error('Google login error:', err);
      });
  };
  
  // Handle Google Sign-in failure
  const handleGoogleFailure = (error) => {
    console.error('Google Sign-in failed:', error);
    toast.error('Google login failed. Please try again.');
  };
  
  // Redirect if already logged in
  if (currentUser) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (!email.trim() || !password) {
      toast.error('Email and password are required');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
        toast.success('Login successful');
      } else {
        toast.error(error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.error('An error occurred during login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <FiSun className="h-5 w-5 text-yellow-400" />
            ) : (
              <FiMoon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
        
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">Black Hays</h1>
          <h2 className="mt-3 text-center text-xl font-bold text-gray-700 dark:text-gray-200">
            Payroll Management System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please sign in to your account
          </p>
        </div>
        
        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  // In a real app, this would use the Google Sign-In API
                  const mockGoogleResponse = {
                    profileObj: {
                      googleId: 'mock-google-id',
                      name: 'Google User',
                      email: 'google-user@example.com',
                      imageUrl: 'https://via.placeholder.com/32',
                    },
                  };
                  handleGoogleSuccess(mockGoogleResponse);
                }}
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
                Sign in with Google
              </button>
            </div>
          </div>

          {/* Demo credentials section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Demo Credentials
                </span>
              </div>
            </div>
            <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="border border-gray-200 dark:border-gray-700 rounded p-2">
                <p className="font-medium">Admin:</p>
                <p>admin@blackhays.com</p>
                <p>admin123</p>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded p-2">
                <p className="font-medium">Employee:</p>
                <p>employee@blackhays.com</p>
                <p>employee123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;