import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VideoCard } from '@/components/video-card';
import { CollectionPickerModal } from '@/components/collection-picker-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Video, Collection } from '@/types';
import { storageService } from '@/services/storage';
import * as Haptics from 'expo-haptics';

export default function CollectionDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [collection, setCollection] = useState<Collection | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      const collections = await storageService.getCollections();
      const currentCollection = collections.find((c) => c.id === params.id);

      if (currentCollection) {
        setCollection(currentCollection);
        const collectionVideos = await storageService.getVideosByCollection(params.id as string);
        setVideos(collectionVideos.sort((a, b) => b.addedAt - a.addedAt));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load collection');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await storageService.deleteVideo(videoId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete video');
    }
  };

  const handleMoveVideo = (videoId: string) => {
    setSelectedVideoId(videoId);
    setShowMoveModal(true);
  };

  const handleMoveToCollection = async (collectionId: string) => {
    if (!selectedVideoId) return;

    try {
      await storageService.updateVideo(selectedVideoId, { collectionId });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedVideoId(null);
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to move video');
    }
  };

  const handleShareCollection = async () => {
    if (!collection || videos.length === 0) return;

    try {
      const videoList = videos.map((v, i) => `${i + 1}. ${v.title}\n   ${v.url}`).join('\n\n');
      await Share.share({
        message: `${collection.name} - ${videos.length} videos\n\n${videoList}`,
        title: `Share ${collection.name}`,
      });
    } catch (error) {
      console.error('Error sharing collection:', error);
    }
  };

  if (!collection) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>

          {videos.length > 0 && (
            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.tint }]}
              onPress={handleShareCollection}
            >
              <IconSymbol name="square.and.arrow.up" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerContent}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: collection.color + '20' },
            ]}
          >
            <IconSymbol name={collection.icon as any} size={32} color={collection.color} />
          </View>
          <View style={styles.headerText}>
            <ThemedText type="title">{collection.name}</ThemedText>
            <ThemedText style={styles.count}>
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </ThemedText>
          </View>
        </View>
      </View>

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="video.slash" size={64} color={colors.text} style={{ opacity: 0.3 }} />
          <ThemedText style={styles.emptyText}>No videos in this collection</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Add videos from the home tab
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onDelete={handleDeleteVideo}
              onMove={handleMoveVideo}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <CollectionPickerModal
        visible={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onSelect={handleMoveToCollection}
        currentCollectionId={collection.id}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  count: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
});
