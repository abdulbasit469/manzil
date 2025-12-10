import { motion } from 'motion/react';
import { Save, Bell, Lock, Database, Mail, Globe, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'sonner';

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

export function AdminSettingsPage() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const [settings, setSettings] = useState({
    siteName: 'MANZIL',
    siteEmail: 'admin@manzil.com',
    notificationsEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
    autoApprove: false,
    dbStatus: 'Connected',
    lastBackup: new Date().toISOString(),
    platformVersion: 'v2.4.1'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Fetch settings from backend
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        setSettings(prev => ({
          ...prev,
          ...response.data.settings
        }));
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh settings every 10 seconds to get real-time updates for database status and backup
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSettings();
    }, 10000); // Refresh every 10 seconds for real-time updates

    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async () => {
    // Validate required fields
    if (!settings.siteName || settings.siteName.trim() === '') {
      toast.error('Site Name is required');
      return;
    }

    if (!settings.siteEmail || settings.siteEmail.trim() === '') {
      toast.error('Admin Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.siteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/admin/settings', {
        siteName: settings.siteName.trim(),
        siteEmail: settings.siteEmail.trim(),
        maintenanceMode: settings.maintenanceMode,
        notificationsEnabled: settings.notificationsEnabled,
        emailNotifications: settings.emailNotifications,
        autoApprove: settings.autoApprove
      });
      
      if (response.data.success) {
        toast.success('All settings saved successfully');
        // Refresh settings to get updated data
        await fetchSettings();
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    
    try {
      setChangingPassword(true);
      const response = await api.put('/admin/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.data.success) {
        toast.success('Password updated successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">System Settings</h2>
          <p className="text-slate-600">Manage platform configuration and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl">General Settings</h3>
            <p className="text-sm text-slate-600">Basic platform configuration</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-slate-700">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-slate-700">
              Admin Email
            </label>
            <input
              type="email"
              value={settings.siteEmail}
              onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium">Maintenance Mode</div>
                <div className="text-sm text-slate-600">Temporarily disable public access</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl">Notification Settings</h3>
            <p className="text-sm text-slate-600">Configure notification preferences</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium">System Notifications</div>
                <div className="text-sm text-slate-600">Receive platform alerts and updates</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-slate-600">Send email alerts for important events</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl">Security Settings</h3>
            <p className="text-sm text-slate-600">Manage security and authentication</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-slate-600" />
              <div className="font-medium">Change Admin Password</div>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Current password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="New password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button 
                type="submit"
                disabled={changingPassword}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg disabled:opacity-50"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Community Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-slate-200 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl">Community Settings</h3>
            <p className="text-sm text-slate-600">Configure community moderation</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium">Auto-Approve Posts</div>
                <div className="text-sm text-slate-600">Automatically approve new posts without review</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApprove}
                onChange={(e) => setSettings({ ...settings, autoApprove: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* System Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-300 p-6"
      >
        <h3 className="text-xl mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Platform Version</div>
            <div className="text-lg">v2.4.1</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Database Status</div>
            <div className={`text-lg ${settings.dbStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}`}>
              {settings.dbStatus || 'Checking...'}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Last Backup</div>
            <div className="text-lg">
              {settings.lastBackup ? formatTimeAgo(new Date(settings.lastBackup)) : 'Never'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
