import { StyleSheet, Text, View } from 'react-native';

export function HomeScreen() {
  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Quote experience will be added in a later spec.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#374151',
    fontSize: 16,
    textAlign: 'center',
  },
});
