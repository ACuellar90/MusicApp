import { View, Text, StyleSheet } from 'react-native';

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📅 Agenda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1B2A', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#C9A84C', fontSize: 24, fontWeight: 'bold' },
});