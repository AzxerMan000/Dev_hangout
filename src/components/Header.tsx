import React, { useState } from 'react';
import { Search, Plus, MessageCircle, Wallet, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface HeaderProps {
  onUploadClick: () => void;
  onChatClick: () => void;
  onWalletClick: () => void;
}

export default function Header({ onUploadClick, onChatClick, onWalletClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                StreamSpace
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search content, creators, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* Upload Button */}
                  <button
                    onClick={onUploadClick}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Upload</span>
                  </button>

                  {/* Chat Button */}
                  <button
                    onClick={onChatClick}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </button>

                  {/* Wallet Button */}
                  <button
                    onClick={onWalletClick}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">
                      ${(user.wallet_balance || 0).toFixed(2)}
                    </span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt={user.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 top-12 bg-gray-800 rounded-lg shadow-lg py-2 w-48">
                        <div className="px-4 py-2 border-b border-gray-700">
                          <p className="text-white font-semibold">{user.display_name}</p>
                          <p className="text-gray-400 text-sm">@{user.username}</p>
                        </div>
                        
                        <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Profile
                        </button>
                        
                        <button className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}