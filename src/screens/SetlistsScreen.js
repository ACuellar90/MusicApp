import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { initDB } from '../database/db';

export default function SetlistsScreen({ navigation }) {
  const [setlists, setSetlists] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');

  useEffect(() => {
    initDB();
    cargarSetlists();
  }, []);

  useFocusEffect(useCallback(() => {
    cargarSetlists();
  }, []));

  const cargarSetlists = () => {
    // TODO: cargar desde SQLite
    setSetlists([]);
  };

  const guardarSetlist = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    // TODO: guardar en SQLite
    setSetlists(prev => [...prev, { id: Date.now(), nombre, fecha, canciones: [] }]);
    setNombre('');
    setFecha('');
    setModalVisible(false);
  };

  const confirmarEliminar = (id, nombre) => {
    Alert.alert('Eliminar', `¿Eliminar "${nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setSetlists(prev => prev.filter(s => s.id !== id)) }
    ]);
  };

  const renderSetlist = ({ item }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('DetalleSetlist', { setlist: item })}
      onLongPress={() => confirmarEliminar(item.id, item.nombre)}>
      <View style={styles.cardIcon}>
        <Ionicons name="list" size={24} color="#7C3AED" />
      </View>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitulo}>{item.nombre}</Text>
        <Text style={styles.cardSub}>
          {item.fecha ? `📅 ${item.fecha}` : 'Sin fecha'} • {item.canciones?.length || 0} canciones
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#bbb" />
    </TouchableOpacity>
);
  return (
    <View style={styles.container}>
      <FlatList
        data={setlists}
        keyExtractor={item => item.id.toString()}
        renderItem={renderSetlist}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No hay setlists aún</Text>
            <Text style={styles.emptySubText}>Tocá el + para crear tu primer setlist</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Nuevo Setlist</Text>
            <TextInput style={styles.input} placeholder="Nombre del setlist *"
              placeholderTextColor="#aaa" value={nombre} onChangeText={setNombre} />
            <TextInput style={styles.input} placeholder="Fecha (ej: 25/12/2026)"
              placeholderTextColor="#aaa" value={fecha} onChangeText={setFecha} />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnCancelarText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnGuardar} onPress={guardarSetlist}>
                <Text style={styles.btnGuardarText}>Crear</Text>
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
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EDE9FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 18, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#E8EAF0', color: '#222', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 15 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnCancelar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
  btnGuardar: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: '#7C3AED', alignItems: 'center' },
  btnGuardarText: { color: '#fff', fontWeight: 'bold' },
});