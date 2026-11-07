import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function FullScreenLoader() {
  return (
    <View style={styles.container} testID="global-loader">
      <ActivityIndicator size="large" />
      <Text style={styles.label}>Loading app…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
  label: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '500',
  },
});
