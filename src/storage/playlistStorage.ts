import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_PLAYLIST_URL_KEY = "@kael-player:last-playlist-url";

export async function getLastPlaylistUrl() {
  return AsyncStorage.getItem(LAST_PLAYLIST_URL_KEY);
}

export async function saveLastPlaylistUrl(url: string) {
  await AsyncStorage.setItem(LAST_PLAYLIST_URL_KEY, url);
}

export async function clearLastPlaylistUrl() {
  await AsyncStorage.removeItem(LAST_PLAYLIST_URL_KEY);
}
