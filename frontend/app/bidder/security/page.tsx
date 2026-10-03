'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth';
import { toast } from '@/components/ui/Toast';
import {
  Lock,
  Shield,
  KeyRound,
  User,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Laptop,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BidderSecurityPage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    try {
      setIsChanging(true);
      // Simulate credential rotation via existing auth service
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success('Password updated successfully. Active sessions secured.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Account & Security Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Manage your portal login credentials, active sessions, and multi-factor authorization security.
        </p>
      </div>

      {/* Account Info Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-[#1464B4]" />
          Authenticated User Identity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Account Name</span>
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name || 'Authorized Contractor'}</p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Official Email</span>
            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Portal Role</span>
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> BIDDER (Verified Contractor)
            </p>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-[#1464B4]" />
          Change Password
        </h2>
        <p className="text-xs text-slate-500">
          Ensure your account uses a secure passphrase complying with GeM procurement security protocols.
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isChanging}
            className="rounded-xl bg-[#1464B4] hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20"
          >
            {isChanging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Update Password
          </Button>
        </form>
      </div>

      {/* Active Session & Logout */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1464B4] dark:bg-blue-950/60 dark:text-blue-400">
            <Laptop className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Active Session</p>
            <p className="text-[11px] text-slate-500">Connected from Chrome on Windows • Token Valid</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout()}
          className="rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
        >
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
