import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ChannelListScreen } from "../screens/ChannelListScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PlayerScreen } from "../screens/PlayerScreen";
import { SectionScreen } from "../screens/SectionScreen";
import { SeriesDetailsScreen } from "../screens/SeriesDetailsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SetupScreen } from "../screens/SetupScreen";
import { TitleDetailsScreen } from "../screens/TitleDetailsScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Setup"
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#F9FAFB",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#F8FAFC" }
      }}
    >
      <Stack.Screen name="Setup" component={SetupScreen} options={{ title: "Kael Player" }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Inicio", headerBackVisible: false }} />
      <Stack.Screen name="Section" component={SectionScreen} options={{ title: "Conteudo" }} />
      <Stack.Screen name="TitleDetails" component={TitleDetailsScreen} options={{ title: "Detalhes" }} />
      <Stack.Screen name="ChannelList" component={ChannelListScreen} options={{ title: "Conteudo da lista" }} />
      <Stack.Screen name="SeriesDetails" component={SeriesDetailsScreen} options={{ title: "Episodios" }} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ title: "Player" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Configuracoes" }} />
    </Stack.Navigator>
  );
}
