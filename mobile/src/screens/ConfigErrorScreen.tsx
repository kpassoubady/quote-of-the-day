import { StyleSheet, Text, View } from 'react-native';

import type { ConfigError } from '../config/types';

interface ConfigErrorScreenProps {
  error: ConfigError;
}

export function ConfigErrorScreen({ error }: ConfigErrorScreenProps) {
  return (
    <View style={styles.container} testID="config-error-screen">
      <Text style={styles.title}>Configuration error</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Text style={styles.meta}>Field: {error.field}</Text>
      <Text style={styles.hint}>{error.hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF7ED',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#9A3412',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    color: '#7C2D12',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  meta: {
    color: '#9A3412',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  hint: {
    color: '#7C2D12',
    fontSize: 14,
    textAlign: 'center',
  },
});
