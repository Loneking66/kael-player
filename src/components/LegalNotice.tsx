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
    backgroundColor: "#F0FDFA",
    borderColor: "#CCFBF1",
    borderRadius: 8,
    borderWidth: 1,
    padding: 10
  },
  text: {
    color: "#0F766E",
    fontSize: 12,
    lineHeight: 17
  }
});
