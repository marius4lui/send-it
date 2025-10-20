import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { VideoCard } from '@/components/video-card';
import { CollectionPickerModal } from '@/components/collection-picker-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Video, Collection, Platform } from '@/types';
import { storageService } from '@/services/storage';
import { getPlatformName } from '@/utils/platform-detector';
import * as Haptics from 'expo-haptics';

type SortOption = 'newest' | 'oldest' | 'title';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);

  useEffect(() => {
    loadCollections();
    searchVideos();
  }, []);

  useEffect(() => {
    searchVideos();
  }, [query, selectedCollection, selectedPlatform, sortBy]);

  const loadCollections = async () => {
    try {
      const data = await storageService.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const searchVideos = async () => {
    try {
      const results = await storageService.searchVideos(query, {
        collectionId: selectedCollection || undefined,
        platform: selectedPlatform || undefined,
      });

      // Sort results
      const sorted = [...results].sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return b.addedAt - a.addedAt;
          case 'oldest':
            return a.addedAt - b.addedAt;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      setVideos(sorted);
    } catch (error) {
      Alert.alert('Error', 'Failed to search videos');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await storageService.deleteVideo(videoId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await searchVideos();
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
      await searchVideos();
    } catch (error) {
      Alert.alert('Error', 'Failed to move video');
    }
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCollection(null);
    setSelectedPlatform(null);
    setSortBy('newest');
  };

  const platforms: Platform[] = ['instagram', 'tiktok', 'youtube'];
  const hasActiveFilters = selectedCollection || selectedPlatform || sortBy !== 'newest';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Search</ThemedText>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5' }]}>
          <IconSymbol name="magnifyingglass" size={20} color={colors.text} style={{ opacity: 0.5 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search videos..."
            placeholderTextColor={colors.text + '60'}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color={colors.text} style={{ opacity: 0.5 }} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filters}
        >
          {/* Collection Filter */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedCollection ? colors.tint : 'transparent',
                borderColor: colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCollection(selectedCollection ? null : collections[0]?.id || null);
            }}
          >
            <IconSymbol
              name="folder"
              size={16}
              color={selectedCollection ? '#fff' : colors.text}
            />
            <ThemedText style={[styles.filterText, { color: selectedCollection ? '#fff' : colors.text }]}>
              {selectedCollection
                ? collections.find(c => c.id === selectedCollection)?.name || 'Collection'
                : 'All Collections'}
            </ThemedText>
          </TouchableOpacity>

          {/* Platform Filters */}
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform}
              style={[
                styles.filterChip,
                {
                  backgroundColor: selectedPlatform === platform ? colors.tint : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPlatform(selectedPlatform === platform ? null : platform);
              }}
            >
              <ThemedText style={[styles.filterText, { color: selectedPlatform === platform ? '#fff' : colors.text }]}>
                {getPlatformName(platform)}
              </ThemedText>
            </TouchableOpacity>
          ))}

          {/* Sort Options */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: 'transparent', borderColor: colors.border },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const options: SortOption[] = ['newest', 'oldest', 'title'];
              const currentIndex = options.indexOf(sortBy);
              setSortBy(options[(currentIndex + 1) % options.length]);
            }}
          >
            <IconSymbol name="arrow.up.arrow.down" size={16} color={colors.text} />
            <ThemedText style={[styles.filterText, { color: colors.text }]}>
              {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : 'A-Z'}
            </ThemedText>
          </TouchableOpacity>

          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                clearFilters();
              }}
            >
              <IconSymbol name="xmark" size={16} color="#fff" />
              <ThemedText style={[styles.filterText, { color: '#fff' }]}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol
            name={query ? 'magnifyingglass' : 'video'}
            size={64}
            color={colors.text}
            style={{ opacity: 0.3 }}
          />
          <ThemedText style={styles.emptyText}>
            {query ? 'No videos found' : 'No videos yet'}
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            {query
              ? 'Try adjusting your search or filters'
              : 'Add videos from the home tab to see them here'}
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
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersScroll: {
    marginTop: 12,
  },
  filters: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
