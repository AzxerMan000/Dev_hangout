import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import ContentFeed from './components/ContentFeed';
import UploadModal from './components/UploadModal';
import Chat from './components/Chat';
import Wallet from './components/Wallet';

function App() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWallet, setShowWallet] = useState(false);

  const handleUploadComplete = () => {
    // Refresh the content feed or update state as needed
    window.location.reload(); // Simple refresh for demo
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-950">
        <Header
          onUploadClick={() => setShowUploadModal(true)}
          onChatClick={() => setShowChat(true)}
          onWalletClick={() => setShowWallet(true)}
        />
        
        <main>
          <ContentFeed />
        </main>

        {/* Modals */}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
        
        <Chat
          isOpen={showChat}
          onClose={() => setShowChat(false)}
        />
        
        <Wallet
          isOpen={showWallet}
          onClose={() => setShowWallet(false)}
        />
      </div>
    </AuthProvider>
  );
}

export default App;