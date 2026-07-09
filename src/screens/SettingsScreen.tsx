import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LegalNotice } from "../components/LegalNotice";
import { PrimaryButton } from "../components/PrimaryButton";
import { clearLastPlaylistUrl } from "../storage/playlistStorage";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  function goToSetup() {
    navigation.reset({
      index: 0,
      routes: [{ name: "Setup" }]
    });
  }

  function handleChangeList() {
    goToSetup();
  }

  async function handleClearUrl() {
    try {
      await clearLastPlaylistUrl();
      Alert.alert("URL removida", "A última URL salva foi removida deste dispositivo.");
      goToSetup();
    } catch {
      Alert.alert("Erro", "Não foi possível limpar a URL salva.");
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Troque a lista atual ou limpe a URL salva neste dispositivo.</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.blockTitle}>Lista do usuário</Text>
          <Text style={styles.text}>O Kael Player não fornece conteúdo. Para usar outra lista, volte para a tela inicial e adicione uma nova URL.</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Trocar lista" onPress={handleChangeList} />
          <PrimaryButton label="Limpar URL salva" onPress={handleClearUrl} variant="danger" />
        </View>

        <LegalNotice />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    flex: 1
  },
  content: {
    gap: 16,
    padding: 20
  },
  header: {
    gap: 6
  },
  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  blockTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900"
  },
  text: {
    color: "#4B5563",
    fontSize: 14,
    lineHeight: 21
  },
  actions: {
    gap: 10
  }
});
