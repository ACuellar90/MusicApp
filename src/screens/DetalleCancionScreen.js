import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateCancion, getCategorias, getSubcategorias, getCategoriasCancion, addCategoriaCancion, removeCategoriaCancion } from '../database/db';

export default function DetalleCancionScreen({ route, navigation }) {
  const { cancion } = route.params;
  const [mostrarAcordes, setMostrarAcordes] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [todasCategorias, setTodasCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [modalCats, setModalCats] = useState(false);
  const [form, setForm] = useState({
    titulo: cancion.titulo,
    artista: cancion.artista || '',
    tono: cancion.tono || '',
    bpm: cancion.bpm ? cancion.bpm.toString() : '',
    letra: cancion.letra || '',
    acordes: cancion.acordes || '',
  });

  useEffect(() => {
    navigation.setOptions({ headerShown: !modoEdicion });
    if (modoEdicion) {
      cargarCategorias();
      const cats = getCategoriasCancion(cancion.id);
      setCategoriasSeleccionadas(cats.map(c => c.id));
    }
  }, [modoEdicion]);

  const cargarCategorias = () => {
    const cats = getCategorias();
    const todasFlat = [];
    cats.forEach(cat => {
      todasFlat.push({ ...cat, nivel: 0 });
      const subs = getSubcategorias(cat.id);
      subs.forEach(sub => {
        todasFlat.push({ ...sub, nivel: 1 });
        const subsubs = getSubcategorias(sub.id);
        subsubs.forEach(subsub => {
          todasFlat.push({ ...subsub, nivel: 2 });
        });
      });
    });
    setTodasCategorias(todasFlat);
  };

  const guardarCambios = () => {
    if (!form.titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    updateCancion(cancion.id, form);
    const catsActuales = getCategoriasCancion(cancion.id).map(c => c.id);
    catsActuales.forEach(id => removeCategoriaCancion(cancion.id, id));
    categoriasSeleccionadas.forEach(id => addCategoriaCancion(cancion.id, id));
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
            <Text style={styles.label}>Título *</Text>
            <TextInput style={styles.input} placeholderTextColor="#aaa"
              value={form.titulo} onChangeText={v => setForm({ ...form, titulo: v })} />
            
            <Text style={styles.label}>Artista</Text>
            <TextInput style={styles.input} placeholderTextColor="#aaa"
              value={form.artista} onChangeText={v => setForm({ ...form, artista: v })} />
            
            <Text style={styles.label}>Tono</Text>
            <TextInput style={styles.input} placeholder="ej: Am, C, G" placeholderTextColor="#aaa"
              value={form.tono} onChangeText={v => setForm({ ...form, tono: v })} />
            
            <Text style={styles.label}>BPM</Text>
            <TextInput style={styles.input} keyboardType="numeric" placeholderTextColor="#aaa"
              value={form.bpm ? form.bpm.toString() : ''} onChangeText={v => setForm({ ...form, bpm: v })} />

            <Text style={styles.label}>Letra</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} multiline
              value={form.letra} onChangeText={v => setForm({ ...form, letra: v })}
              placeholder="Escribe la letra aquí..." placeholderTextColor="#aaa" />

            <Text style={styles.label}>Acordes</Text>
            <TextInput style={[styles.input, styles.inputMultiline]} multiline
              value={form.acordes} onChangeText={v => setForm({ ...form, acordes: v })}
              placeholder="Escribe los acordes aquí..." placeholderTextColor="#aaa" />

            <Text style={styles.label}>Categorías:</Text>
            <TouchableOpacity style={styles.seleccionarCatsBtn} onPress={() => setModalCats(true)}>
              <Ionicons name="folder-outline" size={18} color="#7C3AED" />
              <Text style={styles.seleccionarCatsText}>
                {categoriasSeleccionadas.length === 0 ? 'Sin categorías' : `${categoriasSeleccionadas.length} seleccionada(s)`}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
            </TouchableOpacity>

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
        <TouchableOpacity style={styles.fabTeleprompter} onPress={() => navigation.navigate('Teleprompter', { cancion: { ...cancion, ...form } })}>
          <Ionicons name="play" size={22} color="#fff" />
          <Text style={styles.fabText}>Teleprompter</Text>
        </TouchableOpacity>
      )}

      {/* Modal categorías */}
      <Modal visible={modalCats} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '70%' }}>
            <Text style={styles.modalTitulo}>Seleccionar Categorías</Text>
            <ScrollView style={{ flex: 1, marginBottom: 12 }}>
              {todasCategorias.map(cat => {
                const seleccionada = categoriasSeleccionadas.includes(cat.id);
                const colores = ['#7C3AED', '#2196F3', '#E91E63', '#FF9800'];
                const color = colores[cat.nivel] || '#888';
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10, paddingLeft: 16 + cat.nivel * 16 }}
                    onPress={() => {
                      if (seleccionada) {
                        setCategoriasSeleccionadas(prev => prev.filter(id => id !== cat.id));
                      } else {
                        setCategoriasSeleccionadas(prev => [...prev, cat.id]);
                      }
                    }}
                  >
                    <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: seleccionada ? color : '#ccc', backgroundColor: seleccionada ? color : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                      {seleccionada && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: seleccionada ? color : '#333' }}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={{ backgroundColor: '#7C3AED', borderRadius: 10, padding: 14, alignItems: 'center' }} onPress={() => setModalCats(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓ Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  seleccionarCatsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FF', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  seleccionarCatsText: { flex: 1, color: '#7C3AED', fontSize: 14, fontWeight: '600' },
});