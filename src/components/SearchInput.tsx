import { StyleSheet, TextInput, View } from "react-native";

interface SearchInputProps {
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}

export function SearchInput({ onChangeText, placeholder, value }: SearchInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1
  },
  input: {
    color: "#111827",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12
  }
});
