import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUpdatePassword, verifyResetPasswordToken } from '../fetch/auth/index';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [error, setError] = useState('');
  const [email,setEmail]=useState('')

  const { id } = useParams();
  // if(error){
  //   alert(error.message||"Something Happened")
  //   // navigate('/')
  // }
  


  //updating password
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if(!id){
      window.location.href = "/register";
      return;
    }
    if (password !== rePassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');

    await fetchUpdatePassword(id, password);
  };

//verifying the token before accessing this page
  useEffect(() => {
    const verifyToken = async () => {
      if (!id) {
        alert("No reset token provided");
        return;
      }
      await verifyResetPasswordToken(id,setError,setEmail);
    };

    verifyToken();
  }, [id]);


  return (
    <section className="pt-32 relative w-screen bg-black text-black py-16 px-6 mx-auto">
      <div className="flex justify-center items-center h-120 mt- bg-black">
        <div className="bg-black p-8 text-white rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-yellow-500">Reset Password</h2>
        {email &&  <h2 className="text-lg font-bold mb-6 text-center text-yellow-500">Email: {email}</h2>}
          
          {error && (
            <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
              {error}
            </div>
          )}
            
            

          
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="repassword">
              Re-enter Password:
            </label>
            <input
              type="password"
              name="repassword"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-yellow-500 font-semibold text-black py-2 rounded hover:bg-yellow-600 hover:text-white transition-colors"
          >
            Send email
          </button>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
