import { Search } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { LogOut, UserX, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ searchQuery, setSearchQuery }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/api/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/');
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? This cannot be undone.")) {
      try {
        await API.delete('/api/auth/me');
        localStorage.removeItem("token");
        navigate('/');
      } catch (err) {
        console.error("Failed to deactivate account:", err);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-800 shadow-sm z-30 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0"></div>
          
          <div className="flex-1 max-w-xl mx-4 md:ml-12">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-zinc-300" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-400 rounded-md leading-5 bg-slate-600 placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-zinc-300 sm:text-sm text-zinc-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2" ref={dropdownRef}>
                <button onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none">
                  <span className="text-sm font-medium text-white">
                    {user?.name || 'Loading...'}
                  </span>
                  <img
                    className="h-8 w-8 rounded-full border-2 border-zinc-300"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/default?s=200&d=mp'}
                    alt="User profile"
                  />
                  <ChevronDown size={16} className="text-zinc-300" />
                </button>
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                    <button
                      onClick={handleDeactivate}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                    >
                      <UserX size={16} className="mr-2" />
                      Deactivate Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;