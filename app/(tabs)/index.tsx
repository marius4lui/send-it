import { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Collection } from '@/types';
import { storageService } from '@/services/storage';
import { detectPlatform, isValidVideoUrl, getPlatformName, getPlatformIcon } from '@/utils/platform-detector';
import { extractContentFromUrl, extractHashtags, generateSmartTitle } from '@/utils/content-extractor';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('default');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  // Handle shared URL from deep link
  useEffect(() => {
    if (params.sharedUrl) {
      const sharedUrl = Array.isArray(params.sharedUrl) ? params.sharedUrl[0] : params.sharedUrl;
      setUrl(sharedUrl);
      handleUrlChange(sharedUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [params.sharedUrl]);

  // Auto-detect content when URL changes
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);

    if (isValidVideoUrl(newUrl)) {
      const platform = detectPlatform(newUrl);
      const extracted = await extractContentFromUrl(newUrl, platform);

      // Auto-generate title if available
      if (extracted.hashtags.length > 0) {
        const smartTitle = generateSmartTitle(extracted.hashtags, platform);
        setTitle(smartTitle);
        setHashtags(extracted.hashtags);
      } else if (extracted.title) {
        setTitle(extracted.title);
      }

      if (extracted.description) {
        setDescription(extracted.description);
      }
    }
  };

  const loadCollections = async () => {
    try {
      const data = await storageService.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to paste from clipboard');
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    if (!isValidVideoUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid Instagram, TikTok, or YouTube video URL');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a video title');
      return;
    }

    setIsLoading(true);
    try {
      await storageService.addVideo({
        url: url.trim(),
        title: title.trim(),
        platform: detectPlatform(url),
        collectionId: selectedCollection,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Video saved successfully!');

      // Reset form
      setUrl('');
      setTitle('');
      setDescription('');
      setHashtags([]);
      setSelectedCollection('default');

      // Reload collections to update counts
      await loadCollections();
    } catch (error) {
      Alert.alert('Error', 'Failed to save video');
    } finally {
      setIsLoading(false);
    }
  };

  const platform = url ? detectPlatform(url) : null;
  const isUrlValid = url ? isValidVideoUrl(url) : null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <IconSymbol name="plus.circle.fill" size={48} color={colors.tint} />
            <ThemedText type="title">Add Video</ThemedText>
            <ThemedText style={styles.subtitle}>
              Save videos from Instagram, TikTok, and YouTube
            </ThemedText>
          </View>

          <View style={styles.form}>
            <ThemedText style={styles.label}>Video URL</ThemedText>
            <View style={styles.urlInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.urlInput,
                  {
                    color: colors.text,
                    backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                    borderColor: isUrlValid === false ? '#EF4444' : colors.border,
                  },
                ]}
                value={url}
                onChangeText={handleUrlChange}
                placeholder="https://..."
                placeholderTextColor={colors.text + '60'}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={[styles.pasteButton, { backgroundColor: colors.tint }]}
                onPress={handlePasteFromClipboard}
              >
                <IconSymbol name="doc.on.clipboard" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {platform && isUrlValid && (
              <View style={styles.platformBadge}>
                <IconSymbol name={getPlatformIcon(platform) as any} size={16} color={colors.tint} />
                <ThemedText style={styles.platformText}>
                  {getPlatformName(platform)} video detected
                </ThemedText>
              </View>
            )}

            {isUrlValid === false && (
              <ThemedText style={styles.errorText}>
                Please enter a valid Instagram, TikTok, or YouTube URL
              </ThemedText>
            )}

            <ThemedText style={styles.label}>Title</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
                  borderColor: colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Give your video a title"
              placeholderTextColor={colors.text + '60'}
              maxLength={100}
            />

            {hashtags.length > 0 && (
              <View style={styles.hashtagsContainer}>
                <ThemedText style={styles.hashtagsLabel}>Detected Hashtags:</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.hashtagsList}>
                    {hashtags.map((tag, index) => (
                      <View key={index} style={[styles.hashtagChip, { borderColor: colors.tint }]}>
                        <ThemedText style={[styles.hashtagText, { color: colors.tint }]}>
                          {tag}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <ThemedText style={styles.label}>Collection</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.collectionsScroll}
              contentContainerStyle={styles.collectionsContent}
            >
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.collectionChip,
                    {
                      backgroundColor:
                        selectedCollection === collection.id
                          ? collection.color
                          : collection.color + '20',
                      borderColor: collection.color,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedCollection(collection.id);
                  }}
                >
                  <IconSymbol
                    name={collection.icon as any}
                    size={18}
                    color={selectedCollection === collection.id ? '#fff' : collection.color}
                  />
                  <ThemedText
                    style={[
                      styles.collectionChipText,
                      { color: selectedCollection === collection.id ? '#fff' : collection.color },
                    ]}
                    numberOfLines={1}
                  >
                    {collection.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: colors.tint,
                  opacity: isLoading || !url || !title ? 0.5 : 1,
                },
              ]}
              onPress={handleSave}
              disabled={isLoading || !url || !title}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Video'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  urlInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  urlInput: {
    flex: 1,
  },
  pasteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  platformText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
  },
  collectionsScroll: {
    marginBottom: 8,
  },
  collectionsContent: {
    gap: 8,
  },
  collectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    maxWidth: 150,
  },
  collectionChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hashtagsContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  hashtagsLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  hashtagsList: {
    flexDirection: 'row',
    gap: 8,
  },
  hashtagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  hashtagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
