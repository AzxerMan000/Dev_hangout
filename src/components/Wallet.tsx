import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, TrendingUp, Plus, Minus, History, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Transaction } from '../types';

interface WalletProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Wallet({ isOpen, onClose }: WalletProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'topup' | 'history'>('overview');
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    if (isOpen && user) {
      fetchTransactions();
    }
  }, [isOpen, user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topupAmount);
    if (!amount || amount <= 0 || !user) return;

    try {
      // In a real app, you would integrate with Google Pay here
      // For now, we'll simulate a successful payment
      
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: amount,
          description: `Wallet top-up via Google Pay`,
          status: 'completed',
        });

      if (transactionError) throw transactionError;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('users')
        .update({ wallet_balance: user.wallet_balance + amount })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      setTopupAmount('');
      fetchTransactions();
      alert('Wallet topped up successfully!');
    } catch (error) {
      console.error('Error topping up wallet:', error);
      alert('Failed to top up wallet. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Plus className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <Minus className="w-5 h-5 text-red-500" />;
      case 'earning':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
          {[
            { key: 'overview', label: 'Overview', icon: CreditCard },
            { key: 'topup', label: 'Top Up', icon: Plus },
            { key: 'history', label: 'History', icon: History }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
                activeTab === key
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
              <div className="text-white/80 text-sm mb-2">Current Balance</div>
              <div className="text-white text-3xl font-bold mb-4">
                {formatCurrency(user?.wallet_balance || 0)}
              </div>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>+12.5% this month</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Total Earned</span>
                </div>
                <div className="text-white text-xl font-bold">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'earning' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-semibold">Total Deposits</span>
                </div>
                <div className="text-white text-xl font-bold">
                  {formatCurrency(
                    transactions
                      .filter(t => t.type === 'deposit' && t.status === 'completed')
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Up Tab */}
        {activeTab === 'topup' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">Add Funds to Your Wallet</h3>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopupAmount(amount.toString())}
                    className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-400 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">Google Pay Integration</span>
                </div>
                <p className="text-blue-300 text-sm">
                  In production, this would integrate with Google Pay for secure payments. 
                  For demo purposes, funds will be added directly to your account.
                </p>
              </div>

              <button
                onClick={handleTopUp}
                disabled={!topupAmount || parseFloat(topupAmount) <= 0}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
              >
                Add {topupAmount ? formatCurrency(parseFloat(topupAmount)) : 'Funds'}
              </button>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <h4 className="text-white font-semibold capitalize">
                          {transaction.type.replace('_', ' ')}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {transaction.description}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(transaction.created_at).toLocaleDateString()} at{' '}
                          {new Date(transaction.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        transaction.type === 'deposit' || transaction.type === 'earning'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'earning' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                        transaction.status === 'completed'
                          ? 'bg-green-900/30 text-green-400'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No transactions yet</h3>
                <p className="text-gray-400">Your transaction history will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}