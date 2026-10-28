import React, { useState } from 'react';
import { X, Key, Shield, ShieldCheck, ShieldAlert, Copy, Check, ExternalLink, AlertTriangle, Users } from 'lucide-react';
import { Tournament, MatchParticipant, UserProfile } from '../types';
import { db } from '../services/firebaseSimulator';

interface MatchRoomModalProps {
  tournament: Tournament;
  currentUser?: UserProfile;
  participant?: MatchParticipant;
  onClose: () => void;
  onOpenJoin: () => void;
}

export const MatchRoomModal: React.FC<MatchRoomModalProps> = ({
  tournament,
  currentUser,
  participant,
  onClose,
  onOpenJoin
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const dbState = db.getState();
  const room = dbState.match_rooms[tournament.key];
  const ruleCheck = db.canReadMatchRooms(tournament.key);
  const isAdmin = db.isAdmin();

  const handleCopy = (text: string, type: 'id' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ruleCheck.allowed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Custom Match Room Lockbox
              </h3>
              <p className="text-xs text-slate-400">
                {tournament.title}
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

        <div className="p-5 sm:p-6 space-y-4">
          {/* Real Security Rule Inspection Banner */}
          <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
            ruleCheck.allowed 
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300' 
              : 'bg-red-950/40 border-red-800/50 text-red-300'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {ruleCheck.allowed ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
                <span>Firebase Security Rule: match_rooms/$matchId/.read</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                ruleCheck.allowed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
              }`}>
                {ruleCheck.allowed ? 'READ ALLOWED' : 'READ PERMISSION DENIED'}
              </span>
            </div>
            <p className="text-[11px] font-mono-code text-slate-300/90 leading-tight">
              (auth != null && admins[auth.uid] == true) || (auth != null && match_participants[matchId][auth.uid].exists())
            </p>
            <p className="text-[11px] opacity-90">
              Evaluation: {ruleCheck.reason}
            </p>
          </div>

          {/* If NOT Allowed: Locked State */}
          {!ruleCheck.allowed ? (
            <div className="text-center py-6 px-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="font-gaming text-lg font-bold text-white">
                Room Credentials are Confidential
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The Firebase Security Rule restricts Custom Room ID and Password access exclusively to participants registered in <code className="text-amber-400">match_participants/{tournament.key}</code>.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenJoin();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20"
                >
                  Join Tournament to Unlock Room
                </button>
              </div>
            </div>
          ) : !room ? (
            /* Allowed, but Admin hasn't published Room ID yet */
            <div className="text-center py-6 px-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Key className="w-6 h-6" />
              </div>
              <h4 className="font-gaming text-lg font-bold text-white">
                Room Credentials Pending Release
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You are confirmed in <strong>Slot #{participant?.slotNo || 1}</strong>. The room host will release the Room ID &amp; Password approximately 15 minutes before the match start time.
              </p>
              <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs">
                Check back shortly or keep your notifications enabled.
              </div>
            </div>
          ) : (
            /* Allowed and Room Credentials Available! */
            <div className="space-y-4">
              {participant && (
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Your Slot: <strong className="text-emerald-400 font-mono-code">#{participant.slotNo}</strong></span>
                  </div>
                  <div className="text-xs text-slate-400">
                    IGN: <span className="text-white font-semibold">{participant.ign}</span>
                  </div>
                </div>
              )}

              {/* Room ID and Password Display Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Room ID Card */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-semibold uppercase">
                    <span>Room ID</span>
                    <button
                      onClick={() => handleCopy(room.roomId, 'id')}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                      title="Copy Room ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono-code text-2xl font-black text-amber-400 tracking-wider">
                    {room.roomId}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {copiedId ? 'Copied to clipboard!' : 'Click icon to copy'}
                  </p>
                </div>

                {/* Password Card */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/40 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-semibold uppercase">
                    <span>Password</span>
                    <button
                      onClick={() => handleCopy(room.password, 'pass')}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                      title="Copy Password"
                    >
                      {copiedPass ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="font-mono-code text-2xl font-black text-white tracking-wider">
                    {room.password}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {copiedPass ? 'Copied to clipboard!' : 'Click icon to copy'}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Room Host Instructions:
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-mono-code">
                  {room.instructions}
                </p>
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <p>⚠️ <strong>Important Rules:</strong></p>
                  <p>1. Sit ONLY in your assigned slot (#{participant?.slotNo || 'Admin'}). Sitting in wrong slots leads to room kick.</p>
                  <p>2. Taking match result screenshot is required for kill &amp; prize confirmation.</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
