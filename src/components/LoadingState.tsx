import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingStateProps {
  message: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#0F766E" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 24
  },
  message: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center"
  }
});
