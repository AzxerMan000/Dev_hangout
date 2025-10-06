import React, { useState, useRef } from 'react';
import { X, Upload, Video, Image, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: () => void;
}

export default function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<'video' | 'image' | 'short'>('video');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    
    // Auto-detect content type based on file
    if (file.type.startsWith('image/')) {
      setContentType('image');
    } else if (file.type.startsWith('video/')) {
      // Check if it's a short video (less than 60 seconds)
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        if (video.duration <= 60) {
          setContentType('short');
        } else {
          setContentType('video');
        }
        URL.revokeObjectURL(video.src);
      };
    }
    
    // Auto-generate title from filename
    if (!title) {
      const name = file.name.replace(/\.[^/.]+$/, '');
      setTitle(name.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || !user || !title.trim()) return;

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('content')
        .upload(fileName, selectedFile, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('content')
        .getPublicUrl(fileName);

      // Generate thumbnail for videos (placeholder implementation)
      let thumbnailUrl = '';
      if (contentType === 'video' || contentType === 'short') {
        // In a real app, you'd generate a thumbnail from the video
        thumbnailUrl = `https://images.pexels.com/photos/3844788/pexels-photo-3844788.jpeg?auto=compress&cs=tinysrgb&w=400`;
      }

      // Get video duration for videos
      let duration = 0;
      if (contentType === 'video' || contentType === 'short') {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(selectedFile);
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            duration = Math.floor(video.duration);
            URL.revokeObjectURL(video.src);
            resolve(null);
          };
        });
      }

      // Save content metadata to database
      const { error: dbError } = await supabase
        .from('content')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          file_url: publicUrl,
          thumbnail_url: thumbnailUrl || null,
          content_type: contentType,
          duration: duration || null,
          file_size: selectedFile.size,
          views_count: 0,
          likes_count: 0,
          comments_count: 0,
        });

      if (dbError) throw dbError;

      onUploadComplete();
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setContentType('video');
    setUploadProgress(0);
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Upload Content</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!selectedFile ? (
          /* File Selection */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Drop your files here or click to browse
            </h3>
            <p className="text-gray-400 mb-4">
              Supports videos, images, and short clips
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Choose Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          /* Upload Form */
          <div className="space-y-6">
            {/* File Preview */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                {selectedFile.type.startsWith('image/') ? (
                  <Image className="w-8 h-8 text-green-500" />
                ) : contentType === 'short' ? (
                  <Zap className="w-8 h-8 text-pink-500" />
                ) : (
                  <Video className="w-8 h-8 text-blue-500" />
                )}
                <div className="flex-1">
                  <h4 className="text-white font-semibold">{selectedFile.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-white font-semibold mb-2">Content Type</label>
              <div className="flex gap-2">
                {[
                  { key: 'video', label: 'Video', icon: Video, color: 'blue' },
                  { key: 'short', label: 'Short', icon: Zap, color: 'pink' },
                  { key: 'image', label: 'Image', icon: Image, color: 'green' }
                ].map(({ key, label, icon: Icon, color }) => (
                  <button
                    key={key}
                    onClick={() => setContentType(key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      contentType === key
                        ? color === 'blue' ? 'bg-blue-600 text-white'
                        : color === 'pink' ? 'bg-pink-600 text-white'
                        : 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-white font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your content a catchy title..."
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-white font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your content..."
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">Uploading...</span>
                  <span className="text-gray-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleClose}
                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={uploadFile}
                disabled={!title.trim() || uploading}
                className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}