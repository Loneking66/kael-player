import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MediaListItem } from "../components/MediaListItem";
import type { MediaSection } from "../types/media";
import { MEDIA_SECTION_LABELS } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ChannelList">;

const SECTION_ORDER: MediaSection[] = ["live", "movies", "series", "other"];
const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_CATEGORY_ID = "__uncategorized__";

export function ChannelListScreen({ navigation, route }: Props) {
  const [activeSection, setActiveSection] = useState<MediaSection>(route.params.initialSection ?? "live");
  const [searchBySection, setSearchBySection] = useState<Record<MediaSection, string>>({
    live: "",
    movies: "",
    series: "",
    other: ""
  });
  const [categoryBySection, setCategoryBySection] = useState<Record<MediaSection, string>>({
    live: ALL_CATEGORY_ID,
    movies: ALL_CATEGORY_ID,
    series: ALL_CATEGORY_ID,
    other: ALL_CATEGORY_ID
  });

  const search = searchBySection[activeSection];
  const selectedCategory = categoryBySection[activeSection];
  const items = route.params.itemsBySection[activeSection];

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; label: string; count: number }>();

    items.forEach((item) => {
      const id = item.categoryId ?? UNCATEGORIZED_CATEGORY_ID;
      const label = item.categoryName || item.groupTitle || "Sem categoria";
      const existing = categoryMap.get(id);

      if (existing) {
        existing.count += 1;
        return;
      }

      categoryMap.set(id, {
        id,
        label,
        count: 1
      });
    });

    return [
      { id: ALL_CATEGORY_ID, label: "Todos", count: items.length },
      ...Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label))
    ];
  }, [items]);

  const categoryFilteredItems = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY_ID) {
      return items;
    }

    if (selectedCategory === UNCATEGORIZED_CATEGORY_ID) {
      return items.filter((item) => !item.categoryId);
    }

    return items.filter((item) => item.categoryId === selectedCategory);
  }, [items, selectedCategory]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return categoryFilteredItems;
    }

    return categoryFilteredItems.filter((item) => {
      const searchable = `${item.name} ${item.groupTitle ?? ""} ${item.categoryName ?? ""} ${item.tvgName ?? ""}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [categoryFilteredItems, search]);

  function handleOpenItem(item: (typeof filteredItems)[number]) {
    if (item.section === "series") {
      navigation.navigate("SeriesDetails", { series: item });
      return;
    }

    navigation.navigate("Player", { item });
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.tabs}>
        {SECTION_ORDER.map((section) => {
          const isActive = section === activeSection;

          return (
            <Pressable
              accessibilityRole="tab"
              key={section}
              onPress={() => setActiveSection(section)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{MEDIA_SECTION_LABELS[section]}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {categories.map((category) => {
              const isActive = category.id === selectedCategory;

              return (
                <Pressable
                  accessibilityRole="button"
                  key={category.id}
                  onPress={() => setCategoryBySection((current) => ({ ...current, [activeSection]: category.id }))}
                  style={[styles.categoryChip, isActive && styles.activeCategoryChip]}
                >
                  <Text style={[styles.categoryChipText, isActive && styles.activeCategoryChipText]}>
                    {category.label} ({category.count})
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(value) => setSearchBySection((current) => ({ ...current, [activeSection]: value }))}
          placeholder={`Buscar em ${MEDIA_SECTION_LABELS[activeSection].toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
          value={search}
        />
        <Text style={styles.count}>{filteredItems.length} de {categoryFilteredItems.length} itens nesta categoria</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nada encontrado</Text>
            <Text style={styles.emptyText}>A lista do usuário não tem itens nesta seção ou busca.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MediaListItem item={item} onPress={() => handleOpenItem(item)} />
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
  tabs: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  tab: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  activeTab: {
    backgroundColor: "#0F766E"
  },
  tabText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "800"
  },
  activeTabText: {
    color: "#FFFFFF"
  },
  searchArea: {
    gap: 8,
    padding: 16
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16
  },
  categoryChip: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 12
  },
  activeCategoryChip: {
    backgroundColor: "#CCFBF1",
    borderColor: "#0F766E"
  },
  categoryChipText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700"
  },
  activeCategoryChipText: {
    color: "#0F766E"
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 12
  },
  count: {
    color: "#6B7280",
    fontSize: 13
  },
  empty: {
    alignItems: "center",
    padding: 28
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800"
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center"
  }
});
