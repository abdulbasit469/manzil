import { motion } from 'motion/react';
import { Save, Bell, Lock, Database, Mail, Globe, Shield, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

export function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'MANZIL',
    siteEmail: 'admin@manzil.com',
    notificationsEnabled: true,
    emailNotifications: true,
    maintenanceMode: false,
    autoApprove: false,
    twoFactorAuth: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl mb-2">System Settings</h2>
          <p className="text-slate-600">Manage platform configuration and preferences</p>
        </div>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
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
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-600" />
              <div>
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-slate-600">Require 2FA for admin login</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-5 h-5 text-slate-600" />
              <div className="font-medium">Change Admin Password</div>
            </div>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <Button className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg">
                Update Password
              </Button>
            </div>
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
            <div className="text-lg text-green-600">Connected</div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-sm text-slate-600 mb-1">Last Backup</div>
            <div className="text-lg">2 hours ago</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
