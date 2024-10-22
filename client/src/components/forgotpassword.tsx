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
    <section className="pt-32 relative w-screen bg-black text-black py-16 px-6 mx-auto">
 
    <div className="flex justify-center items-center h-120 mt- bg-black">
      <form onSubmit={handleSubmit} className="bg-black p-8 text-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Forgot Password</h2>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="username">
            Email:
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:border-yellow-500"
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-yellow-500 font-semibold text-black py-2 rounded hover:bg-yellow-600 hover:text-white transition-colors"
        >
          Send email
        </button>
        
        <div className="text-center mt-4">
          <p className="text-gray-400 text-sm">
             <Link to="/login" className="text-yellow-500 hover:underline hover:text-yellow-600 ">or Login?</Link>
          </p>
        </div>
      </form>
    </div>
    
    </section>
  );
};

export default ForgotPassword;
