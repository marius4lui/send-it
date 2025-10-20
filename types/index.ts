export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'unknown';

export interface Video {
  id: string;
  url: string;
  title: string;
  platform: Platform;
  collectionId: string;
  addedAt: number;
  thumbnailUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
  videoCount: number;
}

export interface StorageData {
  videos: Video[];
  collections: Collection[];
}
