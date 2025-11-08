import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import ImageUpload from '../components/gallery/ImageUpload';
import ImageGallery from '../components/gallery/ImageGallery';
import ChatInterface from '../components/chat/ChatInterface';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import FloatingLogos from '../components/ui/FloatingLogos';

const DashboardPage = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' or 'chat'
  const [selectedImage, setSelectedImage] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen relative">
      {/* Floating logo bubbles in background */}
      <FloatingLogos />
      {/* Header */}
      <header className="glass-card mb-6 sticky top-0 z-10 animate-slide-in-left">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="https://mehh.ae/images/logo2.png"
                alt="Logo"
                className="h-10 w-auto"
              />
              <h1 className="text-2xl font-bold text-white">AI Image Archive</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant={activeTab === 'gallery' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('gallery')}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Gallery
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('chat')}
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                AI Assistant
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8 relative z-10">
        {activeTab === 'gallery' ? (
          <div className="space-y-6 animate-fade-in">
            <ImageUpload />
            <ImageGallery onImageSelect={setSelectedImage} />
          </div>
        ) : (
          <Card className="h-[calc(100vh-200px)] animate-fade-in">
            <ChatInterface />
          </Card>
        )}
      </main>

      {/* Selected Image Modal (simplified) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Card className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.file_path}
              alt={selectedImage.filename}
              className="w-full h-auto rounded-lg"
            />
            <div className="mt-4">
              <h3 className="text-xl font-semibold text-white mb-2">
                {selectedImage.filename}
              </h3>
              <p className="text-white/60 mb-3">{selectedImage.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedImage.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {tag.tag} ({(parseFloat(tag.confidence) * 100).toFixed(0)}%)
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setSelectedImage(null)}>Close</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
