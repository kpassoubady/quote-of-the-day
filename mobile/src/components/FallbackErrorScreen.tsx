import { StyleSheet, Text, View } from 'react-native';

export function FallbackErrorScreen() {
  return (
    <View style={styles.container} testID="app-fallback-error">
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.body}>Please restart the app.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#991B1B',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    color: '#7F1D1D',
    fontSize: 16,
    textAlign: 'center',
  },
});
