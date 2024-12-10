import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { userState } from "../state/userState";
import { useRecoilValue } from "recoil";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useRecoilValue(userState);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <nav className="bg-white w-full shadow-md">
      <div className="flex justify-between items-center mx-auto p-4 max-w-7xl">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold text-black hover:text-yellow-500">
          ProChesser
        </Link>

        {/* Hamburger Menu for small screens */}
        <button
          onClick={toggleMenu}
          className=" sm:hidden focus:outline-none"
        >
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>

        {/* Navigation Links for larger screens */}
        <div className="hidden sm:flex items-center space-x-6">
          <NavLinks user={user} handleLogout={handleLogoutClick} />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="sm:hidden bg-gray-100 p-4">
          <ul className="flex flex-col space-y-4">
            <NavLinks
              user={user}
              handleLogout={() => {
                handleLogoutClick();
                toggleMenu();
              }}
              closeMenu={toggleMenu}
            />
          </ul>
        </div>
      )}
    </nav>
  );
};

// Helper Component for Navigation Links
const NavLinks = ({ user, handleLogout, closeMenu }:any) => {
  return (
    <>
      {/* Home Link (for users without subscriptions) */}
      {!user || (user.Subscription && user.Subscription.length === 0) ? (
        <li>
          <Link
            to="/"
            className="text-black hover:text-yellow-500"
            onClick={closeMenu}
          >
            Home
          </Link>
        </li>
      ) : null}

      {/* Authenticated User Links */}
      {user ? (
        <>
          {user.Subscription && user.Subscription.length > 0 && (
            <li>
              <Link
                to="/dashboard"
                className="text-black hover:text-yellow-500"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/profile"
              className="text-black hover:text-yellow-500"
              onClick={closeMenu}
            >
              Profile
            </Link>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="bg-yellow-500 text-black font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-yellow-400"
            >
              Logout
            </button>
          </li>
        </>
      ) : (
        <>
          {/* Unauthenticated User Links */}
          <li>
            <Link
              to="/signin"
              className="text-black font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 ease-in-out"
              onClick={closeMenu}
            >
              Login
            </Link>
          </li>
          <li>
            <Link
              to="/register"
              className="bg-yellow-500 text-black font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-yellow-400"
              onClick={closeMenu}
            >
              Create Account
            </Link>
          </li>
        </>
      )}
    </>
  );
};

export default Navbar;
