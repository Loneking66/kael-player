import { Pressable, StyleSheet, Text, View } from "react-native";

interface SectionCardProps {
  count: number;
  iconLabel: string;
  label: string;
  onPress: () => void;
}

export function SectionCard({ count, iconLabel, label, onPress }: SectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{iconLabel}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>{count} itens</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
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
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  pressed: {
    opacity: 0.72
  },
  icon: {
    alignItems: "center",
    backgroundColor: "#CCFBF1",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginRight: 12,
    width: 44
  },
  iconText: {
    color: "#0F766E",
    fontSize: 13,
    fontWeight: "900"
  },
  content: {
    flex: 1
  },
  label: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800"
  },
  count: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4
  },
  arrow: {
    color: "#0F766E",
    fontSize: 26,
    lineHeight: 26
  }
});
