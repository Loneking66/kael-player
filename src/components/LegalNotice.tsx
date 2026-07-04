import { StyleSheet, Text, View } from "react-native";

import { LEGAL_DISCLAIMER } from "../constants/legal";

export function LegalNotice() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{LEGAL_DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ECFEFF",
    borderColor: "#67E8F9",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  text: {
    color: "#155E75",
    fontSize: 13,
    lineHeight: 18
  }
});
