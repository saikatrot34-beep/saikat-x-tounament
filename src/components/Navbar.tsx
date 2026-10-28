import React, { useState } from 'react';
import { 
  Shield, 
  Gamepad2, 
  Wallet, 
  Trophy, 
  Bell, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Plus, 
  Crown,
  Users,
  ExternalLink,
  Code2,
  Sparkles,
  History
} from 'lucide-react';
import { db } from '../services/firebaseSimulator';
import { UserProfile } from '../types';

interface NavbarProps {
  currentUser?: UserProfile;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenRulesInspector: () => void;
  onOpenReferral: () => void;
  onOpenLeaderboard: () => void;
  onOpenHistory: () => void;
  onToggleAdminView: () => void;
  isAdminView: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenWallet,
  onOpenNotifications,
  onOpenRulesInspector,
  onOpenReferral,
  onOpenLeaderboard,
  onOpenHistory,
  onToggleAdminView,
  isAdminView
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dbState = db.getState();
  const isAdmin = db.isAdmin();
  const isStaff = db.isStaffWithMatches();

  const handleSwitchUser = (uid: string) => {
    db.setAuthUser(uid);
    setUserDropdownOpen(false);
  };

  const usersList = Object.values(dbState.users);
  const unreadNotifs = dbState.notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-[#0b0e17]/95 backdrop-blur-md border-b border-gray-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-lg shadow-orange-600/30">
            <Gamepad2 className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0b0e17]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-gaming text-2xl font-black tracking-wider bg-gradient-to-r from-white via-slate-100 to-amber-400 bg-clip-text text-transparent">
                {dbState.app_config.appName || 'ARENAX'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                PRO ESPORTS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Daily Scrims &amp; Paid Tournaments
            </p>
          </div>
        </div>

        {/* Center / Navigation Quick Links */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition shadow-sm"
            title="View Global Leaderboard Top 5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-200 font-bold">Top 5</span>
          </button>

          <button
            onClick={onOpenRulesInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition shadow-sm hover:shadow-indigo-500/10"
            title="Inspect & Test Firebase Realtime Database Security Rules"
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Rules Inspector</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-500/30 text-indigo-200">Live</span>
          </button>

          <button
            onClick={onOpenReferral}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/40 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refer &amp; Earn ₹25</span>
          </button>

          {(isAdmin || isStaff) && (
            <button
              onClick={onToggleAdminView}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition border ${
                isAdminView
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 border-amber-600/40'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{isAdminView ? 'Exit Admin Portal' : 'Admin Portal'}</span>
            </button>
          )}
        </div>

        {/* Right Action Icons: Wallet, Notifications, User Switcher */}
        <div className="flex items-center gap-3">
          {/* Wallet Balance Chip */}
          {currentUser && (
            <button
              onClick={onOpenWallet}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-amber-500/50 transition-all shadow-inner"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white font-mono-code">
                    ₹{currentUser.walletBalance}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono-code font-semibold" title="Withdrawable Winnings">
                    (+₹{currentUser.winBalance})
                  </span>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <span>Wallet</span>
                  <Plus className="w-2.5 h-2.5 text-amber-400" />
                </div>
              </div>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* User & Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 transition"
            >
              <img
                src={currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Gamer'}
                alt={currentUser?.username}
                className="w-7 h-7 rounded-lg bg-slate-800 object-cover border border-slate-700"
              />
              <div className="hidden sm:block text-left text-xs">
                <p className="font-semibold text-slate-200 leading-tight flex items-center gap-1">
                  {currentUser?.username || 'Guest'}
                  {currentUser?.banned && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800">
                      Banned
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {isAdmin ? '👑 Super Admin' : isStaff ? '🛡️ Staff Ops' : '🎮 Player'}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0f1422] border border-slate-800 shadow-2xl z-50 p-2 overflow-hidden">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Test Account / Role
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Test permissions matching Firebase security rules:
                  </p>
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {usersList.map((user) => {
                    const isSelected = user.uid === currentUser?.uid;
                    const userIsAdmin = !!dbState.admins[user.uid];
                    const userIsStaff = !!dbState.staff[user.uid]?.active;

                    return (
                      <button
                        key={user.uid}
                        onClick={() => handleSwitchUser(user.uid)}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-200'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-8 h-8 rounded-lg bg-slate-800 object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold flex items-center gap-1.5">
                              {user.username}
                              {userIsAdmin && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  Admin
                                </span>
                              )}
                              {userIsStaff && !userIsAdmin && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                  Staff
                                </span>
                              )}
                              {user.banned && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                                  Banned
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2">
                              <span>Wallet: ₹{user.walletBalance}</span>
                              <span>•</span>
                              <span>Win: ₹{user.winBalance}</span>
                            </div>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 space-y-1">
                  <button
                    onClick={() => {
                      onOpenHistory();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-950/40 transition"
                  >
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>My Tournament History</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenRulesInspector();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 hover:bg-indigo-950/40"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open Rules Validator Test Lab</span>
                  </button>
                  <button
                    onClick={() => {
                      db.resetAllData();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-950/30"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Reset Database to Seed State</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
