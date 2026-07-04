import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadSeriesSeasons, type SeriesSeason } from "../services/seriesService";
import type { MediaItem } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SeriesDetails">;

export function SeriesDetailsScreen({ navigation, route }: Props) {
  const { series } = route.params;
  const [seasons, setSeasons] = useState<SeriesSeason[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEpisodes() {
      setIsLoading(true);
      setError(null);

      try {
        const loadedSeasons = await loadSeriesSeasons(series);

        if (isMounted) {
          setSeasons(loadedSeasons);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Nao foi possivel carregar episodios.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEpisodes();

    return () => {
      isMounted = false;
    };
  }, [series]);

  function openEpisode(episode: MediaItem) {
    console.log("[Kael Player] Abrindo episodio:", {
      name: episode.name,
      section: episode.section,
      hasUrl: Boolean(episode.url)
    });

    navigation.navigate("Player", { item: episode });
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.centered}>
        <ActivityIndicator color="#0F766E" />
        <Text style={styles.loadingText}>Carregando episodios...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{series.name}</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <SectionList
        contentContainerStyle={styles.listContent}
        sections={seasons.map((season) => ({
          title: `Temporada ${season.seasonNumber}`,
          data: season.episodes
        }))}
        keyExtractor={(episode) => episode.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{series.name}</Text>
            <Text style={styles.subtitle}>{seasons.length} temporadas</Text>
          </View>
        }
        renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => openEpisode(item)} style={({ pressed }) => [styles.episodeRow, pressed && styles.pressed]}>
            <View style={styles.episodeBadge}>
              <Text style={styles.episodeBadgeText}>EP</Text>
            </View>
            <View style={styles.episodeContent}>
              <Text numberOfLines={2} style={styles.episodeTitle}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.episodeMeta}>{item.groupTitle}</Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    flex: 1
  },
  centered: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 20
  },
  loadingText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700"
  },
  content: {
    gap: 14,
    padding: 20
  },
  listContent: {
    paddingBottom: 20
  },
  header: {
    gap: 6,
    padding: 20
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800"
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14
  },
  sectionTitle: {
    backgroundColor: "#F9FAFB",
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  episodeRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  pressed: {
    opacity: 0.72
  },
  episodeBadge: {
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 6,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44
  },
  episodeBadgeText: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "800"
  },
  episodeContent: {
    flex: 1
  },
  episodeTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800"
  },
  episodeMeta: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4
  },
  error: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderRadius: 8,
    borderWidth: 1,
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20,
    padding: 12
  }
});
