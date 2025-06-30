import React, { useState } from 'react';
import { User, Shield, Bell, Download, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, updateProfile, signOut, loading } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateError, setUpdateError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');
    setUpdateMessage('');

    const result = await updateProfile({ name: name.trim() });
    
    if (result.success) {
      setUpdateMessage('Profile updated successfully!');
      setTimeout(() => setUpdateMessage(''), 3000);
    } else {
      setUpdateError(result.error || 'Failed to update profile');
    }
    
    setIsUpdating(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return;
    }

    if (!confirm('This will permanently delete all your capsules, access keys, and account data. Type "DELETE" to confirm.')) {
      return;
    }

    // In a real implementation, you would call a delete account function
    alert('Account deletion is not implemented in this demo. In production, this would permanently delete your account.');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/70">
          Manage your account and security preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">User Profile</h2>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {updateMessage && (
            <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <p className="text-green-200 text-sm">{updateMessage}</p>
              </div>
            </div>
          )}

          {updateError && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-300" />
                <p className="text-red-200 text-sm">{updateError}</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isUpdating}
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/60 placeholder-white/50 focus:outline-none cursor-not-allowed"
                disabled
              />
              <p className="text-white/50 text-xs mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* User Info Display */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-200 font-medium mb-2">Account Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-200/90"><strong>User ID:</strong></p>
                <p className="text-blue-200/70 font-mono text-xs">{user?.id}</p>
              </div>
              <div>
                <p className="text-blue-200/90"><strong>Member since:</strong></p>
                <p className="text-blue-200/70">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-blue-200/90"><strong>Last updated:</strong></p>
                <p className="text-blue-200/70">{user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-blue-200/90"><strong>Authentication:</strong></p>
                <p className="text-blue-200/70">Supabase Auth</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-start">
            <button
              type="submit"
              disabled={isUpdating || loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h3 className="text-white font-medium">Change Password</h3>
              <p className="text-white/60 text-sm">Update your access password</p>
            </div>
            <button className="text-purple-300 hover:text-purple-200 font-medium">
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h3 className="text-white font-medium">Two-Factor Authentication</h3>
              <p className="text-white/60 text-sm">Add an extra layer of security</p>
            </div>
            <button className="text-purple-300 hover:text-purple-200 font-medium">
              Configure
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h3 className="text-white font-medium">Active Sessions</h3>
              <p className="text-white/60 text-sm">Manage your connected devices</p>
            </div>
            <button className="text-purple-300 hover:text-purple-200 font-medium">
              View Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Activity Reminders</h3>
              <p className="text-white/60 text-sm">Receive reminders to keep your account active</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Security Alerts</h3>
              <p className="text-white/60 text-sm">Notifications about suspicious activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">System Updates</h3>
              <p className="text-white/60 text-sm">Information about new features</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Data Management</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
            <div>
              <h3 className="text-white font-medium">Export Data</h3>
              <p className="text-white/60 text-sm">Download a copy of all your information</p>
            </div>
            <button className="text-blue-300 hover:text-blue-200 font-medium">
              Export
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <div>
              <h3 className="text-white font-medium">Delete Account</h3>
              <p className="text-red-300 text-sm">This action cannot be undone</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="text-red-300 hover:text-red-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="text-center">
        <button
          onClick={signOut}
          disabled={loading}
          className="flex items-center space-x-2 mx-auto px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;