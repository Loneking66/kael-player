import { Pressable, StyleSheet, Text, View } from "react-native";

interface SectionCardProps {
  label: string;
  count: number;
  onPress: () => void;
}

export function SectionCard({ label, count, onPress }: SectionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View>
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
    justifyContent: "space-between",
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  pressed: {
    opacity: 0.72
  },
  label: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "700"
  },
  count: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 4
  },
  arrow: {
    color: "#0F766E",
    fontSize: 28,
    lineHeight: 28
  }
});
