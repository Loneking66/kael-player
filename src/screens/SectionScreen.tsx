import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CategoryPill } from "../components/CategoryPill";
import { EmptyState } from "../components/EmptyState";
import { SearchInput } from "../components/SearchInput";
import type { MediaItem } from "../types/media";
import { MEDIA_SECTION_LABELS } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Section">;

const ALL_CATEGORY_ID = "__all__";
const UNCATEGORIZED_CATEGORY_ID = "__uncategorized__";

export function SectionScreen({ navigation, route }: Props) {
  const { itemsBySection, section } = route.params;
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY_ID);
  const [search, setSearch] = useState("");
  const items = itemsBySection[section];

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

  const categoryItems = useMemo(() => {
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
      return categoryItems;
    }

    return categoryItems.filter((item) => {
      const searchable = `${item.name} ${item.categoryName ?? ""} ${item.groupTitle ?? ""} ${item.tvgName ?? ""}`.toLowerCase();
      return searchable.includes(term);
    });
  }, [categoryItems, search]);

  function openDetails(item: MediaItem) {
    const relatedItems = categoryItems
      .filter((related) => related.id !== item.id)
      .slice(0, 12);

    navigation.navigate("TitleDetails", {
      item,
      relatedItems,
      itemsBySection
    });
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{MEDIA_SECTION_LABELS[section]}</Text>
        <Text style={styles.subtitle}>{filteredItems.length} itens encontrados</Text>
      </View>

      <View style={styles.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoryRow}>
            {categories.map((category) => (
              <CategoryPill
                active={category.id === selectedCategory}
                key={category.id}
                label={`${category.label} (${category.count})`}
                onPress={() => setSelectedCategory(category.id)}
              />
            ))}
          </View>
        </ScrollView>

        <SearchInput
          onChangeText={setSearch}
          placeholder={`Buscar em ${MEDIA_SECTION_LABELS[section].toLowerCase()}`}
          value={search}
        />
      </View>

      <FlatList
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        data={filteredItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState title="Nada encontrado" message="Tente outra busca ou selecione a categoria Todos." />}
        numColumns={2}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" onPress={() => openDetails(item)} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            {item.tvgLogo ? (
              <Image source={{ uri: item.tvgLogo }} style={styles.poster} />
            ) : (
              <View style={styles.posterFallback}>
                <Text style={styles.posterText}>{item.name.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <Text numberOfLines={2} style={styles.cardTitle}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.cardMeta}>{item.categoryName || item.groupTitle || "Sem categoria"}</Text>
          </Pressable>
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
  header: {
    gap: 4,
    padding: 16,
    paddingBottom: 8
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14
  },
  controls: {
    gap: 12,
    padding: 16,
    paddingTop: 8
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20
  },
  row: {
    gap: 10
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginBottom: 12,
    overflow: "hidden"
  },
  pressed: {
    opacity: 0.72
  },
  poster: {
    aspectRatio: 16 / 10,
    backgroundColor: "#F3F4F6",
    width: "100%"
  },
  posterFallback: {
    alignItems: "center",
    aspectRatio: 16 / 10,
    backgroundColor: "#CCFBF1",
    justifyContent: "center",
    width: "100%"
  },
  posterText: {
    color: "#0F766E",
    fontSize: 20,
    fontWeight: "900"
  },
  cardTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
    paddingHorizontal: 10,
    paddingTop: 10
  },
  cardMeta: {
    color: "#6B7280",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 4
  }
});
