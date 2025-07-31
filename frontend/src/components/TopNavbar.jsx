import { Search } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { Eye, EyeOff, User, Lock, Edit, LogOut, UserX, ChevronDown, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ searchQuery, setSearchQuery, navbarHeight }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await API.get('/api/auth/me');
        setUser(response.data);
        setProfileForm({
          name: response.data?.name || '',
          email: response.data?.email || '',
          avatarFile: null,
          avatarPreview: response.data?.avatar || ''
        });
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({
          ...profileForm,
          avatarFile: file,
          avatarPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // For Profile Modal:
    const handleCloseProfileModal = () => {
      setShowProfileModal(false);
      setProfileError('');
      setProfileSuccess('');
      // Reset to current user data
      setProfileForm({
        name: user?.name || '',
        email: user?.email || '',
        avatarFile: null,
        avatarPreview: user?.avatar || ''
      });
    };

    // For Password Modal:
    const handleClosePasswordModal = () => {
      setShowPasswordModal(false);
      setPasswordError('');
      setPasswordSuccess('');
      setPasswordForm({
        current: '',
        new: '',
        confirm: ''
      });
    };

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

  // Update the handleProfileUpdate function:
const handleProfileUpdate = async (e) => {
  e.preventDefault();
  setProfileError('');
  setProfileSuccess('');
  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    
    if (profileForm.avatarFile) {
      formData.append('avatar', profileForm.avatarFile);
    }

    const response = await API.put('/api/auth/me/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Update both user state and local storage
    const updatedUser = response.data.user;
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    setProfileForm({
      name: updatedUser.name,
      email: updatedUser.email,
      avatarFile: null,
      avatarPreview: updatedUser.avatar
    });
    
    setProfileSuccess('Profile updated successfully');
    setTimeout(() => setShowProfileModal(false), 1500);
  } catch (err) {
    setProfileError(err.response?.data?.message || "Failed to update profile");
  } finally {
    setIsUploading(false);
  }
};

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.new !== passwordForm.confirm) {
      return setPasswordError("New passwords don't match");
    }
    
    if (passwordForm.new.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    
    try {
      await API.put('/api/auth/me/password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new
      });
      
      setPasswordSuccess('Password updated successfully');
      setPasswordForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setShowPasswordModal(false), 1500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
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
    <header className={`fixed top-0 left-0 right-0 bg-slate-800 shadow-sm z-30 text-white ${navbarHeight || "h-20"}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
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
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <span className="text-sm font-medium text-white">
                    {user?.name || 'Loading...'}
                  </span>
                  <img
                    className="h-8 w-8 rounded-full border-2 border-zinc-300 object-cover"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/default?s=200&d=mp'}
                    alt="User profile"
                    onError={(e) => {
                      e.target.src = 'https://www.gravatar.com/avatar/default?s=200&d=mp';
                    }}
                  />
                  <ChevronDown size={16} className="text-zinc-300" />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      <Lock size={16} className="mr-2" />
                      Change Password
                    </button>
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

              {/* Profile Edit Modal */}
              {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Edit Profile
            </h3>
            
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            {/* In Profile Modal */}
            {profileError && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              {/* Avatar Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <img
                      className="h-16 w-16 rounded-full border-2 border-gray-300 object-cover"
                      src={profileForm.avatarPreview || 'https://www.gravatar.com/avatar/default?s=200&d=mp'}
                      alt="Profile preview"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 transition"
                    >
                      <Upload className="mr-2" size={16} />
                      {profileForm.avatarFile ? 'Change' : 'Upload'} Photo
                    </button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, GIF or PNG. Max size 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowProfileModal(false); handleCloseProfileModal(); handleClosePasswordModal(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

              {/* Password Change Modal */}
              {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div 
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                  >
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Lock className="mr-2" size={20} />
                      Change Password
                    </h3>
                    
                    {error && (
                      <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                      </div>
                    )}
                    
                    {/* In Password Modal */}
                    {passwordError && (
                      <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    <form onSubmit={handlePasswordUpdate}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                            className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500"
                          >
                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                            className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500"
                          >
                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                            className="text-gray-700 w-full px-3 py-2 border border-gray-300 rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500"
                          >
                            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordModal(false);
                            setPasswordForm({ current: '', new: '', confirm: '' });
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;