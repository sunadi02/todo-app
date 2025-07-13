import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';


const TopNavbar = ({ setSearchResults }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
     const navigate = useNavigate();

    useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/api/auth/me'); // Adjust endpoint
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    
    fetchUser();
  }, []);

  const handleSearch = async (query) => {
    try {
      const res = await API.get(`/api/tasks/search?q=${encodeURIComponent(query)}`);
      setSearchResults(res.data);
      // Navigate to dashboard if not already there
      if (!window.location.pathname.includes('/dashboard')) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-slate-800 shadow-sm z-30 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side (optional) */}
          <div className="flex-shrink-0"></div>
          
          {/* Center Search */}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    console.log('Searching for:', searchQuery);
                    handleSearch(searchQuery);
                  }
                }}
              />
            </div>
          </div>
          
          {/* Right side - User Profile */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  {user?.name || 'Loading...'}
                </span>
                <img
                  className="h-8 w-8 rounded-full border-2 border-zinc-300"
                  src={user?.avatar || 'https://www.gravatar.com/avatar/default?s=200&d=mp'}
                  alt="User profile"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;