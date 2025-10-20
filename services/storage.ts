import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, Collection, StorageData } from '@/types';

const STORAGE_KEY = '@send_it_data';

const getDefaultCollection = (): Collection => ({
  id: 'default',
  name: 'My Videos',
  color: '#3B82F6',
  icon: 'play.circle',
  createdAt: Date.now(),
  videoCount: 0,
});

const getInitialData = (): StorageData => ({
  videos: [],
  collections: [getDefaultCollection()],
});

export const storageService = {
  async getData(): Promise<StorageData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return getInitialData();
    } catch (error) {
      console.error('Error loading data:', error);
      return getInitialData();
    }
  },

  async saveData(data: StorageData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  },

  async addVideo(video: Omit<Video, 'id' | 'addedAt'>): Promise<Video> {
    const data = await this.getData();
    const newVideo: Video = {
      ...video,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      addedAt: Date.now(),
    };

    data.videos.push(newVideo);

    // Update collection video count
    const collection = data.collections.find(c => c.id === newVideo.collectionId);
    if (collection) {
      collection.videoCount++;
    }

    await this.saveData(data);
    return newVideo;
  },

  async updateVideo(videoId: string, updates: Partial<Video>): Promise<void> {
    const data = await this.getData();
    const videoIndex = data.videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      throw new Error('Video not found');
    }

    const oldVideo = data.videos[videoIndex];
    const newVideo = { ...oldVideo, ...updates };

    // If collection changed, update counts
    if (updates.collectionId && oldVideo.collectionId !== updates.collectionId) {
      const oldCollection = data.collections.find(c => c.id === oldVideo.collectionId);
      const newCollection = data.collections.find(c => c.id === updates.collectionId);

      if (oldCollection) oldCollection.videoCount--;
      if (newCollection) newCollection.videoCount++;
    }

    data.videos[videoIndex] = newVideo;
    await this.saveData(data);
  },

  async deleteVideo(videoId: string): Promise<void> {
    const data = await this.getData();
    const video = data.videos.find(v => v.id === videoId);

    if (video) {
      const collection = data.collections.find(c => c.id === video.collectionId);
      if (collection) {
        collection.videoCount--;
      }
    }

    data.videos = data.videos.filter(v => v.id !== videoId);
    await this.saveData(data);
  },

  async getVideos(): Promise<Video[]> {
    const data = await this.getData();
    return data.videos;
  },

  async getVideosByCollection(collectionId: string): Promise<Video[]> {
    const data = await this.getData();
    return data.videos.filter(v => v.collectionId === collectionId);
  },

  async addCollection(collection: Omit<Collection, 'id' | 'createdAt' | 'videoCount'>): Promise<Collection> {
    const data = await this.getData();
    const newCollection: Collection = {
      ...collection,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      videoCount: 0,
    };

    data.collections.push(newCollection);
    await this.saveData(data);
    return newCollection;
  },

  async updateCollection(collectionId: string, updates: Partial<Collection>): Promise<void> {
    const data = await this.getData();
    const collectionIndex = data.collections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      throw new Error('Collection not found');
    }

    data.collections[collectionIndex] = {
      ...data.collections[collectionIndex],
      ...updates,
    };

    await this.saveData(data);
  },

  async deleteCollection(collectionId: string): Promise<void> {
    if (collectionId === 'default') {
      throw new Error('Cannot delete default collection');
    }

    const data = await this.getData();

    // Move videos to default collection
    data.videos.forEach(video => {
      if (video.collectionId === collectionId) {
        video.collectionId = 'default';
      }
    });

    // Update default collection count
    const defaultCollection = data.collections.find(c => c.id === 'default');
    if (defaultCollection) {
      defaultCollection.videoCount = data.videos.filter(v => v.collectionId === 'default').length;
    }

    data.collections = data.collections.filter(c => c.id !== collectionId);
    await this.saveData(data);
  },

  async getCollections(): Promise<Collection[]> {
    const data = await this.getData();
    return data.collections;
  },

  async searchVideos(query: string, filters?: {
    collectionId?: string;
    platform?: string;
  }): Promise<Video[]> {
    const data = await this.getData();
    let results = data.videos;

    // Filter by collection
    if (filters?.collectionId) {
      results = results.filter(v => v.collectionId === filters.collectionId);
    }

    // Filter by platform
    if (filters?.platform) {
      results = results.filter(v => v.platform === filters.platform);
    }

    // Search by title
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(v => v.title.toLowerCase().includes(lowerQuery));
    }

    return results;
  },
};
