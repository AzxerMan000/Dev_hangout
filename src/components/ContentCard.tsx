import React from 'react';
import { Heart, MessageCircle, Share, Eye, Clock } from 'lucide-react';
import { Content } from '../types';
import VideoPlayer from './VideoPlayer';

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors group">
      {/* Content Preview */}
      <div className="relative aspect-video bg-gray-900">
        {content.content_type === 'video' || content.content_type === 'short' ? (
          <VideoPlayer
            src={content.file_url}
            poster={content.thumbnail_url}
            title={content.title}
            className="w-full h-full"
          />
        ) : (
          <img
            src={content.file_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Duration Badge */}
        {content.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(content.duration)}
          </div>
        )}

        {/* Content Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            content.content_type === 'video' 
              ? 'bg-blue-600 text-white' 
              : content.content_type === 'short'
              ? 'bg-pink-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {content.content_type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <img
            src={content.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${content.user?.username}`}
            alt={content.user?.display_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
              {content.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{content.user?.display_name}</span>
              <span>•</span>
              <span>{formatTimeAgo(content.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {content.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {content.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatCount(content.views_count)}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {formatCount(content.likes_count)}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {formatCount(content.comments_count)}
            </div>
          </div>
          <button className="p-1 hover:text-white transition-colors">
            <Share className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}