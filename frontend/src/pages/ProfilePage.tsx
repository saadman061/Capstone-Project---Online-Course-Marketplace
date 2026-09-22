import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { userAPI, authAPI } from '../api/client';
import { RootState } from '../redux/store';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    payoutAccount: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        bio: response.data.bio || '',
        payoutAccount: response.data.payoutAccount || '',
      });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(formData);
      setProfile(response.data);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordChange(false);
      setSuccess('Password changed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary mb-8">My Profile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Profile Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary transition"
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              {profile?.role === 'instructor' && (
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Payout Account</label>
                  <input
                    type="text"
                    value={formData.payoutAccount}
                    onChange={(e) => setFormData({ ...formData, payoutAccount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                    placeholder="Bank account or PayPal email"
                  />
                </div>
              )}

              <button
                type="submit"
                className="bg-primary text-white font-bold py-2 px-6 rounded hover:bg-secondary transition"
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="text-lg font-medium">{profile?.email}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                <p className="text-lg font-medium">{profile?.name}</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="text-lg font-medium capitalize">{profile?.role}</p>
              </div>

              {profile?.bio && (
                <div>
                  <p className="text-gray-600 text-sm">Bio</p>
                  <p className="text-lg">{profile?.bio}</p>
                </div>
              )}

              {profile?.role === 'instructor' && profile?.payoutAccount && (
                <div>
                  <p className="text-gray-600 text-sm">Payout Account</p>
                  <p className="text-lg">{profile?.payoutAccount}</p>
                </div>
              )}

              <div>
                <p className="text-gray-600 text-sm">Member Since</p>
                <p className="text-lg">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">Security</h2>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="bg-secondary text-white px-4 py-2 rounded hover:bg-primary transition"
            >
              {showPasswordChange ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordChange ? (
            <form onSubmit={handlePasswordChange}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-white font-bold py-2 px-6 rounded hover:bg-secondary transition"
              >
                Change Password
              </button>
            </form>
          ) : (
            <p className="text-gray-600">Click "Change Password" to update your password.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
