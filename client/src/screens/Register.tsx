import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { fetchSignup } from '../fetch/auth/index';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    await fetchSignup(formData, setError, setSuccess);
    
    setLoading(false);
  };

  return (
    <section className="relative w-screen bg-black text-black mx-auto">
      <div className="flex w-full justify-center items-center min-h-screen text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-black p-8 rounded-lg shadow-md w-96 space-y-6 md:space-y-8"
        >
          <h2 className="text-2xl font-extrabold text-center text-yellow-500 animate-pulse">Sign Up</h2>

          {/* Display error or success message */}
          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          {/* First Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              required
            />
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-yellow-500 text-black font-bold py-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-yellow-600"
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>

          {/* Login Link */}
          <p className="text-center text-white mt-4">
            Already have an account?{' '}
            <Link to="/signin" className="text-yellow-500 hover:text-yellow-600 underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Register;
