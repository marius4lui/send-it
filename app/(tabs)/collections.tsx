import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CollectionCard } from '@/components/collection-card';
import { AddCollectionModal } from '@/components/add-collection-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Collection } from '@/types';
import { storageService } from '@/services/storage';
import * as Haptics from 'expo-haptics';

export default function CollectionsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [collections, setCollections] = useState<Collection[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCollections();
    }, [])
  );

  const loadCollections = async () => {
    try {
      const data = await storageService.getCollections();
      setCollections(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleAddCollection = () => {
    setEditingCollection(null);
    setShowAddModal(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setShowAddModal(true);
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await storageService.deleteCollection(collectionId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadCollections();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete collection');
    }
  };

  const handleCollectionPress = (collection: Collection) => {
    router.push({
      pathname: '/collection-detail',
      params: { id: collection.id },
    });
  };

  const totalVideos = collections.reduce((sum, c) => sum + c.videoCount, 0);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View>
          <ThemedText type="title">Collections</ThemedText>
          <ThemedText style={styles.subtitle}>
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'} · {totalVideos} {totalVideos === 1 ? 'video' : 'videos'}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleAddCollection();
          }}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {collections.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="folder" size={64} color={colors.text} style={{ opacity: 0.3 }} />
          <ThemedText style={styles.emptyText}>No collections yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Create your first collection to organize your videos
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyButton, { backgroundColor: colors.tint }]}
            onPress={handleAddCollection}
          >
            <ThemedText style={styles.emptyButtonText}>Create Collection</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CollectionCard
              collection={item}
              onPress={() => handleCollectionPress(item)}
              onEdit={() => handleEditCollection(item)}
              onDelete={() => handleDeleteCollection(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}

      <AddCollectionModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCollection(null);
        }}
        onSuccess={loadCollections}
        editCollection={editingCollection ? {
          id: editingCollection.id,
          name: editingCollection.name,
          color: editingCollection.color,
          icon: editingCollection.icon,
        } : undefined}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
