import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ChannelListScreen } from "../screens/ChannelListScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { PlayerScreen } from "../screens/PlayerScreen";
import { SeriesDetailsScreen } from "../screens/SeriesDetailsScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#F9FAFB",
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: "#F9FAFB" }
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Kael Player" }} />
      <Stack.Screen name="ChannelList" component={ChannelListScreen} options={{ title: "Conteudo da lista" }} />
      <Stack.Screen name="SeriesDetails" component={SeriesDetailsScreen} options={{ title: "Episodios" }} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ title: "Player" }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Configuracoes" }} />
    </Stack.Navigator>
  );
}
