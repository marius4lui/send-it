import { Platform } from '@/types';

export const detectPlatform = (url: string): Platform => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) {
    return 'instagram';
  }

  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }

  return 'unknown';
};

export const isValidVideoUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    const platform = detectPlatform(url);
    return platform !== 'unknown' && (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
  } catch {
    return false;
  }
};

export const getPlatformName = (platform: Platform): string => {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'tiktok':
      return 'TikTok';
    case 'youtube':
      return 'YouTube';
    default:
      return 'Unknown';
  }
};

export const getPlatformIcon = (platform: Platform): string => {
  switch (platform) {
    case 'instagram':
      return 'camera.fill';
    case 'tiktok':
      return 'music.note';
    case 'youtube':
      return 'play.rectangle.fill';
    default:
      return 'link';
  }
};
