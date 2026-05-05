import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ScrollView, Dimensions,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { initDB, getCanciones, addCancion, deleteCancion, getCategorias, getSubcategorias, addCategoriaCancion, getCategoriasCancion } from '../database/db';

const { height } = Dimensions.get('window');

export default function CancionesScreen({ navigation }) {
  const [canciones, setCanciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ titulo: '', artista: '', tono: '', bpm: '' });
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [todasCategorias, setTodasCategorias] = useState([]);
  const [modalCats, setModalCats] = useState(false);

  useEffect(() => {
    initDB();
    cargarDatos();
  }, []);

  useFocusEffect(useCallback(() => {
    cargarDatos();
  }, []));

  const cargarDatos = () => {
    setCanciones(getCanciones());
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
    setCategorias([{ nombre: 'Todas', id: 0 }, ...cats]);
  };

  const cancionesFiltradas = canciones.filter(c => {
    const coincideBusqueda = c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.artista && c.artista.toLowerCase().includes(busqueda.toLowerCase()));
    if (!coincideBusqueda) return false;
    if (categoriaFiltro === 'Todas' || categoriaFiltro === 0) return true;
    const catsCan = getCategoriasCancion(c.id);
    return catsCan.some(cat => cat.id === categoriaFiltro || cat.padre_id === categoriaFiltro);
  });

  const guardarCancion = () => {
    if (!form.titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    const result = addCancion(form);
    const nuevaId = result.lastInsertRowId;
    categoriasSeleccionadas.forEach(catId => {
      addCategoriaCancion(nuevaId, catId);
    });
    setForm({ titulo: '', artista: '', tono: '', bpm: '' });
    setCategoriasSeleccionadas([]);
    setModalVisible(false);
    cargarDatos();
  };

  const confirmarEliminar = (id, titulo) => {
    Alert.alert('Eliminar', `¿Eliminar "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => { deleteCancion(id); cargarDatos(); } }
    ]);
  };

  const renderCancion = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('DetalleCancion', { cancion: item })}
      onLongPress={() => confirmarEliminar(item.id, item.titulo)}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        <Text style={styles.cardSub}>{item.artista || 'Sin artista'}{item.tono ? ` • ${item.tono}` : ''}{item.bpm ? ` • ${item.bpm} BPM` : ''}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
          {getCategoriasCancion(item.id).slice(0, 2).map(cat => (
            <View key={cat.id} style={styles.badge}>
              <Text style={styles.badgeText}>{cat.nombre}</Text>
            </View>
          ))}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar canción o artista..."
          placeholderTextColor="#aaa"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      <TouchableOpacity style={styles.categoriasBtn} onPress={() => navigation.navigate('Categorias')}>
        <Ionicons name="folder-outline" size={16} color="#7C3AED" />
        <Text style={styles.categoriasBtnText}>Gestionar categorías</Text>
        <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
        style={{ flexGrow: 0, marginBottom: 8 }}
      >
        {categorias.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filtroBtn, (categoriaFiltro === 'Todas' ? cat.id === 0 : categoriaFiltro === cat.id) && styles.filtroBtnActivo]}
            onPress={() => setCategoriaFiltro(cat.id === 0 ? 'Todas' : cat.id)}
          >
            <Text style={[styles.filtroText, (categoriaFiltro === 'Todas' ? cat.id === 0 : categoriaFiltro === cat.id) && styles.filtroTextActivo]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={cancionesFiltradas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCancion}
        removeClippedSubviews={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay canciones aún</Text>
            <Text style={styles.emptySubText}>Tocá el + para agregar tu primera canción</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        style={{ flex: 1 }}
      />

      {!modalVisible && !modalCats && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal agregar canción */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalTitulo}>Nueva Canción</Text>
                <TextInput style={styles.input} placeholder="Título *" placeholderTextColor="#aaa"
                  value={form.titulo} onChangeText={v => setForm({ ...form, titulo: v })} />
                <TextInput style={styles.input} placeholder="Artista" placeholderTextColor="#aaa"
                  value={form.artista} onChangeText={v => setForm({ ...form, artista: v })} />
                <TextInput style={styles.input} placeholder="Tono (ej: Am, C, G)" placeholderTextColor="#aaa"
                  value={form.tono} onChangeText={v => setForm({ ...form, tono: v })} />
                <TextInput style={styles.input} placeholder="BPM" placeholderTextColor="#aaa"
                  keyboardType="numeric" value={form.bpm} onChangeText={v => setForm({ ...form, bpm: v })} />
                <Text style={styles.label}>Categorías:</Text>
                <TouchableOpacity style={styles.seleccionarCatsBtn} onPress={() => {
                  cargarDatos();
                  setModalCats(true);
                }}>
                  <Ionicons name="folder-outline" size={18} color="#7C3AED" />
                  <Text style={styles.seleccionarCatsText}>
                    {categoriasSeleccionadas.length === 0 ? 'Seleccionar categorías' : `${categoriasSeleccionadas.length} seleccionada(s)`}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#7C3AED" />
                </TouchableOpacity>
                <View style={styles.modalBtns}>
                  <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnGuardar} onPress={guardarCancion}>
                    <Text style={styles.btnGuardarText}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal seleccionar categorías */}
      <Modal visible={modalCats} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: height * 0.7 }}>
            <Text style={styles.modalTitulo}>Seleccionar Categorías</Text>
            <ScrollView style={{ flex: 1, marginBottom: 12 }} contentContainerStyle={{ paddingBottom: 8 }}>
              {todasCategorias.map(cat => {
                const seleccionada = categoriasSeleccionadas.includes(cat.id);
                const colores = ['#7C3AED', '#2196F3', '#E91E63', '#FF9800'];
                const color = colores[cat.nivel] || '#888';
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catItem, { paddingLeft: 16 + cat.nivel * 16 }]}
                    onPress={() => {
                      if (seleccionada) {
                        setCategoriasSeleccionadas(prev => prev.filter(id => id !== cat.id));
                      } else {
                        setCategoriasSeleccionadas(prev => [...prev, cat.id]);
                      }
                    }}
                  >
                    <View style={[styles.catCheck, seleccionada && { backgroundColor: color, borderColor: color }]}>
                      {seleccionada && <Ionicons name="checkmark" size={14} color="#fff" />}
                    </View>
                    <Text style={[styles.catItemText, { color: seleccionada ? color : '#333' }]}>
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={{ backgroundColor: '#7C3AED', borderRadius: 10, padding: 14, alignItems: 'center' }} onPress={() => setModalCats(false)}>
              <Text style={styles.btnGuardarText}>✓ Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', margin: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, elevation: 2 },
  searchInput: { flex: 1, color: '#222', fontSize: 15 },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, elevation: 1, height: 34, justifyContent: 'center' },
  filtroBtnActivo: { backgroundColor: '#7C3AED' },
  filtroText: { color: '#888', fontSize: 13 },
  filtroTextActivo: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, paddingBottom: 18, elevation: 2 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  badge: { backgroundColor: '#EDE9FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#7C3AED', fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 18, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  label: { color: '#888', fontSize: 13, marginBottom: 8 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
  categoriasBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FF', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, gap: 8, elevation: 1 },
  categoriasBtnText: { flex: 1, color: '#7C3AED', fontSize: 15, fontWeight: '700' },
  seleccionarCatsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EDE9FF', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  seleccionarCatsText: { flex: 1, color: '#7C3AED', fontSize: 14, fontWeight: '600' },
  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  catCheck: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  catItemText: { fontSize: 14, fontWeight: '500' },
});