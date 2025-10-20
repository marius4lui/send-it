import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Modal,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Collection } from '@/types';
import { storageService } from '@/services/storage';
import * as Haptics from 'expo-haptics';

interface CollectionPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (collectionId: string) => void;
  currentCollectionId?: string;
}

export function CollectionPickerModal({
  visible,
  onClose,
  onSelect,
  currentCollectionId,
}: CollectionPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    if (visible) {
      loadCollections();
    }
  }, [visible]);

  const loadCollections = async () => {
    try {
      const data = await storageService.getCollections();
      setCollections(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load collections');
    }
  };

  const handleSelect = (collectionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(collectionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <ThemedText type="title">Select Collection</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  {
                    backgroundColor:
                      currentCollectionId === item.id
                        ? colors.tint + '20'
                        : 'transparent',
                  },
                ]}
                onPress={() => handleSelect(item.id)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color + '20' },
                  ]}
                >
                  <IconSymbol name={item.icon as any} size={24} color={item.color} />
                </View>
                <View style={styles.content}>
                  <ThemedText style={styles.name}>{item.name}</ThemedText>
                  <ThemedText style={styles.count}>
                    {item.videoCount} {item.videoCount === 1 ? 'video' : 'videos'}
                  </ThemedText>
                </View>
                {currentCollectionId === item.id && (
                  <IconSymbol name="checkmark" size={20} color={colors.tint} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  count: {
    fontSize: 14,
    opacity: 0.6,
  },
});
