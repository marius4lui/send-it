import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { storageService } from '@/services/storage';
import { getPlatformName } from '@/utils/platform-detector';
import type { Platform } from '@/types';

interface Stats {
  totalVideos: number;
  totalCollections: number;
  videosByPlatform: Record<Platform, number>;
  videosThisWeek: number;
  videosThisMonth: number;
  mostUsedCollection: { name: string; count: number } | null;
  oldestVideo: { title: string; date: string } | null;
  newestVideo: { title: string; date: string } | null;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const videos = await storageService.getVideos();
      const collections = await storageService.getCollections();

      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      // Videos by platform
      const byPlatform: Record<Platform, number> = {
        instagram: 0,
        tiktok: 0,
        youtube: 0,
        unknown: 0,
      };
      videos.forEach(video => {
        byPlatform[video.platform]++;
      });

      // Time-based stats
      const videosThisWeek = videos.filter(v => now - v.addedAt < oneWeek).length;
      const videosThisMonth = videos.filter(v => now - v.addedAt < oneMonth).length;

      // Most used collection
      const collectionWithMostVideos = collections.length > 0
        ? collections.reduce((max, col) => col.videoCount > max.videoCount ? col : max)
        : null;

      // Oldest and newest videos
      const sortedVideos = [...videos].sort((a, b) => a.addedAt - b.addedAt);
      const oldest = sortedVideos[0];
      const newest = sortedVideos[sortedVideos.length - 1];

      setStats({
        totalVideos: videos.length,
        totalCollections: collections.length,
        videosByPlatform: byPlatform,
        videosThisWeek,
        videosThisMonth,
        mostUsedCollection: collectionWithMostVideos
          ? { name: collectionWithMostVideos.name, count: collectionWithMostVideos.videoCount }
          : null,
        oldestVideo: oldest
          ? {
              title: oldest.title,
              date: new Date(oldest.addedAt).toLocaleDateString('de-DE'),
            }
          : null,
        newestVideo: newest
          ? {
              title: newest.title,
              date: new Date(newest.addedAt).toLocaleDateString('de-DE'),
            }
          : null,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!stats) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title">Statistics</ThemedText>
        </View>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const StatCard = ({ icon, label, value, color }: { icon: string; label: string; value: string | number; color?: string }) => (
    <View style={[styles.statCard, { borderColor: colors.border }]}>
      <View style={[styles.statIconContainer, { backgroundColor: (color || colors.tint) + '20' }]}>
        <IconSymbol name={icon as any} size={24} color={color || colors.tint} />
      </View>
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );

  const InfoCard = ({ title, content, icon }: { title: string; content: string; icon: string }) => (
    <View style={[styles.infoCard, { borderColor: colors.border }]}>
      <View style={styles.infoHeader}>
        <IconSymbol name={icon as any} size={20} color={colors.tint} />
        <ThemedText style={styles.infoTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.infoContent}>{content}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Statistics</ThemedText>
        <ThemedText style={styles.subtitle}>Your video collection insights</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Overview Stats */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Overview</ThemedText>
          <View style={styles.statsGrid}>
            <StatCard icon="video.fill" label="Total Videos" value={stats.totalVideos} />
            <StatCard icon="folder.fill" label="Collections" value={stats.totalCollections} color="#10B981" />
            <StatCard icon="calendar" label="This Week" value={stats.videosThisWeek} color="#F59E0B" />
            <StatCard icon="calendar.badge.clock" label="This Month" value={stats.videosThisMonth} color="#EC4899" />
          </View>
        </View>

        {/* Platform Breakdown */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>By Platform</ThemedText>
          <View style={styles.platformList}>
            {Object.entries(stats.videosByPlatform).map(([platform, count]) => {
              if (count === 0) return null;
              const platformColors = {
                instagram: '#E4405F',
                tiktok: '#000000',
                youtube: '#FF0000',
                unknown: '#6B7280',
              };
              return (
                <View key={platform} style={[styles.platformItem, { borderColor: colors.border }]}>
                  <View style={styles.platformLeft}>
                    <View
                      style={[
                        styles.platformDot,
                        { backgroundColor: platformColors[platform as Platform] },
                      ]}
                    />
                    <ThemedText style={styles.platformName}>
                      {getPlatformName(platform as Platform)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.platformCount}>{count}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Insights</ThemedText>
          {stats.mostUsedCollection && (
            <InfoCard
              icon="star.fill"
              title="Most Used Collection"
              content={`${stats.mostUsedCollection.name} with ${stats.mostUsedCollection.count} videos`}
            />
          )}
          {stats.oldestVideo && (
            <InfoCard
              icon="clock.fill"
              title="Oldest Video"
              content={`"${stats.oldestVideo.title}" added on ${stats.oldestVideo.date}`}
            />
          )}
          {stats.newestVideo && (
            <InfoCard
              icon="sparkles"
              title="Latest Video"
              content={`"${stats.newestVideo.title}" added on ${stats.newestVideo.date}`}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (Dimensions.get('window').width - 56) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'center',
  },
  platformList: {
    gap: 12,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  platformLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  platformDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '500',
  },
  platformCount: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoContent: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
