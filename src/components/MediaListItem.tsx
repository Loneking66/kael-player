import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import type { MediaItem } from "../types/media";

interface MediaListItemProps {
  item: MediaItem;
  onPress: () => void;
}

export function MediaListItem({ item, onPress }: MediaListItemProps) {
  const fallbackLabel = item.name.slice(0, 2).toUpperCase();

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
          <Text style={styles.logoText}>{fallbackLabel}</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={styles.group}>
          {item.categoryName || item.groupTitle || "Sem categoria"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    minHeight: 76,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  pressed: {
    opacity: 0.72
  },
  logo: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    height: 50,
    marginRight: 12,
    width: 50
  },
  logoPlaceholder: {
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    marginRight: 12,
    width: 50
  },
  logoText: {
    color: "#0F766E",
    fontSize: 15,
    fontWeight: "900"
  },
  content: {
    flex: 1
  },
  name: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  group: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 5
  }
});
