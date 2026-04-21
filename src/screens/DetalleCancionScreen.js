import { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateCancion } from '../database/db';

export default function DetalleCancionScreen({ route, navigation }) {
  const { cancion } = route.params;
  const [mostrarAcordes, setMostrarAcordes] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [form, setForm] = useState({
    titulo: cancion.titulo,
    artista: cancion.artista || '',
    tono: cancion.tono || '',
    bpm: cancion.bpm ? cancion.bpm.toString() : '',
    letra: cancion.letra || '',
    acordes: cancion.acordes || '',
  });

  const guardarCambios = () => {
    if (!form.titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    updateCancion(cancion.id, form);
    setModoEdicion(false);
    navigation.setParams({ cancion: { ...cancion, ...form } });
    Alert.alert('✅ Guardado', 'Canción actualizada correctamente');
  };

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.titulo}>{cancion.titulo}</Text>
          <Text style={styles.sub}>
            {cancion.artista || 'Sin artista'}
            {cancion.tono ? ` • ${cancion.tono}` : ''}
            {cancion.bpm ? ` • ${cancion.bpm} BPM` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setModoEdicion(!modoEdicion)}>
          <Ionicons name={modoEdicion ? 'close' : 'pencil'} size={22} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Toggle acordes */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !mostrarAcordes && styles.toggleBtnActivo]}
          onPress={() => setMostrarAcordes(false)}
        >
          <Text style={[styles.toggleText, !mostrarAcordes && styles.toggleTextActivo]}>Solo letra</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mostrarAcordes && styles.toggleBtnActivo]}
          onPress={() => setMostrarAcordes(true)}
        >
          <Text style={[styles.toggleText, mostrarAcordes && styles.toggleTextActivo]}>Letra + Acordes</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {modoEdicion ? (
          <View>
            <Text style={styles.label}>Letra</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              multiline
              value={form.letra}
              onChangeText={v => setForm({ ...form, letra: v })}
              placeholder="Escribe la letra aquí..."
              placeholderTextColor="#aaa"
            />
            <Text style={styles.label}>Acordes</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              multiline
              value={form.acordes}
              onChangeText={v => setForm({ ...form, acordes: v })}
              placeholder="Escribe los acordes aquí..."
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity style={styles.btnGuardar} onPress={guardarCambios}>
              <Text style={styles.btnGuardarText}>Guardar cambios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {mostrarAcordes && cancion.acordes ? (
              <View style={styles.acordesBox}>
                <Text style={styles.acordesLabel}>Acordes</Text>
                <Text style={styles.acordesText}>{cancion.acordes}</Text>
              </View>
            ) : null}
            <Text style={styles.letraText}>
              {cancion.letra || 'No hay letra agregada aún.\nTocá el lápiz para editar.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón teleprompter */}
      {!modoEdicion && (
        <TouchableOpacity style={styles.fabTeleprompter}>
          <Ionicons name="play" size={22} color="#fff" />
          <Text style={styles.fabText}>Teleprompter</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, elevation: 2 },
  headerLeft: { flex: 1 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  sub: { color: '#888', fontSize: 13, marginTop: 2 },
  toggleRow: { flexDirection: 'row', margin: 16, backgroundColor: '#fff', borderRadius: 12, padding: 4, elevation: 1 },
  toggleBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  toggleBtnActivo: { backgroundColor: '#7C3AED' },
  toggleText: { color: '#888', fontSize: 13, fontWeight: '600' },
  toggleTextActivo: { color: '#fff' },
  scroll: { flex: 1 },
  acordesBox: { backgroundColor: '#EDE9FF', borderRadius: 12, padding: 14, marginBottom: 16 },
  acordesLabel: { color: '#7C3AED', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  acordesText: { color: '#4A4A6A', fontSize: 14, fontFamily: 'monospace' },
  letraText: { color: '#1A1A1A', fontSize: 16, lineHeight: 26 },
  label: { color: '#888', fontSize: 13, marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#fff', color: '#222', borderRadius: 10, padding: 12, fontSize: 15 },
  inputMultiline: { minHeight: 150, textAlignVertical: 'top', marginBottom: 12 },
  btnGuardar: { backgroundColor: '#7C3AED', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  btnGuardarText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  fabTeleprompter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', margin: 16, borderRadius: 14, padding: 14, elevation: 4, gap: 8 },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});