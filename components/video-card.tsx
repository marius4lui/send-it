import { StyleSheet, TouchableOpacity, View, Alert, Share } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { IconSymbol } from './ui/icon-symbol';
import { Video } from '@/types';
import { getPlatformIcon, getPlatformName } from '@/utils/platform-detector';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';

interface VideoCardProps {
  video: Video;
  onDelete?: (videoId: string) => void;
  onMove?: (videoId: string) => void;
}

export function VideoCard({ video, onDelete, onMove }: VideoCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleOpenLink = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await WebBrowser.openBrowserAsync(video.url);
    } catch (error) {
      Alert.alert('Error', 'Could not open video link');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this video: ${video.title}\n${video.url}`,
        title: video.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      video.title,
      'What would you like to do?',
      [
        {
          text: 'Open Link',
          onPress: handleOpenLink,
        },
        {
          text: 'Share',
          onPress: handleShare,
        },
        {
          text: 'Move to Collection',
          onPress: () => onMove?.(video.id),
        },
        {
          text: 'Delete',
          onPress: () => {
            Alert.alert(
              'Delete Video',
              'Are you sure you want to delete this video?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete?.(video.id),
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
      onPress={handleOpenLink}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <ThemedView style={[styles.card, { borderColor: colors.border }]}>
        <View style={styles.header}>
          <View style={styles.platformBadge}>
            <IconSymbol
              name={getPlatformIcon(video.platform) as any}
              size={16}
              color={colors.tint}
            />
            <ThemedText style={styles.platformText}>
              {getPlatformName(video.platform)}
            </ThemedText>
          </View>
          <ThemedText style={styles.dateText}>
            {formatDate(video.addedAt)}
          </ThemedText>
        </View>

        <ThemedText style={styles.title} numberOfLines={2}>
          {video.title}
        </ThemedText>

        <ThemedText style={styles.url} numberOfLines={1}>
          {video.url}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  url: {
    fontSize: 12,
    opacity: 0.6,
  },
});
