import { Platform } from '@/types';

interface ExtractedContent {
  title?: string;
  description?: string;
  hashtags: string[];
}

/**
 * Extrahiert Titel, Beschreibung und Hashtags aus einer URL
 */
export const extractContentFromUrl = async (url: string, platform: Platform): Promise<ExtractedContent> => {
  const hashtags: string[] = [];
  let title: string | undefined;
  let description: string | undefined;

  // Extrahiere Hashtags aus der URL
  const hashtagMatches = url.match(/#[\w\u00C0-\u024F]+/g);
  if (hashtagMatches) {
    hashtags.push(...hashtagMatches);
  }

  // Platform-spezifische Extraktion
  try {
    switch (platform) {
      case 'instagram':
        title = extractInstagramInfo(url);
        break;
      case 'tiktok':
        title = extractTikTokInfo(url);
        break;
      case 'youtube':
        title = extractYouTubeInfo(url);
        break;
    }
  } catch (error) {
    console.error('Error extracting content:', error);
  }

  return {
    title,
    description,
    hashtags,
  };
};

const extractInstagramInfo = (url: string): string | undefined => {
  // Versuche Reel/Post ID zu extrahieren
  const reelMatch = url.match(/\/reel\/([^/?]+)/);
  const postMatch = url.match(/\/p\/([^/?]+)/);

  if (reelMatch) {
    return `Instagram Reel`;
  } else if (postMatch) {
    return `Instagram Post`;
  }

  return 'Instagram Content';
};

const extractTikTokInfo = (url: string): string | undefined => {
  // Versuche Video ID zu extrahieren
  const videoMatch = url.match(/\/video\/(\d+)/);

  if (videoMatch) {
    return `TikTok Video`;
  }

  return 'TikTok Content';
};

const extractYouTubeInfo = (url: string): string | undefined => {
  // Versuche Video ID zu extrahieren
  const videoIdMatch = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);

  if (videoIdMatch) {
    return `YouTube Video`;
  }

  // Shorts
  if (url.includes('/shorts/')) {
    return 'YouTube Short';
  }

  return 'YouTube Content';
};

/**
 * Extrahiert Hashtags aus einem Text
 */
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\w\u00C0-\u024F]+/g);
  return matches || [];
};

/**
 * Generiert einen Smart Title basierend auf Hashtags und Platform
 */
export const generateSmartTitle = (hashtags: string[], platform: Platform): string => {
  if (hashtags.length === 0) {
    return `${getPlatformEmoji(platform)} New ${getPlatformName(platform)} Video`;
  }

  const mainHashtag = hashtags[0].replace('#', '');
  const formatted = mainHashtag.charAt(0).toUpperCase() + mainHashtag.slice(1);

  return `${getPlatformEmoji(platform)} ${formatted}`;
};

const getPlatformEmoji = (platform: Platform): string => {
  switch (platform) {
    case 'instagram':
      return '📸';
    case 'tiktok':
      return '🎵';
    case 'youtube':
      return '▶️';
    default:
      return '📹';
  }
};

const getPlatformName = (platform: Platform): string => {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'youtube':
      return 'YouTube';
    default:
      return 'Video';
  }
};
