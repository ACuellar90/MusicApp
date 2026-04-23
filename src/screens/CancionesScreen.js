import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { initDB, getCanciones, addCancion, deleteCancion, getCategorias } from '../database/db';

export default function CancionesScreen({ navigation }) {
  const [canciones, setCanciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ titulo: '', artista: '', tono: '', bpm: '', categoria: 'General' });

  useEffect(() => {
    initDB();
    cargarDatos();
  }, []);

  useFocusEffect(useCallback(() => {
    cargarDatos();
  }, []));

  const cargarDatos = () => {
    setCanciones(getCanciones());
    setCategorias([{ nombre: 'Todas' }, ...getCategorias()]);
  };

  const cancionesFiltradas = canciones.filter(c => {
    const coincideBusqueda = c.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (c.artista && c.artista.toLowerCase().includes(busqueda.toLowerCase()));
    const coincideCategoria = categoriaFiltro === 'Todas' || c.categoria === categoriaFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  const guardarCancion = () => {
    if (!form.titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }
    addCancion(form);
    setForm({ titulo: '', artista: '', tono: '', bpm: '', categoria: 'General' });
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
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.categoria}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Buscador */}
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

      {/* Filtro categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtros}>
        {categorias.map(cat => (
          <TouchableOpacity
            key={cat.nombre}
            style={[styles.filtroBtn, categoriaFiltro === cat.nombre && styles.filtroBtnActivo]}
            onPress={() => setCategoriaFiltro(cat.nombre)}
          >
            <Text style={[styles.filtroText, categoriaFiltro === cat.nombre && styles.filtroTextActivo]}>
              {cat.nombre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={cancionesFiltradas}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCancion}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay canciones aún</Text>
            <Text style={styles.emptySubText}>Tocá el + para agregar tu primera canción</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal agregar */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
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

            <Text style={styles.label}>Categoría:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {categorias.filter(c => c.nombre !== 'Todas').map(cat => (
                <TouchableOpacity
                  key={cat.nombre}
                  style={[styles.filtroBtn, form.categoria === cat.nombre && styles.filtroBtnActivo]}
                  onPress={() => setForm({ ...form, categoria: cat.nombre })}
                >
                  <Text style={[styles.filtroText, form.categoria === cat.nombre && styles.filtroTextActivo]}>
                    {cat.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={guardarCancion}>
                <Text style={styles.btnGuardarText}>Guardar</Text>
              </TouchableOpacity>
            </View>
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
  filtros: { paddingHorizontal: 16, marginBottom: 8, maxHeight: 40 },
  filtroBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 8, elevation: 1 },
  filtroBtnActivo: { backgroundColor: '#7C3AED' },
  filtroText: { color: '#888', fontSize: 13 },
  filtroTextActivo: { color: '#fff', fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  badge: { marginTop: 6, alignSelf: 'flex-start', backgroundColor: '#EDE9FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
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
});