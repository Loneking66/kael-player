import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SectionCard } from "../components/SectionCard";
import type { MediaSection } from "../types/media";
import { MEDIA_SECTION_LABELS } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HOME_SECTIONS: MediaSection[] = ["live", "movies", "series"];
const SECTION_ICON_LABELS: Record<MediaSection, string> = {
  live: "TV",
  movies: "FL",
  series: "SR",
  other: "OT"
};

export function HomeScreen({ navigation, route }: Props) {
  const { itemsBySection } = route.params;

  const totalItems = useMemo(() => {
    return Object.values(itemsBySection).reduce((sum, items) => sum + items.length, 0);
  }, [itemsBySection]);

  function openSection(section: MediaSection) {
    navigation.navigate("Section", {
      itemsBySection,
      section
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Biblioteca carregada</Text>
        <Text style={styles.title}>Kael Player</Text>
        <Text style={styles.subtitle}>{totalItems} itens organizados a partir da lista adicionada por você.</Text>
      </View>

      <View style={styles.grid}>
        {HOME_SECTIONS.map((section) => (
          <SectionCard
            count={itemsBySection[section].length}
            iconLabel={SECTION_ICON_LABELS[section]}
            key={section}
            label={MEDIA_SECTION_LABELS[section]}
            onPress={() => openSection(section)}
          />
        ))}

        {itemsBySection.other.length > 0 ? (
          <SectionCard
            count={itemsBySection.other.length}
            iconLabel={SECTION_ICON_LABELS.other}
            label={MEDIA_SECTION_LABELS.other}
            onPress={() => openSection("other")}
          />
        ) : null}

        <SectionCard
          count={0}
          iconLabel="AJ"
          label="Configurações"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    gap: 18,
    padding: 20
  },
  header: {
    gap: 7
  },
  eyebrow: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    color: "#4B5563",
    fontSize: 15,
    lineHeight: 22
  },
  grid: {
    gap: 10
  }
});
