import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ErrorMessage } from "../components/ErrorMessage";
import { LegalNotice } from "../components/LegalNotice";
import { PrimaryButton } from "../components/PrimaryButton";
import { loadPlaylistFromUrl } from "../services/playlistService";
import { clearLastPlaylistUrl, getLastPlaylistUrl, saveLastPlaylistUrl } from "../storage/playlistStorage";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Setup">;

export function SetupScreen({ navigation }: Props) {
  const [playlistUrl, setPlaylistUrl] = useState("");
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
      navigation.replace("Home", { itemsBySection: parsed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível processar a lista adicionada.");
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }

  async function handleClearSavedUrl() {
    await clearLastPlaylistUrl();
    setPlaylistUrl("");
    setError(null);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Sua mídia, sua lista</Text>
          <Text style={styles.title}>Kael Player</Text>
          <Text style={styles.subtitle}>Adicione uma URL M3U/M3U8 sua para organizar canais, filmes e séries em uma experiência simples.</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL da lista</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onChangeText={setPlaylistUrl}
              placeholder="Cole aqui sua URL M3U/M3U8"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              value={playlistUrl}
            />
          </View>

          {error ? <ErrorMessage message={error} /> : null}

          <PrimaryButton label="Carregar lista" loading={isLoading} onPress={handleLoadPlaylist} />

          <Pressable accessibilityRole="button" onPress={handleClearSavedUrl} style={styles.textButton}>
            <Text style={styles.textButtonLabel}>Limpar URL salva</Text>
          </Pressable>
        </View>

        <LegalNotice />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  container: {
    backgroundColor: "#F8FAFC",
    flexGrow: 1,
    gap: 18,
    justifyContent: "center",
    padding: 20
  },
  hero: {
    gap: 7
  },
  eyebrow: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "900"
  },
  title: {
    color: "#111827",
    fontSize: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: "#4B5563",
    fontSize: 15,
    lineHeight: 22
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    padding: 16
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    color: "#111827",
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 12
  },
  textButton: {
    alignSelf: "center",
    minHeight: 36,
    justifyContent: "center"
  },
  textButtonLabel: {
    color: "#0F766E",
    fontSize: 14,
    fontWeight: "800"
  }
});
