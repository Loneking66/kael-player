import { StyleSheet, Text, View } from "react-native";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Algo nao saiu como esperado</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 12
  },
  title: {
    color: "#7F1D1D",
    fontSize: 13,
    fontWeight: "800"
  },
  message: {
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20
  }
});
