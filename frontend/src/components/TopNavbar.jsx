import { Search } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { Eye, EyeOff, User, Lock, Edit, LogOut, UserX, ChevronDown, Upload, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopNavbar = ({ searchQuery, setSearchQuery, navbarHeight, user, setUser }) => {
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
  
  // Removed unused error state
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch upcoming tasks for notification
  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/api/tasks/upcoming');
        if (mounted) setNotifications(res.data || []);
      } catch (err) {
        // fail silently
      }
    };

    fetchNotifications();
    const id = setInterval(fetchNotifications, 60 * 1000); // poll every minute
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // refresh notifications when tasks change elsewhere in the app
  useEffect(() => {
    const handler = () => {
      API.get('/api/tasks/upcoming').then(res => setNotifications(res.data || [])).catch(() => {});
    };
    window.addEventListener('tasks-updated', handler);
    return () => window.removeEventListener('tasks-updated', handler);
  }, []);

  // close notifications when clicking outside
  useEffect(() => {
    if (!showNotifications) return;
    const handleClick = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications]);

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
  }, [setUser]);

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

  const handleCloseProfileModal = () => {
    setShowProfileModal(false);
    setProfileError('');
    setProfileSuccess('');
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      avatarFile: null,
      avatarPreview: user?.avatar || ''
    });
  };

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

  // Let axios/browser set the Content-Type (including multipart boundary)
  const response = await API.put('/api/auth/me/profile', formData);
    
      const updatedUser = response.data.user;
      setUser(updatedUser);  //updates the state in Dashboard
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

  try {
    //validating passwords match
    if (passwordForm.new !== passwordForm.confirm) {
      throw new Error("New passwords don't match");
    }
    
    if (passwordForm.new.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await API.put('/api/auth/me/password', {
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    });
    
    setPasswordSuccess('Password updated successfully');
    
  
    if (response.data.user) {
      setUser(response.data.user);
    }
    
    //clear form and close modal after 1.5 seconds
    setTimeout(() => {
      setPasswordForm({ current: '', new: '', confirm: '' });
      setShowPasswordModal(false);
    }, 1500);
  } catch (err) {
    setPasswordError(err.response?.data?.message || err.message || "Failed to update password");
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
    <header className={`fixed top-0 left-0 right-0 bg-[#323a45] shadow-sm z-30 text-white ${navbarHeight || "h-20"}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0"></div>

          <div className="flex-1 max-w-2xl mx-32 md:ml-15 ">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#778899]" />
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                className="block w-full pl-10 pr-3 py-2 border-2 border-[#3f6184] rounded-md leading-5 bg-[#323a45] placeholder-[#778899] focus:outline-none focus:ring-2 focus:ring-[#5faeb6] focus:border-[#5faeb6] text-base sm:text-lg text-[#f6f7f9]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center space-x-2 focus:outline-none"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                  aria-label="User menu"
                >
                  {/* Notification Bell */}
                  <div className="relative mr-3" ref={notificationsRef}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setShowNotifications((s) => !s); setShowDropdown(false); }}
                      className="p-1 rounded hover:bg-[#5faeb6]/10 focus:outline-none"
                      aria-label="Notifications"
                    >
                      <Bell size={20} className="text-[#f6f7f9]" />
                    </button>
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{notifications.length}</span>
                    )}

                    {showNotifications && (
                      <div className="absolute right-0 top-10 mt-2 w-80 bg-[#f6f7f9] rounded-md shadow-lg py-2 z-50" role="menu" aria-label="Notifications">
                        <div className="px-3 py-2 text-lg text-[#323a45] font-semibold">Upcoming tasks</div>
                        <div className="max-h-48 overflow-auto">
                          {notifications.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-[#778899]">No upcoming tasks</div>
                          ) : (
                            notifications.map((t) => (
                              <button
                                key={t._id}
                                onClick={async (e) => {
                                  // prevent clicks inside notifications from bubbling to parent toggle
                                  e.stopPropagation();
                                  // ensure profile dropdown is closed
                                  setShowDropdown(false);
                                  try {
                                    const res = await API.get(`/api/tasks/${t._id}`);
                                    // emit a global event to open task detail panel with data
                                    window.dispatchEvent(new CustomEvent('open-task', { detail: res.data }));
                                  } catch (err) {
                                    // fallback to searching/navigating
                                    setSearchQuery(t.title);
                                    navigate('/');
                                  } finally {
                                    setShowNotifications(false);
                                  }
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-[#5faeb6]/10 transition-colors text-[#323a45]"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="truncate">{t.title}</span>
                                  <span className="text-xs text-[#778899]">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-base sm:text-lg font-medium text-[#f6f7f9]">
                    {user?.name || 'Loading...'}
                  </span>
                  <img
                    className="h-12 w-12 rounded-full border-2 border-[#5faeb6] object-cover"
                    src={user?.avatar || 'https://www.gravatar.com/avatar/default?s=200&d=mp'}
                    alt="User profile"
                    onError={(e) => {
                      e.target.src = 'https://www.gravatar.com/avatar/default?s=200&d=mp';
                    }}
                  />
                  <ChevronDown size={16} className="text-[#778899]" />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-[#f6f7f9] rounded-md shadow-lg py-1 z-50" role="menu" aria-label="User dropdown menu">
                    <button
                      onClick={() => {
                        setShowProfileModal(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-[#323a45] hover:bg-[#5faeb6]/20 w-full text-left"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordModal(true);
                        setShowDropdown(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-[#323a45] hover:bg-[#5faeb6]/20 w-full text-left"
                    >
                      <Lock size={16} className="mr-2" />
                      Change Password
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-[#323a45] hover:bg-[#5faeb6]/20 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                    <button
                      onClick={handleDeactivate}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-[#5faeb6]/20 w-full text-left"
                    >
                      <UserX size={16} className="mr-2" />
                      Deactivate Account
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Edit Modal */}
              {showProfileModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Edit Profile Modal">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Edit Profile
            </h3>
            
            {/* Removed unused error block */}
            
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
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center">
                    <div className="relative mr-4">
                    <img
                      className="h-20 w-20 rounded-full border-2 border-[#5faeb6] object-cover"
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
                      className="flex items-center px-3 py-2 bg-[#f6f7f9] hover:bg-gray-200 rounded-md text-base text-[#323a45] transition"
                    >
                      <Upload className="mr-2" size={16} />
                      {profileForm.avatarFile ? 'Change' : 'Upload'} Photo
                    </button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, GIF or PNG. Max size 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="text-[#323a45] w-full px-3 py-2 border border-[#3f6184] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg"
                  required
                  autoComplete="name"
                  aria-label="Name"
                />
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="text-[#323a45] w-full px-3 py-2 border border-[#3f6184] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg"
                  required
                  autoComplete="email"
                  aria-label="Email"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowProfileModal(false); handleCloseProfileModal(); handleClosePasswordModal(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-[#323a45] hover:bg-gray-50 transition text-base"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5faeb6] text-white rounded-md hover:bg-[#3f6184] transition flex items-center justify-center text-base"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Change Password Modal">
                  <div 
                    ref={modalRef}
                    className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
                  >
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <Lock className="mr-2" size={20} />
                      Change Password
                    </h3>
                    
                    {/* Removed unused error block */}
                    
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
                        <label className="flex text-base font-semibold text-gray-700 mb-1 items-center">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordForm.current}
                            onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                            className="text-[#323a45] w-full px-3 py-2 border border-[#3f6184] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg"
                            required
                            autoComplete="current-password"
                            aria-label="Current Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-[#5faeb6]"
                          >
                            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="flex text-base font-semibold text-gray-700 mb-1 items-center">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordForm.new}
                            onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                            className="text-[#323a45] w-full px-3 py-2 border border-[#3f6184] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg"
                            required
                            autoComplete="new-password"
                            aria-label="New Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-[#5faeb6]"
                          >
                            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="text-base font-semibold text-gray-700 mb-1 flex items-center">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordForm.confirm}
                            onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                            className="text-[#323a45] w-full px-3 py-2 border border-[#3f6184] rounded-md pr-10 focus:outline-none focus:ring-2 focus:ring-[#5faeb6] text-base sm:text-lg"
                            required
                            autoComplete="new-password"
                            aria-label="Confirm New Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-[#5faeb6]"
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
                          className="px-4 py-2 border border-gray-300 rounded-md text-[#323a45] hover:bg-gray-50 transition text-base"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-[#5faeb6] text-white rounded-md hover:bg-[#3f6184] transition text-base"
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