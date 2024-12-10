import React,{ useState } from 'react';
import { Link} from 'react-router-dom';
import { fetchForgotPassword} from '../fetch/auth/index';

const ForgotPassword = () => {
const [email, setEmail] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      const data = await fetchForgotPassword(email);
      console.log(data);
      // You may want to show a success message or handle the response appropriately here
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <section className="pt-32 relative w-full bg-black min-h-screen text-white py-16 px-6">
  <div className="flex justify-center items-center w-full max-w-md mx-auto  rounded-lg shadow-lg">
    <form 
      onSubmit={handleSubmit} 
      className="w-full p-8  rounded-lg text-white shadow-md"
    >
      <h2 className="text-3xl font-bold mb-6 text-center whitespace-nowrap text-yellow-500">
        Forgot Password
      </h2>
      
      <div className="m-auto mb-6">
        <label 
          htmlFor="email" 
          className="block text-sm font-semibold text-gray-300 mb-2"
        >
          Email Address:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-yellow-500 focus:ring focus:ring-yellow-500"
          required
        />
      </div>
      
      <button
        type="submit"
        className="w-full py-2 text-center text-black bg-yellow-500 font-medium rounded-lg hover:bg-yellow-600 transition-colors"
      >
        Send Email
      </button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-400">
          Remembered your password?{" "}
          <Link 
            to="/login" 
            className="text-yellow-500 hover:underline hover:text-yellow-600 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </form>
  </div>
</section>

  );
};

export default ForgotPassword;
