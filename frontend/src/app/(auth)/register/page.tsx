'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [coordinates, setCoordinates] = useState<number[] | null>(null);
  const [locationStatus, setLocationStatus] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getLocation = () => {
    setLocationStatus('Locating...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
          setLocationStatus('Location detected ✓');
        },
        (err) => {
          setLocationStatus('Failed to get location');
          console.error(err);
        }
      );
    } else {
      setLocationStatus('Geolocation is not supported');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        ...formData,
        coordinates: coordinates,
      });
      setUser(data);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white text-[#002f34]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded border border-gray-300 shadow-[0_0_8px_rgba(0,0,0,0.1)]"
      >
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-[#002f34]">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-[#406367]">
            Join the SecondHand community today
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-400 text-[#002f34] rounded focus:outline-none focus:border-[#00a49f] sm:text-sm bg-transparent transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-400 text-[#002f34] rounded focus:outline-none focus:border-[#00a49f] sm:text-sm bg-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-400 text-[#002f34] rounded focus:outline-none focus:border-[#00a49f] sm:text-sm bg-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-400 text-[#002f34] rounded focus:outline-none focus:border-[#00a49f] sm:text-sm bg-transparent transition-all"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1" htmlFor="address">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-3 border-2 border-gray-300 placeholder-gray-400 text-[#002f34] rounded focus:outline-none focus:border-[#00a49f] sm:text-sm bg-transparent transition-all"
                placeholder="123 Main St, City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#002f34] mb-1">
                Your Location (For finding nearby items)
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={getLocation}
                  className="flex items-center justify-center px-4 py-2 border-2 border-[#002f34] rounded font-bold text-[#002f34] bg-white hover:bg-[#002f34] hover:text-white transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Auto Detect
                </button>
                <span className="text-sm font-bold text-[#406367]">
                  {locationStatus}
                </span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded text-white bg-[#002f34] hover:bg-[#00a49f] disabled:opacity-70 transition-colors"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-[#406367]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#002f34] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
