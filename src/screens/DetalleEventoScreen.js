import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, FlatList, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSetlists, vincularSetlistEvento, getCancionesSetlist } from '../database/db';

const TIPOS = [
  { label: 'Misa', icon: 'musical-note', color: '#7C3AED' },
  { label: 'Ensayo', icon: 'musical-notes', color: '#2196F3' },
  { label: 'Concierto', icon: 'mic', color: '#E91E63' },
  { label: 'Otro', icon: 'calendar', color: '#FF9800' },
];

export default function DetalleEventoScreen({ route, navigation }) {
  const { evento } = route.params;
  const tipo = TIPOS.find(t => t.label === evento.tipo) || TIPOS[3];
  const [setlistVinculado, setSetlistVinculado] = useState(null);
  const [cancionesSetlist, setCancionesSetlist] = useState([]);
  const [modalSetlist, setModalSetlist] = useState(false);
  const [setlists, setSetlists] = useState([]);

  useEffect(() => {
    if (evento.setlist_id) {
      const todos = getSetlists();
      const encontrado = todos.find(s => s.id === evento.setlist_id);
      if (encontrado) {
        setSetlistVinculado(encontrado);
        setCancionesSetlist(getCancionesSetlist(encontrado.id));
      }
    }
  }, []);

  const abrirModalSetlist = () => {
    setSetlists(getSetlists());
    setModalSetlist(true);
  };

  const seleccionarSetlist = (setlist) => {
    vincularSetlistEvento(evento.id, setlist.id);
    setSetlistVinculado(setlist);
    setCancionesSetlist(getCancionesSetlist(setlist.id));
    evento.setlist_id = setlist.id;
    setModalSetlist(false);
  };

  const desvincularSetlist = () => {
    Alert.alert('Desvincular', '¿Quitar el setlist de este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => {
        vincularSetlistEvento(evento.id, null);
        setSetlistVinculado(null);
        setCancionesSetlist([]);
        evento.setlist_id = null;
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header colorido */}
      <View style={[styles.header, { backgroundColor: tipo.color }]}>
        <Ionicons name={tipo.icon} size={40} color="#fff" />
        <Text style={styles.headerTitulo}>{evento.nombre}</Text>
        <Text style={styles.headerTipo}>{evento.tipo}</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 16 }}>
        {evento.fecha ? (
          <View style={styles.infoCard}>
            <Ionicons name="calendar-outline" size={22} color={tipo.color} />
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValor}>{evento.fecha}</Text>
            </View>
          </View>
        ) : null}

        {evento.hora ? (
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={22} color={tipo.color} />
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoLabel}>Hora</Text>
              <Text style={styles.infoValor}>{evento.hora}</Text>
            </View>
          </View>
        ) : null}

        {evento.lugar ? (
          <View style={styles.infoCard}>
            <Ionicons name="location-outline" size={22} color={tipo.color} />
            <View style={styles.infoCardLeft}>
              <Text style={styles.infoLabel}>Lugar</Text>
              <Text style={styles.infoValor}>{evento.lugar}</Text>
            </View>
          </View>
        ) : null}

        {evento.notas ? (
          <View style={styles.notasCard}>
            <Text style={styles.notasLabel}>📝 Notas</Text>
            <Text style={styles.notasTexto}>{evento.notas}</Text>
          </View>
        ) : null}

        {/* Setlist vinculado */}
        <View style={styles.setlistCard}>
          <View style={styles.setlistHeader}>
            <Ionicons name="list" size={20} color="#7C3AED" />
            <Text style={styles.setlistTitulo}>Setlist del evento</Text>
            {setlistVinculado && (
              <TouchableOpacity onPress={desvincularSetlist} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-circle-outline" size={20} color="#FF4444" />
              </TouchableOpacity>
            )}
          </View>

          {setlistVinculado ? (
            <View>
              <View style={styles.setlistNombreRow}>
                <Ionicons name="musical-notes" size={16} color="#7C3AED" />
                <Text style={styles.setlistNombre}>{setlistVinculado.nombre}</Text>
              </View>
              {cancionesSetlist.map((c, index) => (
                <View key={c.id} style={styles.cancionRow}>
                  <Text style={styles.cancionNumero}>{index + 1}</Text>
                  <Text style={styles.cancionTitulo}>{c.titulo}</Text>
                  {c.tono ? <Text style={styles.cancionTono}>{c.tono}</Text> : null}
                </View>
              ))}
              <TouchableOpacity style={styles.cambiarBtn} onPress={abrirModalSetlist}>
                <Text style={styles.cambiarBtnText}>Cambiar setlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.setlistBtn} onPress={abrirModalSetlist}>
              <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
              <Text style={styles.setlistBtnText}>Vincular setlist</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Modal seleccionar setlist */}
      <Modal visible={modalSetlist} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Seleccionar Setlist</Text>
            {setlists.length === 0 ? (
              <Text style={styles.emptyText}>No hay setlists creados aún</Text>
            ) : (
              <FlatList
                data={setlists}
                keyExtractor={item => item.id.toString()}
                style={{ maxHeight: 350 }}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.modalItem} onPress={() => seleccionarSetlist(item)}>
                    <Ionicons name="list" size={20} color="#7C3AED" />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.modalItemTitulo}>{item.nombre}</Text>
                      <Text style={styles.modalItemSub}>{item.fecha || 'Sin fecha'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#bbb" />
                  </TouchableOpacity>
                )}
              />
            )}
            <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalSetlist(false)}>
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
  header: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  headerTitulo: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 12, textAlign: 'center' },
  headerTipo: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  scroll: { flex: 1 },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2, gap: 12 },
  infoCardLeft: { flex: 1 },
  infoLabel: { color: '#888', fontSize: 12 },
  infoValor: { color: '#1A1A1A', fontSize: 16, fontWeight: '600', marginTop: 2 },
  notasCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  notasLabel: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  notasTexto: { color: '#1A1A1A', fontSize: 15, lineHeight: 22 },
  setlistCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, elevation: 2 },
  setlistHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  setlistTitulo: { color: '#1A1A1A', fontSize: 16, fontWeight: 'bold' },
  setlistNombreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDE9FF', borderRadius: 8, padding: 10, marginBottom: 10 },
  setlistNombre: { color: '#7C3AED', fontWeight: 'bold', fontSize: 15 },
  cancionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 8 },
  cancionNumero: { color: '#7C3AED', fontWeight: 'bold', minWidth: 24 },
  cancionTitulo: { flex: 1, color: '#1A1A1A', fontSize: 14 },
  cancionTono: { color: '#888', fontSize: 12 },
  cambiarBtn: { marginTop: 12, padding: 10, borderRadius: 8, backgroundColor: '#E8EAF0', alignItems: 'center' },
  cambiarBtnText: { color: '#7C3AED', fontWeight: '600' },
  setlistBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EDE9FF', borderRadius: 10, padding: 12 },
  setlistBtnText: { color: '#7C3AED', fontWeight: '600', fontSize: 14 },
  emptyText: { color: '#aaa', fontSize: 15, textAlign: 'center', marginVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#1A1A1A', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalItemTitulo: { color: '#1A1A1A', fontSize: 15, fontWeight: '600' },
  modalItemSub: { color: '#888', fontSize: 13, marginTop: 2 },
  btnCancelar: { marginTop: 16, padding: 14, borderRadius: 10, backgroundColor: '#E8EAF0', alignItems: 'center' },
  btnCancelarText: { color: '#888', fontWeight: 'bold' },
});