import { Pressable, StyleSheet, Text } from "react-native";

interface CategoryPillProps {
  active: boolean;
  label: string;
  onPress: () => void;
}

export function CategoryPill({ active, label, onPress }: CategoryPillProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.container, active && styles.active, pressed && styles.pressed]}
    >
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 12
  },
  active: {
    backgroundColor: "#CCFBF1",
    borderColor: "#0F766E"
  },
  pressed: {
    opacity: 0.72
  },
  label: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "700"
  },
  activeLabel: {
    color: "#0F766E"
  }
});
