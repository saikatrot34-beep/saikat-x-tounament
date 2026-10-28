import React from 'react';
import { X, Bell, Trophy, Key, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '../types';
import { db } from '../services/firebaseSimulator';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onClear: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onClear
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Notifications &amp; Alerts
              </h3>
              <p className="text-xs text-slate-400">
                Match updates, room releases and reward payouts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
            <span className="font-bold text-indigo-200">Firebase Node: </span>
            <code className="font-mono-code text-[11px]">notifications</code>
            <p className="text-[11px] opacity-80 mt-0.5">
              Read: auth != null | Write: Admin only
            </p>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No new notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => {
              const isMatch = notif.type === 'match';
              const isReward = notif.type === 'reward';

              return (
                <div
                  key={notif.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200 flex items-center gap-1.5">
                      {isMatch ? (
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                      ) : isReward ? (
                        <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{notif.title}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{notif.date}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-5">
                    {notif.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
