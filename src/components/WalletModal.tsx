import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { db } from '../services/firebaseSimulator';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  currentUser?: UserProfile;
  initialTab?: 'deposit' | 'withdraw' | 'history';
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  currentUser,
  initialTab = 'deposit',
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);

  // Deposit State
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [depLoading, setDepLoading] = useState<boolean>(false);
  const [depMessage, setDepMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [upiId, setUpiId] = useState<string>('');
  const [wdLoading, setWdLoading] = useState<boolean>(false);
  const [wdMessage, setWdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dbState = db.getState();
  const config = dbState.app_config;
  const user = currentUser || db.getCurrentUser();
  const userTxList = dbState.transactions.filter((t) => t.uid === user?.uid);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(config.supportUpi || 'arenax@upi');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleDeposit = (instantApprove: boolean = false) => {
    setDepMessage(null);
    if (!depositAmount || depositAmount < config.minDeposit) {
      setDepMessage({ type: 'error', text: `Minimum deposit is ₹${config.minDeposit}` });
      return;
    }
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 8) {
      setDepMessage({ type: 'error', text: 'Please enter a valid 12-digit UPI UTR number.' });
      return;
    }

    setDepLoading(true);
    const res = db.submitDeposit(depositAmount, cleanUtr, 'UPI Payment');
    setDepLoading(false);

    if (!res.success) {
      setDepMessage({ type: 'error', text: res.message });
    } else {
      // If user selected instant test approval
      if (instantApprove && user) {
        const depKeys = Object.keys(db.getState().deposits[user.uid] || {});
        const lastDepId = depKeys[depKeys.length - 1];
        if (lastDepId) {
          db.approveDeposit(user.uid, lastDepId);
        }
      }
      confetti({ particleCount: 50, spread: 60 });
      setDepMessage({
        type: 'success',
        text: instantApprove
          ? `₹${depositAmount} has been verified and added to your wallet balance!`
          : 'Deposit request submitted! Admin will verify UTR and credit your account shortly.'
      });
      setUtrNumber('');
      onSuccess();
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    setWdMessage(null);
    if (!withdrawAmount || withdrawAmount < config.minWithdraw) {
      setWdMessage({ type: 'error', text: `Minimum withdrawal is ₹${config.minWithdraw}` });
      return;
    }
    if ((user?.winBalance || 0) < withdrawAmount) {
      setWdMessage({
        type: 'error',
        text: `Insufficient Winning Balance. You can only withdraw prize winnings (Available: ₹${user?.winBalance || 0}).`
      });
      return;
    }
    if (!upiId || !upiId.includes('@')) {
      setWdMessage({ type: 'error', text: 'Please enter a valid UPI ID (e.g., yourname@paytm or yourname@okhdfcbank).' });
      return;
    }

    setWdLoading(true);
    const res = db.submitWithdrawal(withdrawAmount, upiId.trim());
    setWdLoading(false);

    if (!res.success) {
      setWdMessage({ type: 'error', text: res.message });
    } else {
      setWdMessage({
        type: 'success',
        text: `Withdrawal request for ₹${withdrawAmount} submitted! Payout will be sent to ${upiId} after review.`
      });
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0f1422] border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-gaming text-lg font-bold text-white tracking-wide">
                Cashier &amp; Wallet Center
              </h3>
              <p className="text-xs text-slate-400">
                Manage deposit balances, winnings &amp; instant payouts
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

        {/* Balance Showcase */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-[#131929] to-slate-900 border-b border-slate-800/80">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Play Balance
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  For Matches
                </span>
              </div>
              <p className="font-gaming text-2xl sm:text-3xl font-black text-white mt-1">
                ₹{user?.walletBalance ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Deposits &amp; bonus cash
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Winning Balance
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Withdrawable
                </span>
              </div>
              <p className="font-gaming text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                ₹{user?.winBalance ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Earned from tournament ranks &amp; kills
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 border-b border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'deposit'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Add Cash (Deposit)</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'withdraw'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Winnings</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Passbook</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* TAB 1: ADD CASH / DEPOSIT */}
          {activeTab === 'deposit' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
                <span className="font-bold text-indigo-200">Firebase Rules Node: </span>
                <code className="font-mono-code text-[11px]">deposits/$uid/$id</code>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Validates: amount, utr, status, createdAt. Wallet balance write limit: 0 to 10,000,000.
                </p>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 block">
                  Select Deposit Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt)}
                      className={`py-2 rounded-xl font-bold font-gaming text-base transition border ${
                        depositAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={config.minDeposit}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm font-bold focus:outline-none focus:border-amber-500"
                    placeholder="Custom amount"
                  />
                </div>
              </div>

              {/* UPI QR & Payment Info */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Pay via any UPI App (GPay, PhonePe, Paytm)</span>
                  </span>
                  <span className="text-emerald-400 font-bold">0% Fee</span>
                </div>

                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official Platform UPI ID</span>
                    <span className="font-mono-code text-xs font-bold text-amber-300 truncate">
                      {config.supportUpi}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 transition shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* UTR Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>12-Digit UPI Ref / UTR Number</span>
                  <span className="text-[10px] text-amber-400">Required for verification</span>
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 420911843210"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm tracking-wider focus:outline-none focus:border-amber-500"
                />
              </div>

              {depMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  depMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
                }`}>
                  {depMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{depMessage.text}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  disabled={depLoading}
                  onClick={() => handleDeposit(true)}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 active:scale-98"
                >
                  ⚡ Instant Credit (Demo)
                </button>
                <button
                  type="button"
                  disabled={depLoading}
                  onClick={() => handleDeposit(false)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs uppercase tracking-wider transition border border-slate-700 active:scale-98"
                >
                  Submit for Admin Approval
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAW WINNINGS */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 text-xs">
                <span className="font-bold text-indigo-200">Firebase Rules Node: </span>
                <code className="font-mono-code text-[11px]">withdrawals/$uid/$id</code>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Validates: amount, upi, status, createdAt. Deducts from winBalance. Admin approval processes payout.
                </p>
              </div>

              {/* Winning balance check */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Eligible Winning Balance:</span>
                <span className="font-mono-code font-bold text-amber-400 text-sm">
                  ₹{user?.winBalance ?? 0}
                </span>
              </div>

              {/* Amount input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Withdrawal Amount</span>
                  <span className="text-[10px] text-slate-400">Min: ₹{config.minWithdraw}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min={config.minWithdraw}
                    max={user?.winBalance || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Recipient UPI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Your UPI ID / VPA</span>
                  <span className="text-[10px] text-emerald-400">Instant transfer</span>
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@okhdfcbank"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono-code text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {wdMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  wdMessage.type === 'success' ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' : 'bg-red-950/60 border-red-800 text-red-300'
                }`}>
                  {wdMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{wdMessage.text}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={wdLoading || (user?.winBalance || 0) < config.minWithdraw}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                    (user?.winBalance || 0) < config.minWithdraw
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/20 active:scale-98'
                  }`}
                >
                  {wdLoading ? 'Submitting Request...' : `Withdraw ₹${withdrawAmount} to UPI`}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PASSBOOK / TRANSACTIONS */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              {userTxList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No transaction history recorded yet.
                </div>
              ) : (
                userTxList.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isPositive ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(tx.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`font-mono-code font-bold ${isPositive ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {isPositive ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                        </p>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                          tx.status === 'success'
                            ? 'bg-emerald-950 text-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-red-950 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800/80 flex justify-end">
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
