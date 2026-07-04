import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { MediaItem } from "../types/media";

interface MediaListItemProps {
  item: MediaItem;
  onPress: () => void;
}

export function MediaListItem({ item, onPress }: MediaListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {item.tvgLogo ? (
        <Image source={{ uri: item.tvgLogo }} style={styles.logo} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>{item.name.slice(0, 1).toUpperCase()}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.group}>
          {item.groupTitle || "Sem categoria"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  pressed: {
    opacity: 0.72
  },
  logo: {
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    height: 48,
    marginRight: 12,
    width: 48
  },
  logoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 6,
    height: 48,
    justifyContent: "center",
    marginRight: 12,
    width: 48
  },
  logoText: {
    color: "#0F766E",
    fontSize: 18,
    fontWeight: "800"
  },
  content: {
    flex: 1
  },
  name: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700"
  },
  group: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4
  }
});
