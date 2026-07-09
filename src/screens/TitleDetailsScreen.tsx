import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import type { MediaItem } from "../types/media";
import { MEDIA_SECTION_LABELS } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TitleDetails">;

function getActionLabel(item: MediaItem) {
  if (item.section === "live") {
    return "Assistir ao vivo";
  }

  if (item.section === "series") {
    return "Ver episodios";
  }

  return "Assistir";
}

export function TitleDetailsScreen({ navigation, route }: Props) {
  const { item, itemsBySection, relatedItems } = route.params;
  const category = item.categoryName || item.groupTitle || "Sem categoria";

  function handlePrimaryAction() {
    if (item.section === "series") {
      navigation.navigate("SeriesDetails", {
        series: item,
        relatedItems,
        itemsBySection
      });
      return;
    }

    navigation.navigate("Player", { item });
  }

  function openRelated(related: MediaItem) {
    const nextRelatedItems = itemsBySection[related.section]
      .filter((candidate) => candidate.id !== related.id && (candidate.categoryId === related.categoryId || candidate.groupTitle === related.groupTitle))
      .slice(0, 12);

    navigation.push("TitleDetails", {
      item: related,
      relatedItems: nextRelatedItems,
      itemsBySection
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        {item.tvgLogo ? (
          <Image source={{ uri: item.tvgLogo }} style={styles.image} />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackText}>{item.name.slice(0, 2).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text numberOfLines={3} style={styles.title}>{item.name}</Text>
          <Text style={styles.meta}>{MEDIA_SECTION_LABELS[item.section]} • {category}</Text>
          <Text style={styles.description}>Mídia fornecida pela lista adicionada pelo usuário.</Text>
          <PrimaryButton label={getActionLabel(item)} onPress={handlePrimaryAction} />
        </View>
      </View>

      {relatedItems.length > 0 ? (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Relacionados</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedRow}>
              {relatedItems.map((related) => (
                <Pressable accessibilityRole="button" key={related.id} onPress={() => openRelated(related)} style={({ pressed }) => [styles.relatedCard, pressed && styles.pressed]}>
                  {related.tvgLogo ? (
                    <Image source={{ uri: related.tvgLogo }} style={styles.relatedImage} />
                  ) : (
                    <View style={styles.relatedFallback}>
                      <Text style={styles.relatedFallbackText}>{related.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                  )}
                  <Text numberOfLines={2} style={styles.relatedTitle}>{related.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    gap: 18,
    padding: 20
  },
  hero: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  image: {
    aspectRatio: 16 / 9,
    backgroundColor: "#F3F4F6",
    width: "100%"
  },
  imageFallback: {
    alignItems: "center",
    aspectRatio: 16 / 9,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    width: "100%"
  },
  imageFallbackText: {
    color: "#0F766E",
    fontSize: 32,
    fontWeight: "900"
  },
  info: {
    gap: 10,
    padding: 16
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30
  },
  meta: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "800"
  },
  description: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21
  },
  relatedSection: {
    gap: 12
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900"
  },
  relatedRow: {
    flexDirection: "row",
    gap: 10,
    paddingRight: 20
  },
  relatedCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    width: 142
  },
  pressed: {
    opacity: 0.72
  },
  relatedImage: {
    aspectRatio: 16 / 10,
    backgroundColor: "#F3F4F6",
    width: "100%"
  },
  relatedFallback: {
    alignItems: "center",
    aspectRatio: 16 / 10,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    width: "100%"
  },
  relatedFallbackText: {
    color: "#0F766E",
    fontSize: 18,
    fontWeight: "900"
  },
  relatedTitle: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    padding: 10
  }
});
