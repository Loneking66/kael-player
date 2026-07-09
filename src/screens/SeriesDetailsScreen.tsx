import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingState } from "../components/LoadingState";
import { loadSeriesSeasons, type SeriesSeason } from "../services/seriesService";
import type { MediaItem } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "SeriesDetails">;

export function SeriesDetailsScreen({ navigation, route }: Props) {
  const { itemsBySection, relatedItems = [], series } = route.params;
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
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <LoadingState message="Carregando temporadas e episodios..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>{series.name}</Text>
          <ErrorMessage message={error} />
        </View>
      </SafeAreaView>
    );
  }

  const episodeCount = seasons.reduce((sum, season) => sum + season.episodes.length, 0);

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
            <Text numberOfLines={2} style={styles.title}>{series.name}</Text>
            <Text style={styles.subtitle}>{seasons.length} temporadas • {episodeCount} episodios</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
          </View>
        )}
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
        ListFooterComponent={
          relatedItems.length > 0 ? (
            <View style={styles.relatedBlock}>
              <Text style={styles.relatedTitle}>Relacionados</Text>
              {relatedItems.slice(0, 6).map((related) => (
                <Pressable
                  accessibilityRole="button"
                  key={related.id}
                  onPress={() => {
                    if (itemsBySection) {
                      navigation.push("TitleDetails", {
                        item: related,
                        relatedItems: relatedItems.filter((candidate) => candidate.id !== related.id).slice(0, 12),
                        itemsBySection
                      });
                    }
                  }}
                  style={({ pressed }) => [styles.relatedRow, pressed && styles.pressed]}
                >
                  <Text numberOfLines={1} style={styles.relatedName}>{related.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1
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
    padding: 20,
    paddingBottom: 10
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14
  },
  sectionHeader: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900"
  },
  episodeRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  pressed: {
    opacity: 0.72
  },
  episodeBadge: {
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44
  },
  episodeBadgeText: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "900"
  },
  episodeContent: {
    flex: 1
  },
  episodeTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  episodeMeta: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5
  },
  relatedBlock: {
    gap: 8,
    padding: 16,
    paddingTop: 8
  },
  relatedTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900"
  },
  relatedRow: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  relatedName: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800"
  }
});
