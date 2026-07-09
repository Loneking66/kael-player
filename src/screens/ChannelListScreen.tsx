import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryPill } from "../components/CategoryPill";
import { EmptyState } from "../components/EmptyState";
import { MediaListItem } from "../components/MediaListItem";
import { SearchInput } from "../components/SearchInput";
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

      categoryMap.set(id, { id, label, count: 1 });
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
      <View style={styles.topArea}>
        <View style={styles.tabs}>
          {SECTION_ORDER.map((section) => {
            const isActive = section === activeSection;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={section}
                onPress={() => setActiveSection(section)}
                style={[styles.tab, isActive && styles.activeTab]}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{MEDIA_SECTION_LABELS[section]}</Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <CategoryPill
                active={category.id === selectedCategory}
                key={category.id}
                label={`${category.label} (${category.count})`}
                onPress={() => setCategoryBySection((current) => ({ ...current, [activeSection]: category.id }))}
              />
            ))}
          </View>
        </ScrollView>

        <SearchInput
          onChangeText={(value) => setSearchBySection((current) => ({ ...current, [activeSection]: value }))}
          placeholder={`Buscar em ${MEDIA_SECTION_LABELS[activeSection].toLowerCase()}`}
          value={search}
        />

        <Text style={styles.count}>{filteredItems.length} de {categoryFilteredItems.length} itens nesta categoria</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <EmptyState
            title="Nada encontrado"
            message="Tente outra busca ou selecione a categoria Todos."
          />
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
    backgroundColor: "#F8FAFC",
    flex: 1
  },
  topArea: {
    backgroundColor: "#F8FAFC",
    gap: 12,
    padding: 16
  },
  tabs: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    flexDirection: "row",
    padding: 4
  },
  tab: {
    alignItems: "center",
    borderRadius: 7,
    flex: 1,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  activeTab: {
    backgroundColor: "#FFFFFF"
  },
  tabText: {
    color: "#4B5563",
    fontSize: 13,
    fontWeight: "800"
  },
  activeTabText: {
    color: "#0F766E"
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16
  },
  count: {
    color: "#6B7280",
    fontSize: 13
  },
  listContent: {
    paddingBottom: 20
  }
});
