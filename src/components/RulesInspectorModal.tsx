import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  Terminal, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { db } from '../services/firebaseSimulator';

interface RulesInspectorModalProps {
  onClose: () => void;
}

interface TestScenario {
  id: string;
  title: string;
  node: string;
  action: 'read' | 'write';
  asUser: string;
  payload?: any;
  expectedResult: 'ALLOWED' | 'DENIED';
  ruleSnippet: string;
  description: string;
}

export const RulesInspectorModal: React.FC<RulesInspectorModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'testLab'>('testLab');
  const [selectedScenario, setSelectedScenario] = useState<string>('test_room_unjoined');
  const [testOutput, setTestOutput] = useState<{
    result: 'ALLOWED' | 'DENIED';
    message: string;
    evaluatedRule: string;
    passed: boolean;
  } | null>(null);

  const scenarios: TestScenario[] = [
    {
      id: 'test_room_unjoined',
      title: 'Non-Participant reading match_rooms',
      node: 'match_rooms/tourn_bgmi_01',
      action: 'read',
      asUser: 'user_ghost_02 (or unjoined guest)',
      expectedResult: 'DENIED',
      ruleSnippet: `".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('match_participants/'+$matchId+'/'+auth.uid).exists())"`,
      description: 'Checks if an unjoined player can read secret Room ID and Password.'
    },
    {
      id: 'test_room_participant',
      title: 'Registered Participant reading match_rooms',
      node: 'match_rooms/tourn_bgmi_01',
      action: 'read',
      asUser: 'user_viper_01 (Registered in Slot #14)',
      expectedResult: 'ALLOWED',
      ruleSnippet: `".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('match_participants/'+$matchId+'/'+auth.uid).exists())"`,
      description: 'Checks if registered participant has permission to view Room credentials.'
    },
    {
      id: 'test_banned_user_join',
      title: 'Banned User joining tournament',
      node: 'match_participants/tourn_bgmi_01/user_banned_01',
      action: 'write',
      asUser: 'user_banned_01 (CheaterPro99, banned: true)',
      payload: { ign: 'CheatGod', gameUid: '99999', count: 1 },
      expectedResult: 'DENIED',
      ruleSnippet: `".write": "(auth != null && auth.uid === $uid) && root.child('users/'+auth.uid+'/banned').val() !== true && newData.exists()"`,
      description: 'Checks if a banned user can register for tournaments or occupy slots.'
    },
    {
      id: 'test_invalid_entry_fee',
      title: 'Create tournament with entryFee < 10',
      node: 'tournaments/upcoming/tourn_invalid',
      action: 'write',
      asUser: 'admin_super_01',
      payload: { title: 'Mini Match', entryFee: 5, prizePool: 100, totalSpots: 50, game: 'bgmi', time: Date.now() },
      expectedResult: 'DENIED',
      ruleSnippet: `".validate": "newData.hasChildren(['title','entryFee','prizePool','totalSpots','game','time']) && newData.child('entryFee').isNumber() && newData.child('entryFee').val() >= 10"`,
      description: 'Validates that entryFee must be at least ₹10.'
    },
    {
      id: 'test_invalid_prize_pool',
      title: 'Create tournament with prizePool < 50',
      node: 'tournaments/upcoming/tourn_lowprize',
      action: 'write',
      asUser: 'admin_super_01',
      payload: { title: 'Low Pool Match', entryFee: 15, prizePool: 30, totalSpots: 10, game: 'bgmi', time: Date.now() },
      expectedResult: 'DENIED',
      ruleSnippet: `"prizePool": { ".validate": "newData.isNumber() && newData.val() >= 50" }`,
      description: 'Validates that prizePool must be at least ₹50.'
    },
    {
      id: 'test_referral_regex',
      title: 'Referral Code regex validation ($code.matches(/^[A-Z0-9]{4,10}$/))',
      node: 'referralCodes/pro_gamer_1',
      action: 'write',
      asUser: 'user_viper_01',
      expectedResult: 'DENIED',
      ruleSnippet: `".validate": "$code.matches(/^[A-Z0-9]{4,10}$/) && newData.isString()"`,
      description: 'Checks if lowercase characters or underscores are rejected by the regex.'
    },
    {
      id: 'test_referral_valid',
      title: 'Valid Referral Code registration (e.g. VIPER99)',
      node: 'referralCodes/VIPER99',
      action: 'write',
      asUser: 'user_viper_01',
      expectedResult: 'ALLOWED',
      ruleSnippet: `".validate": "$code.matches(/^[A-Z0-9]{4,10}$/) && newData.isString()"`,
      description: 'Checks if valid 4-10 uppercase alphanumeric code passes.'
    },
    {
      id: 'test_staff_match_write',
      title: 'Staff member with matches:true updating tournaments',
      node: 'tournaments/upcoming/tourn_bgmi_01',
      action: 'write',
      asUser: 'staff_member_01 (ops.rohan, permissions.matches: true)',
      payload: { title: 'Updated Title by Staff', entryFee: 30, prizePool: 2400, totalSpots: 100, game: 'bgmi', time: Date.now() },
      expectedResult: 'ALLOWED',
      ruleSnippet: `".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('staff/'+auth.uid+'/active').val() !== false && root.child('staff/'+auth.uid+'/permissions/matches').val() === true)"`,
      description: 'Checks if staff with matches permission can create/manage tournaments.'
    },
    {
      id: 'test_non_admin_config_write',
      title: 'Regular player writing to app_config',
      node: 'app_config',
      action: 'write',
      asUser: 'user_ghost_02',
      expectedResult: 'DENIED',
      ruleSnippet: `".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"`,
      description: 'Ensures only Super Admin can alter platform app_config.'
    },
    {
      id: 'test_user_owner_read',
      title: 'User reading own profile (users/$uid)',
      node: 'users/user_viper_01',
      action: 'read',
      asUser: 'user_viper_01',
      expectedResult: 'ALLOWED',
      ruleSnippet: `".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"`,
      description: 'Allows authenticated user to read their own profile (auth.uid === $uid).'
    },
    {
      id: 'test_user_admin_read',
      title: 'Admin reading any user profile',
      node: 'users/user_viper_01',
      action: 'read',
      asUser: 'admin_super_01',
      expectedResult: 'ALLOWED',
      ruleSnippet: `".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"`,
      description: 'Allows platform admins to inspect any player profile via root.child(\'admins/\'+auth.uid).'
    },
    {
      id: 'test_user_other_read',
      title: 'Non-admin user reading another player profile node',
      node: 'users/user_ghost_02',
      action: 'read',
      asUser: 'user_viper_01',
      expectedResult: 'DENIED',
      ruleSnippet: `".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"`,
      description: 'Rejects read access when user is neither an admin nor the owner ($uid).'
    },
    {
      id: 'test_user_owner_write',
      title: 'User updating own profile data',
      node: 'users/user_viper_01',
      action: 'write',
      asUser: 'user_viper_01',
      expectedResult: 'ALLOWED',
      ruleSnippet: `".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"`,
      description: 'Allows player to update their own account profile settings.'
    },
    {
      id: 'test_user_other_write',
      title: 'Unauthorized player writing to another user\'s profile',
      node: 'users/user_ghost_02',
      action: 'write',
      asUser: 'user_viper_01',
      expectedResult: 'DENIED',
      ruleSnippet: `".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"`,
      description: 'Rejects write access when user is not the account owner and not an admin.'
    }
  ];

  const handleRunTest = (scenario: TestScenario) => {
    let result: 'ALLOWED' | 'DENIED' = 'ALLOWED';
    let message = '';

    if (scenario.id === 'test_room_unjoined') {
      // Test unjoined user
      const check = db.canReadMatchRooms('tourn_bgmi_live', 'user_ghost_02');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_room_participant') {
      const check = db.canReadMatchRooms('tourn_bgmi_01', 'user_viper_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_banned_user_join') {
      const user = db.getState().users['user_banned_01'];
      if (user?.banned) {
        result = 'DENIED';
        message = "Permission Denied: root.child('users/user_banned_01/banned').val() === true. Banned accounts are blocked from write operations.";
      } else {
        result = 'ALLOWED';
        message = 'Allowed';
      }
    } else if (scenario.id === 'test_invalid_entry_fee') {
      const check = db.canWriteTournament('upcoming', 'new_key', scenario.payload, 'admin_super_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_invalid_prize_pool') {
      const check = db.canWriteTournament('upcoming', 'new_key', scenario.payload, 'admin_super_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_referral_regex') {
      const code = 'pro_gamer_1';
      const regex = /^[A-Z0-9]{4,10}$/;
      if (!regex.test(code)) {
        result = 'DENIED';
        message = 'Validation Failed: $code.matches(/^[A-Z0-9]{4,10}$/) returned FALSE. Contains lowercase letters and underscore.';
      } else {
        result = 'ALLOWED';
        message = 'Allowed';
      }
    } else if (scenario.id === 'test_referral_valid') {
      const code = 'VIPER99';
      const regex = /^[A-Z0-9]{4,10}$/;
      if (regex.test(code)) {
        result = 'ALLOWED';
        message = 'Validation Succeeded: Code matches /^[A-Z0-9]{4,10}$/ and string type.';
      } else {
        result = 'DENIED';
        message = 'Validation Failed';
      }
    } else if (scenario.id === 'test_staff_match_write') {
      const check = db.canWriteTournament('upcoming', 'tourn_bgmi_01', scenario.payload, 'staff_member_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_non_admin_config_write') {
      const isAdm = db.isAdmin('user_ghost_02');
      if (!isAdm) {
        result = 'DENIED';
        message = "Permission Denied: root.child('admins/user_ghost_02').val() is not true.";
      } else {
        result = 'ALLOWED';
        message = 'Allowed';
      }
    } else if (scenario.id === 'test_user_owner_read') {
      const check = db.canReadUser('user_viper_01', 'user_viper_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_user_admin_read') {
      const check = db.canReadUser('user_viper_01', 'admin_super_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_user_other_read') {
      const check = db.canReadUser('user_ghost_02', 'user_viper_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_user_owner_write') {
      const check = db.canWriteUser('user_viper_01', {}, 'user_viper_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    } else if (scenario.id === 'test_user_other_write') {
      const check = db.canWriteUser('user_ghost_02', {}, 'user_viper_01');
      result = check.allowed ? 'ALLOWED' : 'DENIED';
      message = check.reason;
    }

    const passed = result === scenario.expectedResult;
    setTestOutput({
      result,
      message,
      evaluatedRule: scenario.ruleSnippet,
      passed
    });
  };

  const currentScenario = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  const fullRulesJson = `{
  "rules": {
    "admins": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid && newData.val() === true && !root.child('app_config/adminCreated').exists()"
      }
    },
    "staff": {
      ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true)",
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)",
        ".validate": "newData.hasChildren(['name','email','active','permissions'])"
      }
    },
    "app_config": {
      ".read": true,
      ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
    },
    "esports_games": {
      ".read": true,
      ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
    },
    "sliders": {
      ".read": true,
      ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
    },
    "notifications": {
      ".read": "auth != null",
      ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
    },
    "referralCodes": {
      "$code": {
        ".read": "auth != null",
        ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && !data.exists() && newData.val() === auth.uid)",
        ".validate": "$code.matches(/^[A-Z0-9]{4,10}$/) && newData.isString()"
      }
    },
    "users": {
      "$uid": {
        ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)",
        ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && auth.uid === $uid)"
      }
    },
    "tournaments": {
      ".read": true,
      "$status": {
        ".validate": "$status === 'upcoming' || $status === 'ongoing' || $status === 'resulted'",
        "$key": {
          ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('staff/'+auth.uid+'/active').val() !== false && root.child('staff/'+auth.uid+'/permissions/matches').val() === true)",
          ".validate": "newData.hasChildren(['title','entryFee','prizePool','totalSpots','game','time']) && newData.child('entryFee').isNumber() && newData.child('entryFee').val() >= 10",
          "title": { ".validate": "newData.isString() && newData.val().length > 2" },
          "entryFee": { ".validate": "newData.isNumber() && newData.val() >= 10 && newData.val() <= 10000" },
          "prizePool": { ".validate": "newData.isNumber() && newData.val() >= 50" },
          "totalSpots": { ".validate": "newData.isNumber() && newData.val() >= 2 && newData.val() <= 100" },
          "game": { ".validate": "newData.isString()" },
          "time": { ".validate": "newData.isNumber()" },
          "joined": {
            ".write": "auth != null && root.child('users/'+auth.uid+'/banned').val() !== true && $status === 'upcoming' && newData.isNumber()",
            ".validate": "newData.isNumber() && newData.val() >= 0"
          },
          "$other": { ".validate": true }
        }
      }
    },
    "match_rooms": {
      "$matchId": {
        ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('match_participants/'+$matchId+'/'+auth.uid).exists())",
        ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
      }
    },
    "match_participants": {
      "$matchId": {
        ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true) || (auth != null && root.child('match_participants/'+$matchId+'/'+auth.uid).exists())",
        "$uid": {
          ".read": "(auth != null && auth.uid === $uid)",
          ".write": "(auth != null && auth.uid === $uid) && root.child('users/'+auth.uid+'/banned').val() !== true && newData.exists()",
          ".validate": "newData.hasChildren(['ign','gameUid','count'])"
        }
      }
    },
    "match_results": {
      "$matchId": {
        ".read": "auth != null",
        ".write": "(auth != null && root.child('admins/'+auth.uid).val() === true)"
      }
    },
    "deposits": {
      ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true)",
      "$uid": {
        ".read": "(auth != null && auth.uid === $uid)",
        "$id": {
          ".write": "(auth != null && auth.uid === $uid)",
          ".validate": "newData.hasChildren(['amount','utr','status','createdAt'])"
        }
      }
    },
    "withdrawals": {
      ".read": "(auth != null && root.child('admins/'+auth.uid).val() === true)",
      "$uid": {
        ".read": "(auth != null && auth.uid === $uid)",
        "$id": {
          ".write": "(auth != null && auth.uid === $uid)",
          ".validate": "newData.hasChildren(['amount','upi','status','createdAt'])"
        }
      }
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-[#0b0e17] border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-gaming text-xl font-bold text-white tracking-wide">
                  Firebase Realtime Database Rules Lab
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                  Active Schema
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live inspection &amp; security rule validation tester
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

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900/60">
          <button
            onClick={() => setActiveTab('testLab')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'testLab'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Interactive Test Lab ({scenarios.length} Scenarios)</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'rules'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Raw Rules JSON</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {activeTab === 'testLab' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: Scenarios List */}
              <div className="md:col-span-5 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Choose Test Case:
                </p>
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {scenarios.map((sc) => {
                    const isSelected = sc.id === selectedScenario;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setSelectedScenario(sc.id);
                          setTestOutput(null);
                        }}
                        className={`w-full text-left p-3 rounded-xl transition border text-xs ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-md shadow-indigo-950/50'
                            : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <span className={`text-[10px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded ${
                            sc.action === 'read' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {sc.action}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            sc.expectedResult === 'ALLOWED'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            Expect: {sc.expectedResult}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-200 leading-snug">
                          {sc.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Scenario Details & Runner */}
              <div className="md:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Target Path: <code className="text-amber-400 font-mono-code lowercase">/{currentScenario.node}</code>
                    </span>
                    <span className="text-xs text-slate-400 font-mono-code">
                      Auth UID: <strong className="text-white">{currentScenario.asUser}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentScenario.description}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono-code text-[11px] text-indigo-300/90 overflow-x-auto">
                    <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Applicable Security Rule:</p>
                    <pre className="whitespace-pre-wrap">{currentScenario.ruleSnippet}</pre>
                  </div>

                  <button
                    onClick={() => handleRunTest(currentScenario)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-indigo-600/30 active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Rule Simulation</span>
                  </button>
                </div>

                {/* Simulation Output */}
                {testOutput && (
                  <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-fade-in ${
                    testOutput.passed ? 'bg-emerald-950/40 border-emerald-800/60' : 'bg-red-950/40 border-red-800/60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-2 text-sm">
                        {testOutput.passed ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-300">TEST PASSED (Expected {currentScenario.expectedResult})</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-400" />
                            <span className="text-red-300">TEST FAILED</span>
                          </>
                        )}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-black font-mono-code text-[11px] uppercase ${
                        testOutput.result === 'ALLOWED' ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
                      }`}>
                        {testOutput.result}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      <strong>Simulator Engine Reason: </strong>
                      {testOutput.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl bg-[#080b12] border border-slate-800 p-4 font-mono-code text-xs text-slate-300 overflow-x-auto max-h-[500px]">
              <pre className="text-slate-300">{fullRulesJson}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Enforcing 14 root nodes with granular role-based permissions &amp; data validators
          </span>
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
