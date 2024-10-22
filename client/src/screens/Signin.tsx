import { useState } from 'react';
import {fetchLogin} from '../fetch/auth/index';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  await fetchLogin(email,password,setError);  
  };

  return (
    <section className=" relative w-screen bg-black text-black   mx-auto">
      <div className="flex w-full justify-center items-center min-h-screen text-white p-4">
        <div className="bg-black p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-3xl font-extrabold text-center text-yellow-500 animate-pulse mb-6">
            Welcome Back! Sign In
          </h2>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-300"
              />
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full bg-yellow-500 text-black font-bold py-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-yellow-600"
            >
              {error ? 'Retry' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-4">
            Don&apos;t have an account?
            <a href="/register" className="text-yellow-500 hover:text-yellow-600 underline">
              Register
            </a>
          </p>
          <p className="text-center text-gray-400 mt-4">
            Forgot Password
            <a href="/forgotpassword" className=" m-1 text-yellow-500 hover:text-yellow-600 underline">
              click here
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
