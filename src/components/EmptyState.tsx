import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  title: string;
  message: string;
}

export function EmptyState({ message, title }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 28
  },
  title: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center"
  }
});
