import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { LegalNotice } from "../components/LegalNotice";
import { SectionCard } from "../components/SectionCard";
import { loadPlaylistFromUrl } from "../services/playlistService";
import { clearLastPlaylistUrl, getLastPlaylistUrl, saveLastPlaylistUrl } from "../storage/playlistStorage";
import type { MediaSection, SectionedMedia } from "../types/media";
import { MEDIA_SECTION_LABELS } from "../types/media";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const SECTION_ORDER: MediaSection[] = ["live", "movies", "series", "other"];

export function HomeScreen({ navigation }: Props) {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [itemsBySection, setItemsBySection] = useState<SectionedMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    getLastPlaylistUrl()
      .then((url) => {
        if (url) {
          setPlaylistUrl(url);
        }
      })
      .catch(() => {
        setError("Não foi possível ler a URL salva neste dispositivo.");
      });
  }, []);

  const totalItems = useMemo(() => {
    if (!itemsBySection) {
      return 0;
    }

    return Object.values(itemsBySection).reduce((sum, items) => sum + items.length, 0);
  }, [itemsBySection]);

  async function handleLoadPlaylist() {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setError(null);
    setIsLoading(true);

    try {
      const parsed = await loadPlaylistFromUrl(playlistUrl);
      await saveLastPlaylistUrl(playlistUrl.trim());
      setItemsBySection(parsed);
    } catch (err) {
      setItemsBySection(null);
      setError(err instanceof Error ? err.message : "Não foi possível processar a lista adicionada.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }

  async function handleClearSavedUrl() {
    try {
      await clearLastPlaylistUrl();
      setPlaylistUrl("");
      setItemsBySection(null);
      setError(null);
      Alert.alert("URL removida", "A última URL salva foi removida deste dispositivo.");
    } catch {
      setError("Não foi possível limpar a URL salva.");
    }
  }

  function openSection(section: MediaSection) {
    if (!itemsBySection) {
      return;
    }

    navigation.navigate("ChannelList", {
      itemsBySection,
      initialSection: section
    });
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Kael Player</Text>
          <Text style={styles.subtitle}>Reprodutor para mídia fornecida pelo usuário.</Text>
        </View>

        <LegalNotice />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>URL M3U/M3U8 adicionada pelo usuário</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={setPlaylistUrl}
            placeholder="https://exemplo.invalid/minha-lista.m3u8"
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            value={playlistUrl}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={handleLoadPlaylist}
            style={({ pressed }) => [styles.primaryButton, (pressed || isLoading) && styles.buttonPressed]}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Carregar lista</Text>}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate("Settings")}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          >
            <Text style={styles.secondaryButtonText}>Ajustes</Text>
          </Pressable>
        </View>

        <Pressable accessibilityRole="button" onPress={handleClearSavedUrl} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Limpar lista salva</Text>
        </Pressable>

        {itemsBySection ? (
          <View style={styles.sections}>
            <Text style={styles.sectionTitle}>{totalItems} itens encontrados</Text>
            {SECTION_ORDER.map((section) => (
              <SectionCard
                count={itemsBySection[section].length}
                key={section}
                label={MEDIA_SECTION_LABELS[section]}
                onPress={() => openSection(section)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    gap: 18,
    padding: 20
  },
  header: {
    gap: 6
  },
  title: {
    color: "#111827",
    fontSize: 34,
    fontWeight: "800"
  },
  subtitle: {
    color: "#4B5563",
    fontSize: 15,
    lineHeight: 21
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "700"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12
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
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0F766E",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#0F766E",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16
  },
  secondaryButtonText: {
    color: "#0F766E",
    fontSize: 15,
    fontWeight: "800"
  },
  buttonPressed: {
    opacity: 0.72
  },
  clearButton: {
    alignSelf: "flex-start",
    paddingVertical: 4
  },
  clearButtonText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "700"
  },
  sections: {
    gap: 10
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2
  }
});
