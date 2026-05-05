import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCanciones, getCancionesEvento, addCancionEvento, deleteCancionEvento, updateOrdenEvento } from '../database/db';

export default function DetalleEventoScreen({ route, navigation }) {
  const { evento } = route.params;
  const [canciones, setCanciones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [repertorio, setRepertorio] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: evento.nombre });
    cargarCanciones();
  }, []);

  const cargarCanciones = () => {
    setCanciones(getCancionesEvento(evento.id));
  };

  const abrirModal = () => {
    const todas = getCanciones();
    const ids = getCancionesEvento(evento.id).map(c => c.id);
    setRepertorio(todas.filter(c => !ids.includes(c.id)));
    setModalVisible(true);
  };

  const agregarCancion = (cancion) => {
    addCancionEvento(evento.id, cancion.id, canciones.length);
    cargarCanciones();
    setModalVisible(false);
  };

  const eliminarCancion = (cancion_id) => {
    Alert.alert('Quitar', '¿Quitar esta canción del evento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => { deleteCancionEvento(evento.id, cancion_id); cargarCanciones(); } }
    ]);
  };

  const moverArriba = (index) => {
    if (index === 0) return;
    const nueva = [...canciones];
    [nueva[index - 1], nueva[index]] = [nueva[index], nueva[index - 1]];
    setCanciones(nueva);
    updateOrdenEvento(evento.id, nueva);
  };

  const moverAbajo = (index) => {
    if (index === canciones.length - 1) return;
    const nueva = [...canciones];
    [nueva[index + 1], nueva[index]] = [nueva[index], nueva[index + 1]];
    setCanciones(nueva);
    updateOrdenEvento(evento.id, nueva);
  };

  const renderCancion = ({ item, index }) => (
    <TouchableOpacity style={styles.card}
      onPress={() => navigation.navigate('Teleprompter', { cancion: item })}>
      <Text style={styles.numero}>{index + 1}</Text>
      <View style={styles.cardLeft}>
        <Text style={styles.cardTitulo}>{item.titulo}</Text>
        <Text style={styles.cardSub}>{item.artista || 'Sin artista'}{item.tono ? ` • ${item.tono}` : ''}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => moverArriba(index)} style={styles.actionBtn}>
          <Ionicons name="chevron-up" size={20} color="#7C3AED" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => moverAbajo(index)} style={styles.actionBtn}>
          <Ionicons name="chevron-down" size={20} color="#7C3AED" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => eliminarCancion(item.id)} style={styles.actionBtn}>
          <Ionicons name="close" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.infoBar}>
        <Ionicons name="calendar-outline" size={16} color="#888" />
        <Text style={styles.infoText}>{evento.fecha || 'Sin fecha'}</Text>
        {evento.hora ? <><Text style={styles.infoSep}>•</Text><Text style={styles.infoText}>{evento.hora}</Text></> : null}
        {evento.lugar ? <><Text style={styles.infoSep}>•</Text><Text style={styles.infoText}>{evento.lugar}</Text></> : null}
        <Text style={styles.infoSep}>•</Text>
        <Text style={styles.infoText}>{canciones.length} canciones</Text>
      </View>

      <FlatList
        data={canciones}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderCancion}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Sin canciones</Text>
            <Text style={styles.emptySubText}>Tocá el + para agregar canciones</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={abrirModal}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Agregar canción</Text>
            {repertorio.length === 0 ? (
              <Text style={styles.emptyText}>No hay más canciones en tu repertorio</Text>
            ) : (
              <FlatList
                data={repertorio}
                keyExtractor={item => item.id.toString()}
                style={{ maxHeight: 400 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => agregarCancion(item)}>
                    <View style={styles.modalItemLeft}>
                      <Text style={styles.modalItemTitulo}>{item.titulo}</Text>
                      <Text style={styles.modalItemSub}>{item.artista || 'Sin artista'}{item.tono ? ` • ${item.tono}` : ''}</Text>
                    </View>
                    <Ionicons name="add-circle" size={24} color="#7C3AED" />
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalVisible(false)}>
              <Text style={styles.btnCancelarText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF0' },
  infoBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, gap: 6, elevation: 1, flexWrap: 'wrap' },
  infoText: { color: '#888', fontSize: 13 },
  infoSep: { color: '#ccc' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  numero: { color: '#7C3AED', fontWeight: 'bold', fontSize: 18, minWidth: 28 },
  cardLeft: { flex: 1 },
  cardTitulo: { color: '#1A1A1A', fontSize: 15, fontWeight: 'bold' },
  cardSub: { color: '#888', fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 4 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 16 },
  emptySubText: { color: '#bbb', fontSize: 13, marginTop: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#7C3AED', width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemLeft: { flex: 1 },
  modalItemTitulo: { color: '#1A1A1A', fontSize: 15, fontWeight: '600' },
  modalItemSub: { color: '#888', fontSize: 13, marginTop: 2 },
  btnCancelar: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
});