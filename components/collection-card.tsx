import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Collection } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface CollectionCardProps {
  collection: Collection;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function CollectionCard({ collection, onPress, onEdit, onDelete }: CollectionCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLongPress = () => {
    if (collection.id === 'default') {
      return; // Cannot edit or delete default collection
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      collection.name,
      'What would you like to do?',
      [
        {
          text: 'Edit',
          onPress: onEdit,
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert(
              'Delete Collection',
              `Are you sure you want to delete "${collection.name}"? All videos will be moved to the default collection.`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: onDelete,
                },
              ]
            );
          },
          style: 'destructive',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <ThemedView style={[styles.card, { borderColor: colors.border }]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: collection.color + '20' },
          ]}
        >
          <IconSymbol
            name={collection.icon as any}
            size={32}
            color={collection.color}
          />
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {collection.name}
          </ThemedText>
          <ThemedText style={styles.count}>
            {collection.videoCount} {collection.videoCount === 1 ? 'video' : 'videos'}
          </ThemedText>
        </View>

        <IconSymbol
          name="chevron.right"
          size={20}
          color={colors.text}
          style={{ opacity: 0.3 }}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    opacity: 0.6,
  },
});
