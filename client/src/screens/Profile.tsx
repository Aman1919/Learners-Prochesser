import { useRecoilValue } from 'recoil';
import { userState } from '../state/userState';

const Profile = () => {
  const user = useRecoilValue(userState);
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  if(!user)return <></>
  
  return (
    <div className="profile-section bg-white shadow-lg rounded-lg p-8 flex flex-col items-center">
      {/* Profile Picture */}
      <div className="profile-picture mb-6">
        <img
          src="https://via.placeholder.com/150" // Placeholder image URL
          alt="Profile"
          className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-md"
        />
      </div>

      {/* User Information */}
      <h2 className="text-2xl font-bold text-blue-900">{user.firstname + " "+ user.lastname}</h2>
      <p className="text-gray-600 mb-4">Chess Enthusiast | Instructor</p>
      <p className="text-center text-gray-700 mb-4">
        A passionate chess player and instructor with years of experience. 
        Dedicated to helping others improve their game and enjoy the beauty of chess.
      </p>

      {/* Contact Information */}
      <div className="contact-info w-full">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Email: <span className="text-blue-600">{user.email}</span></li>
          <li>Phone: <span className="text-blue-600">+1 (123) 456-7890</span></li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons mt-6 w-full flex justify-center">
        <button className="bg-blue-600 text-white py-2 px-4 rounded-full transition duration-300 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 mr-4">
          Edit Profile
        </button>
        <button className="bg-red-600 text-white py-2 px-4 rounded-full transition duration-300 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300" onClick={handleLogoutClick}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
