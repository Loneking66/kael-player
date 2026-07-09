import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function PrimaryButton({ label, loading = false, onPress, variant = "primary" }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[variant], (pressed || loading) && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={variant === "secondary" ? "#0F766E" : "#FFFFFF"} /> : <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 16
  },
  primary: {
    backgroundColor: "#0F766E"
  },
  secondary: {
    backgroundColor: "#FFFFFF",
    borderColor: "#99F6E4",
    borderWidth: 1
  },
  danger: {
    backgroundColor: "#B91C1C"
  },
  label: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryLabel: {
    color: "#0F766E"
  },
  pressed: {
    opacity: 0.72
  }
});
