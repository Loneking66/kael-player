import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LegalNotice } from "../components/LegalNotice";
import { clearLastPlaylistUrl } from "../storage/playlistStorage";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  async function handleClearUrl() {
    try {
      await clearLastPlaylistUrl();
      Alert.alert("URL removida", "A última URL salva foi removida deste dispositivo.");
      navigation.goBack();
    } catch {
      Alert.alert("Erro", "Não foi possível limpar a URL salva.");
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Configurações</Text>
        <LegalNotice />

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Privacidade no MVP</Text>
          <Text style={styles.text}>O app salva apenas a última URL adicionada neste dispositivo. Não há login, coleta de dados, scraping ou armazenamento de senhas nesta versão.</Text>
        </View>

        <Pressable accessibilityRole="button" onPress={handleClearUrl} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
          <Text style={styles.dangerButtonText}>Limpar URL salva</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
    flex: 1
  },
  content: {
    gap: 18,
    padding: 20
  },
  title: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "800"
  },
  block: {
    gap: 8
  },
  blockTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800"
  },
  text: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21
  },
  dangerButton: {
    alignItems: "center",
    backgroundColor: "#B91C1C",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  }
});
